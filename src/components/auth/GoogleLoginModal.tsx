import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, deriveRoleFromEmail } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/auth";
import {
  X,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Phone,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Check,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SavedAccount {
  email: string;
  name: string;
  avatar: string;
}

const SAVED_ACCOUNTS_KEY = "hon_saved_google_accounts";

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    loginWithGoogle,
    loginWithGoogleCredential,
    isLoggedIn,
    googleUser,
    role,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"google" | "phone">("google");
  const [googleStep, setGoogleStep] = useState<"select_account" | "enter_email" | "consent">("select_account");

  // Saved accounts state from localStorage
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);

  // Email / Name inputs
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Mobile Phone OTP fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpStep, setOtpStep] = useState<"input" | "verify">("input");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === "verify" && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, resendTimer]);

  // Google Identity Services (GIS) Official OAuth Initialization
  useEffect(() => {
    if (!isOpen || !window.google?.accounts?.id) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response?.credential && loginWithGoogleCredential) {
            setLoading(true);
            const user = await loginWithGoogleCredential(response.credential);
            setLoading(false);
            if (user) {
              saveAccountToHistory({
                email: user.email,
                name: user.name,
                avatar: user.picture || "",
              });
              toast.success(`Welcome to House of Nuts, ${user.name}!`);
              onSuccess?.();
              onClose();
              performNavigation(user.email);
            }
          }
        },
      });
      const container = document.getElementById("google-signin-btn-container");
      if (container) {
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
        });
      }
    } catch {
      // Graceful fallback
    }
  }, [isOpen, loginWithGoogleCredential]);

  if (!isOpen) return null;

  const performNavigation = (email: string) => {
    const userRole = deriveRoleFromEmail(email);
    if (userRole === "developer") {
      navigate("/admin/developer", { replace: true });
    } else if (userRole === "admin" || userRole === "staff") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/account", { replace: true });
    }
  };

  const handleChooseAccount = (acct: SavedAccount) => {
    setSelectedAccount(acct);
    setGoogleStep("consent");
  };

  const saveAccountToHistory = (acct: SavedAccount) => {
    const updated = [acct, ...savedAccounts.filter((a) => a.email.toLowerCase() !== acct.email.toLowerCase())].slice(0, 4);
    setSavedAccounts(updated);
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAuthorizeGoogleConsent = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      await loginWithGoogle(
        selectedAccount.email,
        selectedAccount.name,
        selectedAccount.avatar
      );
      saveAccountToHistory(selectedAccount);
      toast.success(`Signed in as ${selectedAccount.name}`);
      onSuccess?.();
      onClose();
      performNavigation(selectedAccount.email);
    } catch {
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
      setGoogleStep("select_account");
    }
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid Google or email address.");
      return;
    }
    const derivedName = nameInput.trim() || emailInput.split("@")[0].replace(/[._]/g, " ");
    const newAcct: SavedAccount = {
      email: emailInput.trim(),
      name: derivedName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=2b2419&color=faf7f2`,
    };
    setSelectedAccount(newAcct);
    setGoogleStep("consent");
  };

  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpStep("verify");
    setResendTimer(30);
    setOtpDigits(["", "", "", ""]);
    toast.success(`Verification OTP sent to +91 ${cleanNumber}. (Demo Code: 1234)`);
  };

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = otpDigits.join("");
    if (codeStr.length < 4) {
      toast.error("Please enter the 4-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      const userEmail = `member_${cleanNumber.slice(-4)}@houseofnuts.com`;
      await loginWithGoogle(userEmail, `Customer (+91 ${cleanNumber})`);
      toast.success("Mobile number verified successfully!");
      onSuccess?.();
      onClose();
      performNavigation(userEmail);
    } catch {
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="min-h-full w-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative my-auto w-full max-w-[420px] bg-background border border-border/80 rounded-2xl shadow-2xl overflow-hidden font-body text-foreground space-y-0">
          
          {/* Authentic Google Sign-In Top Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-card">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-sm font-medium text-foreground tracking-tight">
                Sign in with Google
              </span>
            </div>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close"
              className="size-7 rounded-full bg-secondary hover:bg-accent/15 text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/80 rounded-xl border border-border/50 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("google")}
                className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "google"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail size={13} /> Google Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("phone")}
                className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "phone"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone size={13} /> Mobile Phone
              </button>
            </div>

            {/* Already Logged In Session Bar */}
            {(googleUser || isLoggedIn) && (
              <div className="bg-clay-light border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-accent text-accent-foreground grid place-items-center font-bold text-sm shrink-0">
                    {googleUser?.picture ? (
                      <img src={googleUser.picture} alt={googleUser.name} className="size-full rounded-full object-cover" />
                    ) : (
                      (googleUser?.name || ROLE_LABELS[role] || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{googleUser?.name || ROLE_LABELS[role]}</p>
                    <p className="text-xs text-muted-foreground truncate">{googleUser?.email || `${role}@houseofnuts.com`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-secondary hover:bg-accent/15 text-foreground text-xs font-medium rounded-lg border border-border transition-colors"
                  >
                    <UserCheck size={14} /> My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-secondary hover:bg-accent/15 text-foreground text-xs font-medium rounded-lg border border-border transition-colors"
                  >
                    <ShoppingBag size={14} /> My Orders
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast.info("Signed out");
                  }}
                  className="w-full text-xs text-destructive hover:underline text-center pt-1"
                >
                  Sign out from current session
                </button>
              </div>
            )}

            {/* GOOGLE TAB */}
            {activeTab === "google" && !(googleUser || isLoggedIn) && (
              <div className="space-y-5">
                
                {/* STEP 1: CHOOSE AN ACCOUNT */}
                {googleStep === "select_account" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Brand Banner */}
                    <div className="text-center space-y-1">
                      <img
                        src="/images/branding/house-of-nuts-logo-hd.png"
                        alt="House of Nuts"
                        className="size-12 rounded-full object-contain mx-auto border border-border p-1 bg-white shadow-xs"
                      />
                      <h3 className="font-display text-2xl font-normal text-foreground tracking-tight pt-1">
                        Choose an account
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        to continue to <span className="text-blue-600 dark:text-blue-400 font-medium">House of Nuts</span>
                      </p>
                    </div>

                    {/* Official Google Identity Services OAuth Button */}
                    <div id="google-signin-btn-container" className="flex justify-center my-3 min-h-[40px]"></div>

                    {/* Accounts List */}
                    <div className="border-t border-b border-border/80 divide-y divide-border/60">
                      {savedAccounts.map((acct) => (
                        <button
                          key={acct.email}
                          type="button"
                          onClick={() => handleChooseAccount(acct)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/70 transition-colors text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-9 rounded-full bg-accent/20 text-accent grid place-items-center font-bold text-xs shrink-0 overflow-hidden">
                              {acct.avatar ? (
                                <img src={acct.avatar} alt={acct.name} className="size-full object-cover" />
                              ) : (
                                acct.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{acct.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{acct.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-mono">
                            Signed out
                          </span>
                        </button>
                      ))}

                      {/* Use another account option */}
                      <button
                        type="button"
                        onClick={() => setGoogleStep("enter_email")}
                        className="w-full flex items-center gap-3 p-3.5 hover:bg-secondary/70 transition-colors text-left cursor-pointer group"
                      >
                        <div className="size-9 rounded-full border border-border grid place-items-center text-muted-foreground group-hover:border-accent group-hover:text-accent transition-colors shrink-0">
                          <User size={16} />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          Use another account
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: ENTER EMAIL / PHONE */}
                {googleStep === "enter_email" && (
                  <form onSubmit={handleEmailFormSubmit} className="space-y-4 animate-in fade-in duration-200">
                    <div className="text-center space-y-1">
                      <img
                        src="/images/branding/house-of-nuts-logo-hd.png"
                        alt="House of Nuts"
                        className="size-12 rounded-full object-contain mx-auto border border-border p-1 bg-white shadow-xs"
                      />
                      <h3 className="font-display text-2xl font-normal text-foreground tracking-tight pt-1">
                        Sign in with Google
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        to continue to <span className="text-blue-600 dark:text-blue-400 font-medium">House of Nuts</span>
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                          Email or Phone
                        </label>
                        <input
                          type="email"
                          required
                          autoFocus
                          placeholder="you@gmail.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full border border-border bg-background px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                          Your Name <span className="text-muted-foreground/60">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full border border-border bg-background px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {savedAccounts.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setGoogleStep("select_account")}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          &larr; Back to account list
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        Next <ArrowRight size={13} />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: GOOGLE PERMISSION CONSENT SCREEN */}
                {googleStep === "consent" && selectedAccount && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <div className="size-10 rounded-full bg-accent/15 text-accent grid place-items-center font-bold text-sm shrink-0 overflow-hidden">
                        {selectedAccount.avatar ? (
                          <img src={selectedAccount.avatar} alt={selectedAccount.name} className="size-full object-cover" />
                        ) : (
                          selectedAccount.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{selectedAccount.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{selectedAccount.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">House of Nuts will receive:</p>
                      <div className="space-y-2 text-[11px] bg-secondary/40 p-3 rounded-xl border border-border/60">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Check size={14} className="text-emerald-500 shrink-0" /> Basic profile info & profile image
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Check size={14} className="text-emerald-500 shrink-0" /> Primary email address for order notifications
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Check size={14} className="text-emerald-500 shrink-0" /> Cross-device cart and wishlist sync
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setGoogleStep("select_account")}
                        className="py-2 px-4 border border-border text-xs rounded-xl hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleAuthorizeGoogleConsent}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : "Allow & Continue"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Authentic Google Footer */}
                <div className="pt-3 border-t border-border/70 space-y-3 text-center text-[11px] text-muted-foreground">
                  <p className="leading-relaxed">
                    Before using this app, you can review House of Nuts's{" "}
                    <Link to="/journal" onClick={onClose} className="text-blue-600 dark:text-blue-400 hover:underline">
                      privacy policy
                    </Link>{" "}
                    and{" "}
                    <Link to="/journal" onClick={onClose} className="text-blue-600 dark:text-blue-400 hover:underline">
                      terms of service
                    </Link>
                    .
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                    <span className="cursor-pointer hover:underline">English (United States) &#9660;</span>
                    <div className="flex gap-3">
                      <span className="cursor-pointer hover:underline">Help</span>
                      <span className="cursor-pointer hover:underline">Privacy</span>
                      <span className="cursor-pointer hover:underline">Terms</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* MOBILE PHONE TAB */}
            {activeTab === "phone" && (
              <div className="space-y-4 pt-1 font-body">
                {otpStep === "input" ? (
                  <form onSubmit={handleSendMobileOtp} className="space-y-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                        Mobile Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary border border-border px-3 py-2.5 text-xs font-mono rounded-xl shrink-0">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full border border-border bg-background px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-accent rounded-xl"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-3 uppercase tracking-[0.14em] text-xs font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-2xl shadow-soft cursor-pointer"
                    >
                      Get Verification OTP <Sparkles size={14} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyMobileOtp} className="space-y-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Enter 4-digit OTP sent to{" "}
                      <span className="font-semibold text-foreground font-mono">
                        +91 {phoneNumber}
                      </span>
                    </p>

                    <div className="flex justify-center gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1);
                            const next = [...otpDigits];
                            next[idx] = val;
                            setOtpDigits(next);
                          }}
                          className="size-11 text-center font-mono text-lg font-bold border border-border rounded-xl bg-background focus:border-accent focus:outline-none"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOtpDigits(["1", "2", "3", "4"])}
                      className="text-[11px] text-accent hover:underline font-mono"
                    >
                      ⚡ Paste Demo Code (1234)
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent text-accent-foreground py-3 uppercase tracking-[0.14em] text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2 rounded-2xl shadow-soft cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          Verify & Continue <CheckCircle2 size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GoogleLoginModal;
