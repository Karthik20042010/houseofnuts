import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, Permission, ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { ShieldAlert, ArrowLeft, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: keyof Permission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { isLoggedIn, role, hasPermission, hasRole, switchRole } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleAllowed = !allowedRoles || hasRole(allowedRoles);
  const permAllowed = !requiredPermission || hasPermission(requiredPermission);

  if (!roleAllowed || !permAllowed) {
    const badge = ROLE_BADGES[role];
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-4 animate-bounce">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md text-sm mb-4">
          Your current role (<Badge variant={badge.variant}>{ROLE_LABELS[role]}</Badge>) does not have permission to view this page.
        </p>

        <div className="bg-card border border-border p-4 rounded-md max-w-md w-full mb-6 text-left">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <KeyRound size={14} /> Available Role Testing
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Switch your role to access this area:
          </p>
          <div className="flex flex-wrap gap-2">
            {(["admin", "developer", "staff"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  role === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Switch to {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          <ArrowLeft size={16} /> Return to Admin Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
