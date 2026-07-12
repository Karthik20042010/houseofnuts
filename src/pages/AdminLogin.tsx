import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { adminLogin, isAdminLoggedIn } from "@/lib/admin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-clay-light">
      <form onSubmit={submit} className="w-full max-w-sm bg-background border border-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} className="text-accent" />
          <h1 className="font-display text-2xl">Admin Login</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body mb-6">
          Enter the admin password set in your Google Sheet's <span className="font-medium text-foreground">Config</span> tab.
        </p>
        <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
          required
        />
        {error && <p className="text-destructive text-sm font-body mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Log In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
