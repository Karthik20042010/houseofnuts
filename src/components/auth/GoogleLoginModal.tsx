import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, deriveRoleFromEmail } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/auth";
import {
  X,
  Mail,
  Loader2,
  Phone,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  User,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
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
const DEFAULT_CLIENT_ID = "9652526920-houseofnuts.apps.googleusercontent.com";

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
  const [gisLoaded, setGisLoaded] = useState(false);
  const [gisError, setGisError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Saved accounts state from localStorage (only populated via real OAuth verification)
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

  const saveAccountToHistory = (acct: SavedAccount) => {
    const updated = [
      acct,
      ...savedAccounts.filter((a) => a.email.toLowerCase() !== acct.email.toLowerCase()),
    ].slice(0, 4);
    setSavedAccounts(updated);
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Initialize Official Google Identity Services (GIS) OAuth 2.0 SDK
  useEffect(() => {
    if (!isOpen || activeTab !== "google") return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

    const initGis = () => {
      if (!window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
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
                toast.success(`Welcome back, ${user.name}!`);
                onSuccess?.();
                onClose();
                performNavigation(user.email);
              } else {
                toast.error("Google authentication failed. Please try again.");
              }
            }
          },
        });

        const container = document.getElementById("google-signin-btn-container");
        if (container) {
          container.innerHTML = "";
          window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
            width: "320",
          });
        }

        // Trigger Google One-Tap native account selector popup
        window.google.accounts.id.prompt();
        setGisLoaded(true);
        setGisError(false);
        return true;
      } catch (err) {
        console.error("GIS initialization failed:", err);
        setGisError(true);
        return false;
      }
    };

    if (!initGis()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (initGis()) {
          clearInterval(interval);
        } else if (attempts >= 15) {
          clearInterval(interval);
          setGisError(true);
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab, loginWithGoogleCredential]);

  if (!isOpen) return null;

  const handlePromptGoogleOAuth = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.info("Loading Google Identity Services... Please wait.");
    }
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
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/70 bg-card">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-sm font-medium text-foreground tracking-tight">
                Google OAuth 2.0 Sign In
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
                <Mail size={13} /> Continue with Google
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

            {/* Currently Logged-in Active Session Box */}
            {(googleUser || isLoggedIn) && (
              <div className="bg-clay-light border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-accent text-accent-foreground grid place-items-center font-bold text-sm shrink-0 overflow-hidden">
                    {googleUser?.picture ? (
                      <img src={googleUser.picture} alt={googleUser.name} className="size-full object-cover" />
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
                  className="w-full text-xs text-destructive hover:underline text-center pt-1 cursor-pointer"
                >
                  Sign out from current session
                </button>
              </div>
            )}

            {/* TAB 1: GOOGLE SIGN-IN */}
            {activeTab === "google" && !(googleUser || isLoggedIn) && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Brand Banner */}
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

                {/* Official Google Identity Services OAuth Button Widget Container */}
                <div className="flex flex-col items-center justify-center my-3 min-h-[50px] space-y-2">
                  <div id="google-signin-btn-container" className="flex justify-center w-full min-h-[44px]"></div>
                  
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 font-mono">
                      <Loader2 size={14} className="animate-spin text-blue-600" />
                      Verifying Google credentials...
                    </div>
                  )}
                </div>

                {/* Account Picker Trigger Button */}
                <button
                  type="button"
                  onClick={handlePromptGoogleOAuth}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary hover:bg-accent/15 border border-border text-xs font-semibold rounded-xl text-foreground transition-colors cursor-pointer"
                >
                  <User size={14} className="text-blue-600" />
                  <span>Choose Another Google Account</span>
                </button>

                {/* Previously Verified Google Accounts List */}
                {savedAccounts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/80">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Recently Signed In Accounts
                    </p>
                    <div className="border border-border/70 rounded-xl divide-y divide-border/60 overflow-hidden bg-card">
                      {savedAccounts.map((acct) => (
                        <button
                          key={acct.email}
                          type="button"
                          onClick={handlePromptGoogleOAuth}
                          className="w-full flex items-center justify-between p-3 hover:bg-secondary/70 transition-colors text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-full bg-accent/20 text-accent grid place-items-center font-bold text-xs shrink-0 overflow-hidden">
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
                          <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">
                            Select &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {gisError && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Google Client SDK Unreachable
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Make sure your internet connection is active and third-party cookies or pop-up blockers are disabled.
                    </p>
                  </div>
                )}

                {/* Official Google Footer Links */}
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

            {/* TAB 2: MOBILE PHONE TAB */}
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

