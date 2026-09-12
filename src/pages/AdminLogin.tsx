import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_LABELS } from "@/types/auth";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin";
import Header from "@/components/Header";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
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
  KeyRound,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type AuthTab = "google" | "phone" | "staff";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, login, isLoggedIn, googleUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("google");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Email / Password Login fields (Clean unrevealed inputs)
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Staff Role Password Login fields
  const [rolePassword, setRolePassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("staff");

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

  // Staff / Portal Role Password Form Handler
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          setIsGoogleModalOpen(false);
        }}
      />

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
              <Lock size={12} className="text-muted-foreground" /> Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "staff"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck size={13} /> Staff Login
            </button>
          </div>

          {/* TAB 1: GOOGLE OAUTH & EMAIL FORM */}
          {activeTab === "google" && (
            <div className="space-y-4 pt-1">
              {/* Clean Google OAuth Button -> Opens Google Account Chooser & Consent Screen */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
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

          {/* TAB 2: MOBILE PHONE OTP (LOCKED FOR INITIAL RELEASE) */}
          {activeTab === "phone" && (
            <div className="space-y-4 pt-1 text-center py-6 border border-dashed border-border rounded-2xl bg-secondary/30">
              <div className="size-12 rounded-full bg-muted border border-border grid place-items-center mx-auto text-muted-foreground">
                <Lock size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-body font-semibold text-foreground flex items-center justify-center gap-1.5">
                  Mobile OTP Sign In <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-mono">Coming Soon</span>
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto font-body">
                  Mobile phone OTP authentication is locked for the v1 release. Please sign in using Google OAuth or Email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("google")}
                className="text-xs text-accent font-semibold hover:underline"
              >
                Use Google / Email Login &rarr;
              </button>
            </div>
          )}

          {/* TAB 3: STAFF & PORTAL ROLE LOGIN */}
          {activeTab === "staff" && (
            <form onSubmit={handleRolePasswordSubmit} className="space-y-4 pt-1 font-body">
              <div>
                <label className="flex items-center gap-1.5 mb-2 text-muted-foreground">
                  <UserCheck size={14} className="text-accent" />
                  <span className="text-xs uppercase tracking-[0.15em] font-medium">Select Access Portal</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["staff", "admin"] as UserRole[]).map((r) => (
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
                      {r === "staff" ? "Staff Portal" : "Admin Portal"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
                  <Lock size={14} className="text-accent" />
                  <span className="text-xs uppercase tracking-[0.15em] font-medium">Portal Key Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={rolePassword}
                    onChange={(e) => setRolePassword(e.target.value)}
                    placeholder="Enter portal password"
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
                Sign In to {selectedRole === "staff" ? "Staff Portal" : "Admin Portal"}
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
