import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, UserCheck, ArrowRight, KeyRound } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin";
import { UserRole, ROLE_LABELS } from "@/types/auth";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAdminLoggedIn()) {
    navigate("/admin", { replace: true });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await adminLogin(password, selectedRole);
    setLoading(false);
    if (res.ok) {
      toast.success(`Welcome to House of Nuts Admin Portal (${ROLE_LABELS[selectedRole]})`);
      if (selectedRole === "developer") {
        navigate("/admin/developer", { replace: true });
      } else {
        navigate("/admin", { replace: true });
      }
    } else {
      setError(res.error || "Login failed");
      toast.error(res.error || "Invalid password for selected role.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-earth text-foreground">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(700px circle at 30% 20%, hsl(var(--accent) / 0.25), transparent 70%), radial-gradient(600px circle at 70% 80%, hsl(var(--sun) / 0.2), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border border-border/70 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="size-16 rounded-full bg-accent/10 border border-accent/20 grid place-items-center mx-auto p-2.5 shadow-soft">
            <img
              src="/images/branding/house-of-nuts-logo-hd.png"
              alt="House of Nuts Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            House of Nuts
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-body font-semibold">
            Role-Based Portal Access
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="flex items-center gap-1.5 mb-2 text-muted-foreground">
              <UserCheck size={14} className="text-accent" />
              <span className="text-xs uppercase tracking-[0.15em] font-body font-medium">Select Portal Role</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "developer", "staff"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2.5 px-2 text-xs font-body border rounded-2xl transition-all text-center capitalize ${
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

          {/* Password Input */}
          <div>
            <label className="flex items-center gap-1.5 mb-1.5 text-muted-foreground">
              <Lock size={14} className="text-accent" />
              <span className="text-xs uppercase tracking-[0.15em] font-body font-medium">Role Password</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-border bg-background px-4 py-3 pr-11 font-body text-sm focus:outline-none focus:border-accent transition-colors rounded-2xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-xs font-body bg-destructive/10 border border-destructive/20 rounded-xl p-3">
              {/cannot reach/i.test(error)
                ? "Can't reach the server. Check your internet connection or backend URL."
                : /not configured/i.test(error)
                ? "No admin password set. Configure adminPassword in your Sheet Config tab."
                : error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-semibold font-body hover:bg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-2xl shadow-soft active:scale-[0.99]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />}
            Log In as {ROLE_LABELS[selectedRole]}
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-body pt-2 border-t border-border/60">
          <ShieldCheck size={14} className="text-accent shrink-0" />
          <span>Configured via Google Sheets Apps Script Backend</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
