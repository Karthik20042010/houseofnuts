import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, UserCheck, X } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, googleUser, logoutGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithGoogle(email, name || email.split("@")[0]);
      toast.success(`Welcome back, ${user.name}! Authenticated via Google OAuth.`);
      onClose();
    } catch (err) {
      toast.error("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-background border border-border max-w-md w-full rounded-md shadow-2xl p-6 relative font-body space-y-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white border border-border grid place-items-center shadow-xs">
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Sign in with Google</h3>
            <p className="text-xs text-muted-foreground">Sync your orders, wishlist and member profile</p>
          </div>
        </div>

        {googleUser ? (
          <div className="bg-clay-light p-4 rounded border border-border space-y-3">
            <div className="flex items-center gap-3">
              <img src={googleUser.picture} alt={googleUser.name} className="size-10 rounded-full" />
              <div>
                <div className="font-medium text-sm">{googleUser.name}</div>
                <div className="text-xs text-muted-foreground">{googleUser.email}</div>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px] uppercase flex items-center gap-1">
                <UserCheck size={12} /> Google Authenticated
              </span>
            </div>
            <button
              onClick={() => {
                logoutGoogle();
                toast.info("Logged out from Google Account");
              }}
              className="w-full text-xs text-destructive hover:underline pt-2 text-center"
            >
              Sign out from Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleGoogleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Google Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@gmail.com"
                className="w-full border border-border px-3 py-2 text-sm bg-background rounded focus:outline-none focus:border-accent font-body"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full border border-border px-3 py-2 text-sm bg-background rounded focus:outline-none focus:border-accent font-body"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4285F4] text-white py-2.5 px-4 text-xs font-medium uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-[#3367D6] transition-colors"
            >
              <LogIn size={14} /> Continue with Google OAuth
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthModal;
