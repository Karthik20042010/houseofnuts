import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickGoogleSignIn = async (gEmail: string, gName: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(gEmail, gName);
      toast.success(`Signed in as ${gName} (${gEmail})`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid Google Mail address.");
      return;
    }
    const derivedName = name.trim() || email.split("@")[0].replace(/[._]/g, " ");
    await handleQuickGoogleSignIn(email, derivedName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-background border border-border rounded-sm shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="size-12 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-2">
            <Mail size={24} />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold">Sign in to Checkout</h2>
          <p className="text-xs text-muted-foreground font-body">
            Please sign in with your <span className="font-medium text-foreground">Google Mail</span> account to complete your order.
          </p>
        </div>

        {/* 1-Click Google Sign-In Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickGoogleSignIn("customer@gmail.com", "House of Nuts Customer")}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-300 py-3 px-4 rounded-sm shadow-xs hover:bg-gray-50 transition-all font-body text-sm font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue with Google Mail"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              or enter email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Manual Google Email Input Form */}
          <form onSubmit={handleCustomFormSubmit} className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">
                Your Google Email
              </label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm font-body focus:outline-none focus:border-accent rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm font-body focus:outline-none focus:border-accent rounded-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
            >
              Sign In & Continue Order <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-body pt-2 border-t border-border">
          <ShieldCheck size={14} className="text-accent shrink-0" />
          <span>Your order details & receipt will be synced directly to your Google email.</span>
        </div>
      </div>
    </div>
  );
};
