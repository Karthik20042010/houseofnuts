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
    if (role === "user") {
      return <Navigate to="/account" replace />;
    }

    const badge = ROLE_BADGES[role];
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-body">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-2">Restricted Access</h2>
        <p className="text-muted-foreground max-w-md text-xs mb-5">
          Your account role (<Badge variant={badge.variant}>{ROLE_LABELS[role]}</Badge>) is restricted from accessing this area.
        </p>
        <a
          href="/account"
          className="inline-flex items-center gap-2 text-xs bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-accent transition-colors shadow-xs"
        >
          <ArrowLeft size={15} /> Return to My Account
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
