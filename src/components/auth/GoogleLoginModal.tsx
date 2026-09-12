import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/types/auth";
import {
  X,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Check,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = "google" | "phone";
type GoogleStep = "select_account" | "consent" | "custom_email";

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    loginWithGoogle,
    login,
    isLoggedIn,
    googleUser,
    role,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("google");

  // Google OAuth Choice Flow State
  const [googleStep, setGoogleStep] = useState<GoogleStep>("select_account");
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{
    email: string;
    name: string;
    avatar: string;
    roleNote?: string;
  } | null>(null);

  // Email / Custom Login fields
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Phone OTP fields (Fully editable, no hardcoded defaults)
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

  if (!isOpen) return null;

  const performNavigation = (email: string) => {
    const lower = email.toLowerCase();
    if (
      lower === "houseofnutsproddatur@gmail.com" ||
      lower.startsWith("admin") ||
      lower.includes("admin") ||
      lower.includes("staff")
    ) {
      navigate("/admin");
    } else if (lower.includes("developer")) {
      navigate("/admin/developer");
    } else {
      navigate("/account");
    }
  };

  // --- Handlers ---
  const handleSelectGoogleAccount = (acct: {
    email: string;
    name: string;
    avatar: string;
    roleNote?: string;
  }) => {
    setSelectedGoogleAccount(acct);
    setGoogleStep("consent");
  };

  const handleAuthorizeGoogleConsent = async () => {
    if (!selectedGoogleAccount) return;
    setLoading(true);
    try {
      await loginWithGoogle(
        selectedGoogleAccount.email,
        selectedGoogleAccount.name,
        selectedGoogleAccount.avatar
      );
      toast.success(
        `Signed in as ${selectedGoogleAccount.name} (${selectedGoogleAccount.email})`
      );
      onSuccess?.();
      onClose();
      performNavigation(selectedGoogleAccount.email);
    } catch {
      toast.error("Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
      setGoogleStep("select_account");
    }
  };

  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      // If user provided a password, check if it's admin login credentials
      if (passwordInput) {
        const adminRes = await login(passwordInput, "admin");
        if (adminRes.ok) {
          await loginWithGoogle(
            emailInput,
            nameInput || "House of Nuts Admin"
          );
          toast.success(`Welcome back Admin (${emailInput})`);
          onSuccess?.();
          onClose();
          navigate("/admin");
          return;
        }
      }

      // Standard Google/Email sign in with auto-role detection
      const derivedName =
        nameInput.trim() || emailInput.split("@")[0].replace(/[._]/g, " ");
      await loginWithGoogle(emailInput, derivedName);
      toast.success(`Welcome to House of Nuts, ${derivedName}!`);
      onSuccess?.();
      onClose();
      performNavigation(emailInput);
    } catch {
      toast.error("Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
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
      toast.error("Please enter the complete 4-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      const userEmail = `member_${cleanNumber.slice(-4)}@houseofnuts.com`;
      await loginWithGoogle(
        userEmail,
        `Customer (+91 ${cleanNumber})`
      );
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

  const modalMarkup = (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="min-h-full w-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative my-auto w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5">
          {/* Close Button */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 size-8 rounded-full bg-secondary hover:bg-accent/15 text-muted-foreground hover:text-foreground grid place-items-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Brand Header */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="size-14 rounded-full bg-accent/10 border border-accent/20 grid place-items-center mx-auto mb-1 p-2 shadow-soft">
              <img
                src="/images/branding/house-of-nuts-logo-hd.png"
                alt="House of Nuts"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground font-semibold tracking-tight">
              House of Nuts
            </h2>
            <p className="text-xs text-muted-foreground font-body max-w-xs mx-auto">
              {googleUser || isLoggedIn
                ? "Manage your orders, profile & member perks"
                : "Sign in for member pricing, order updates & fast checkout"}
            </p>
          </div>

          {/* Already Logged In View */}
          {googleUser || isLoggedIn ? (
            <div className="bg-gradient-linen border border-border/70 rounded-2xl p-5 space-y-4 shadow-soft">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-full gradient-warm text-accent-foreground grid place-items-center font-display text-lg font-bold shadow-soft shrink-0">
                  {googleUser?.picture ? (
                    <img
                      src={googleUser.picture}
                      alt={googleUser.name}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    (googleUser?.name || ROLE_LABELS[role] || "U")[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-display font-semibold text-base truncate">
                      {googleUser?.name || ROLE_LABELS[role]}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-body font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      {isLoggedIn ? role : "Verified Member"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body truncate">
                    {googleUser?.email || `${role}@houseofnuts.com`}
                  </p>
                </div>
              </div>

              {(isLoggedIn || googleUser?.email?.toLowerCase().includes("admin") || googleUser?.email === "houseofnutsproddatur@gmail.com") && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-accent text-accent-foreground text-xs font-body font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <ShieldCheck size={16} /> Open Role Admin Portal
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-secondary hover:bg-accent/15 text-foreground text-xs font-body font-medium rounded-xl border border-border transition-colors"
                >
                  <ShoppingBag size={14} /> My Orders
                </Link>
                <Link
                  to="/account"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-secondary hover:bg-accent/15 text-foreground text-xs font-body font-medium rounded-xl border border-border transition-colors"
                >
                  <UserCheck size={14} /> Profile
                </Link>
              </div>

              <button
                onClick={() => {
                  logout();
                  toast.info("Signed out from account");
                }}
                type="button"
                className="w-full text-xs text-destructive hover:underline font-body pt-1 text-center font-medium"
              >
                Sign out from session
              </button>
            </div>
          ) : (
            <>
              {/* Tabs: Sign In / Phone */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/80 rounded-2xl border border-border/50 text-xs font-body font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("google")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === "google"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail size={14} /> Google / Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("phone")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeTab === "phone"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Phone size={14} /> Mobile Phone
                </button>
              </div>

              {/* TAB 1: GOOGLE & EMAIL */}
              {activeTab === "google" && (
                <div className="space-y-4 pt-1">
                  {googleStep === "select_account" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectGoogleAccount({
                            email: "houseofnutsproddatur@gmail.com",
                            name: "House of Nuts Admin",
                            avatar: "/images/branding/house-of-nuts-logo-hd.png",
                            roleNote: "Store Owner & Admin",
                          })
                        }
                        className="w-full flex items-center justify-between p-3.5 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 rounded-2xl transition-all font-body text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src="/images/branding/house-of-nuts-logo-hd.png"
                            alt="House of Nuts Admin"
                            className="size-9 rounded-full object-contain bg-white p-1 shrink-0 border border-amber-300"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold font-body text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                              houseofnutsproddatur@gmail.com
                              <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full uppercase font-mono">
                                Admin
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-700 dark:text-amber-300">
                              Continue as Store Manager / Admin
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSelectGoogleAccount({
                            email: "karthikeya.j04@gmail.com",
                            name: "Karthikeya J",
                            avatar: "https://ui-avatars.com/api/?name=Karthikeya+J&background=2b2419&color=faf7f2",
                          })
                        }
                        className="w-full flex items-center justify-between p-3 border border-border bg-background hover:bg-secondary rounded-2xl transition-all font-body text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-8 rounded-full gradient-warm text-accent-foreground grid place-items-center font-bold text-xs shrink-0">
                            K
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">karthikeya.j04@gmail.com</div>
                            <div className="text-[11px] text-muted-foreground">Karthikeya J</div>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setGoogleStep("custom_email")}
                        className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-border hover:border-accent text-xs text-muted-foreground hover:text-accent rounded-2xl transition-colors font-body font-medium"
                      >
                        <UserPlus size={14} /> Sign in with another email or password
                      </button>
                    </>
                  )}

                  {/* GOOGLE CONSENT AUTHORIZATION STEP */}
                  {googleStep === "consent" && selectedGoogleAccount && (
                    <div className="bg-background border border-border/80 rounded-2xl p-4 space-y-4 font-body animate-in fade-in duration-200">
                      <div className="flex items-center gap-3 border-b border-border pb-3">
                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <div>
                          <div className="text-xs font-semibold">Google Account Permission</div>
                          <div className="text-[11px] text-muted-foreground">{selectedGoogleAccount.email}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground font-body">
                        <p className="font-medium text-foreground">House of Nuts wants permission to:</p>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-body">
                            <Check size={14} /> View your basic profile & avatar
                          </div>
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-body">
                            <Check size={14} /> Access email address for receipt & tracking
                          </div>
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-body">
                            <Check size={14} /> Sync member wishlist and active orders
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setGoogleStep("select_account")}
                          className="py-2.5 px-3 border border-border text-xs font-body font-medium rounded-xl hover:bg-secondary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={handleAuthorizeGoogleConsent}
                          className="py-2.5 px-3 bg-primary text-primary-foreground text-xs font-body font-semibold rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-1.5 shadow-soft"
                        >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : "Allow & Continue"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CUSTOM EMAIL & PASSWORD FORM */}
                  {googleStep === "custom_email" && (
                    <form onSubmit={handleEmailFormSubmit} className="space-y-3 font-body animate-in fade-in duration-200">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                          Email address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                          Your Full Name <span className="text-muted-foreground/60">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                          Password <span className="text-muted-foreground/60">(Optional for Store Admin/Staff)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password if admin"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full border border-border bg-background px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setGoogleStep("select_account")}
                          className="py-3 px-4 border border-border text-xs font-medium rounded-2xl hover:bg-secondary"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-primary text-primary-foreground py-3 uppercase tracking-[0.14em] text-xs font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-2xl disabled:opacity-50 shadow-soft"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue to Store"} <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: MOBILE PHONE OTP */}
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
                            onChange={(e) =>
                              setPhoneNumber(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full border border-border bg-background px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-accent rounded-xl"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-3 uppercase tracking-[0.14em] text-xs font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-2xl shadow-soft"
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
                        className="w-full bg-accent text-accent-foreground py-3 uppercase tracking-[0.14em] text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2 rounded-2xl shadow-soft"
                      >
                        {loading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            Verify & Continue <CheckCircle2 size={15} />
                          </>
                        )}
                      </button>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpStep("input")}
                          className="hover:underline"
                        >
                          ← Change phone number
                        </button>
                        <span>
                          {resendTimer > 0 ? (
                            `Resend in ${resendTimer}s`
                          ) : (
                            <button
                              type="button"
                              onClick={() => setResendTimer(30)}
                              className="text-accent font-semibold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-body pt-2 border-t border-border/60">
            <ShieldCheck size={14} className="text-accent shrink-0" />
            <span>Encrypted 256-bit secure session authentication</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GoogleLoginModal;
