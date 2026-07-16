import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff, Nut } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
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
    const res = await adminLogin(password);
    setLoading(false);
    if (res.ok) navigate("/admin", { replace: true });
    else setError(res.error || "Login failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-clay-light">
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        background: "radial-gradient(600px circle at 20% 20%, hsl(var(--accent) / 0.15), transparent 60%), radial-gradient(500px circle at 80% 80%, hsl(var(--sun) / 0.15), transparent 60%)"
      }} />
      <form onSubmit={submit} className="relative w-full max-w-sm bg-background border border-border p-8 rounded-sm shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-9 rounded-sm bg-primary text-primary-foreground grid place-items-center">
            <Nut size={16} />
          </div>
          <div>
            <div className="font-display text-xl leading-tight">House of Nuts</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Admin Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-6 mb-2 text-muted-foreground">
          <Lock size={14} />
          <span className="text-xs uppercase tracking-[0.15em] font-body">Password</span>
        </div>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-background px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:border-accent transition-colors rounded-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {error && (
          <p className="text-destructive text-sm font-body mt-3">
            {/cannot reach/i.test(error)
              ? "Can't reach the server. Check your internet or the Apps Script URL."
              : error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Log In
        </button>
        <p className="text-[11px] text-muted-foreground font-body mt-6 text-center">
          Password lives in your Sheet's <span className="font-medium text-foreground">Config</span> tab.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
