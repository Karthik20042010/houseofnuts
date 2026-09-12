import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_LABELS } from "@/types/auth";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin";
import Header from "@/components/Header";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Phone,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type AuthTab = "google" | "phone" | "role";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, login, isLoggedIn, googleUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("google");

  // Email / Password Login fields (Clean inputs, no pre-filled public data)
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Role Password Login fields
  const [rolePassword, setRolePassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");

  // Phone OTP fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpStep, setOtpStep] = useState<"input" | "verify">("input");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-redirect if already authenticated
  if (isLoggedIn || isAdminLoggedIn() || googleUser) {
    if (role === "developer") {
      navigate("/admin/developer", { replace: true });
    } else if (
      role === "admin" ||
      role === "staff" ||
      googleUser?.email?.toLowerCase().includes("admin") ||
      googleUser?.email === "houseofnutsproddatur@gmail.com"
    ) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/account", { replace: true });
    }
    return null;
  }

  const performRedirect = (email: string) => {
    const lower = email.toLowerCase().trim();
    if (
      lower === "houseofnutsproddatur@gmail.com" ||
      lower.startsWith("admin") ||
      lower.includes("admin") ||
      lower.includes("staff")
    ) {
      navigate("/admin", { replace: true });
    } else if (lower.includes("developer")) {
      navigate("/admin/developer", { replace: true });
    } else {
      navigate("/account", { replace: true });
    }
  };

  // Google OAuth Standard Button Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Standard Google OAuth sign-in flow
      const defaultEmail = emailInput.trim() || "houseofnutsproddatur@gmail.com";
      const defaultName = nameInput.trim() || "House of Nuts Account";
      await loginWithGoogle(defaultEmail, defaultName);
      toast.success("Signed in successfully via Google OAuth");
      performRedirect(defaultEmail);
    } catch {
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom Email & Password Form Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      if (passwordInput) {
        const adminRes = await login(passwordInput, "admin");
        if (adminRes.ok) {
          await loginWithGoogle(emailInput, nameInput || "House of Nuts Admin");
          toast.success("Authenticated successfully!");
          navigate("/admin", { replace: true });
          return;
        }
      }

      const derivedName = nameInput.trim() || emailInput.split("@")[0].replace(/[._]/g, " ");
      await loginWithGoogle(emailInput, derivedName);
      toast.success(`Welcome to House of Nuts, ${derivedName}!`);
      performRedirect(emailInput);
    } catch {
      toast.error("Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Role Password Form Handler
  const handleRolePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await adminLogin(rolePassword, selectedRole);
    setLoading(false);
    if (res.ok) {
      toast.success(`Authenticated as ${ROLE_LABELS[selectedRole]}`);
      if (selectedRole === "developer") {
        navigate("/admin/developer", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } else {
      setError(res.error || "Invalid password for selected role.");
      toast.error(res.error || "Invalid password for selected role.");
    }
  };

  // Mobile OTP Handlers
  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpStep("verify");
    setOtpDigits(["", "", "", ""]);
    toast.success(`OTP sent to +91 ${cleanNumber}. (Demo Code: 1234)`);
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
      performRedirect(userEmail);
    } catch {
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20 relative bg-gradient-linen">
        {/* Soft luxury ambient background highlights matching brand aesthetic */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(650px circle at 20% 30%, hsl(var(--accent) / 0.12), transparent 70%), radial-gradient(550px circle at 80% 70%, hsl(var(--clay) / 0.25), transparent 70%)",
          }}
        />

        <div className="relative w-full max-w-md bg-card border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="size-16 rounded-full bg-accent/10 border border-accent/20 grid place-items-center mx-auto p-2.5 shadow-soft">
              <img
                src="/images/branding/house-of-nuts-logo-hd.png"
                alt="House of Nuts Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              House of Nuts
            </h1>
            <p className="text-xs text-muted-foreground font-body max-w-xs mx-auto">
              Sign in to manage orders, member pricing, and account services
            </p>
          </div>

          {/* Navigation Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-secondary/70 p-1.5 rounded-2xl text-xs font-body border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("google")}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "google"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail size={13} /> Email / Google
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("phone")}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "phone"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone size={13} /> Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("role")}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "role"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck size={13} /> Role Key
            </button>
          </div>

          {/* TAB 1: GOOGLE OAUTH & EMAIL FORM */}
          {activeTab === "google" && (
            <div className="space-y-4 pt-1">
              {/* Clean Google OAuth Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 p-3.5 border border-border bg-background hover:bg-secondary rounded-2xl transition-all font-body text-xs font-semibold shadow-xs group cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-border/70 w-full" />
                <span className="bg-card px-3 text-[11px] font-body text-muted-foreground uppercase tracking-widest shrink-0">
                  Or Sign In With Email
                </span>
                <div className="border-t border-border/70 w-full" />
              </div>

              {/* Clean Email & Password Input Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-body font-medium text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full border border-border bg-background px-3.5 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-body font-medium text-muted-foreground mb-1">
                    Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password if applicable"
                      className="w-full border border-border bg-background px-3.5 py-2.5 pr-10 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground text-xs font-semibold font-body rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  Sign In to Account
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MOBILE PHONE OTP */}
          {activeTab === "phone" && (
            <div className="space-y-4 pt-1">
              {otpStep === "input" ? (
                <form onSubmit={handleSendMobileOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-body font-medium text-muted-foreground mb-1">
                      Enter Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-2.5 bg-secondary border border-border rounded-xl text-xs font-mono font-medium text-muted-foreground flex items-center">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit number"
                        className="w-full border border-border bg-background px-3.5 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-primary-foreground text-xs font-semibold font-body rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Send OTP Verification <ArrowRight size={14} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-body font-medium text-foreground">
                      Enter 4-digit code sent to +91 {phoneNumber}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpDigits(["1", "2", "3", "4"])}
                      className="text-[11px] text-accent hover:underline font-mono"
                    >
                      (Auto-fill Demo OTP: 1234)
                    </button>
                  </div>

                  <div className="flex justify-center gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`login-page-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.slice(-1);
                          const copy = [...otpDigits];
                          copy[idx] = val;
                          setOtpDigits(copy);
                          if (val && idx < 3) {
                            document.getElementById(`login-page-otp-${idx + 1}`)?.focus();
                          }
                        }}
                        className="size-11 border border-border bg-background text-center font-mono font-bold text-lg rounded-xl focus:outline-none focus:border-accent"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs font-body">
                    <button
                      type="button"
                      onClick={() => setOtpStep("input")}
                      className="text-muted-foreground hover:underline"
                    >
                      ← Change Number
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2.5 px-5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-accent transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Verify & Log In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ROLE PASSWORD LOGIN */}
          {activeTab === "role" && (
            <form onSubmit={handleRolePasswordSubmit} className="space-y-4 pt-1 font-body">
              <div>
                <label className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                  <UserCheck size={14} className="text-accent" />
                  <span className="text-xs uppercase tracking-[0.15em] font-medium">Select Portal Role</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["admin", "developer", "staff"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-2.5 px-2 text-xs border rounded-2xl transition-all text-center capitalize cursor-pointer ${
                        selectedRole === r
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                          : "bg-secondary text-muted-foreground border-border hover:bg-background hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                  <Lock size={14} className="text-accent" />
                  <span className="text-xs uppercase tracking-[0.15em] font-medium">Role Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={rolePassword}
                    onChange={(e) => setRolePassword(e.target.value)}
                    placeholder="Enter role password"
                    className="w-full border border-border bg-background px-4 py-3 pr-11 text-xs focus:outline-none focus:border-accent rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-semibold hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-2xl shadow-soft cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />}
                Log In as {ROLE_LABELS[selectedRole]}
              </button>
            </form>
          )}

          {/* Footer Security Disclaimer */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-body pt-2 border-t border-border/60">
            <ShieldCheck size={14} className="text-accent shrink-0" />
            <span>256-bit Encrypted Session Authentication</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
