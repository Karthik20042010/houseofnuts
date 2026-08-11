import React from "react";
import { ShieldCheck, UserCheck, Key, Lock, Check, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

export const AdminRoleManagement: React.FC = () => {
  const { role, switchRole } = useAuth();

  const permissionKeys = [
    { key: "canViewOrders", label: "View Customer Orders" },
    { key: "canManageOrders", label: "Update Order & Payment Status" },
    { key: "canManageInventory", label: "Edit Product Stock & Variants" },
    { key: "canManageImages", label: "Upload & Manage Product Images" },
    { key: "canAccessDevConsole", label: "Access Developer Diagnostics & API Console" },
    { key: "canManageRoles", label: "Manage Roles & System Security" },
    { key: "canViewAnalytics", label: "View Sales & Revenue Analytics" },
  ] as const;

  const roles: UserRole[] = ["admin", "developer", "staff", "user"];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-accent" /> Role & Access Control Management
          </h1>
          <Badge variant="destructive" className="uppercase font-mono text-[10px]">
            Admin Only
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Configure security policies, inspect permissions matrices, and test active user role switching.
        </p>
      </div>

      {/* Active Role Control Card */}
      <div className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" /> Active Session Role
            </h3>
            <p className="text-sm text-muted-foreground">
              Currently acting as: <span className="font-bold text-foreground">{ROLE_LABELS[role]}</span>
            </p>
          </div>
          <Badge variant={ROLE_BADGES[role].variant} className="text-xs px-3 py-1">
            {ROLE_BADGES[role].label}
          </Badge>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-medium border transition-all ${
                role === r
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:border-accent hover:bg-accent/5"
              }`}
            >
              <Key size={14} />
              Switch to {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-accent" /> Role Permissions Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Feature / Action</th>
                {roles.map((r) => (
                  <th key={r} className="py-3 px-4 text-center">
                    <span className="block">{ROLE_LABELS[r]}</span>
                    <Badge variant={ROLE_BADGES[r].variant} className="text-[10px] mt-1 font-mono">
                      {r}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {permissionKeys.map(({ key, label }) => (
                <tr key={key} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium">{label}</td>
                  {roles.map((r) => {
                    const allowed = ROLE_PERMISSIONS[r][key];
                    return (
                      <td key={r} className="py-3 px-4 text-center">
                        {allowed ? (
                          <span className="inline-grid place-items-center size-6 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mx-auto">
                            <Check size={14} />
                          </span>
                        ) : (
                          <span className="inline-grid place-items-center size-6 rounded-full bg-muted text-muted-foreground mx-auto">
                            <X size={14} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Security Info */}
      <div className="bg-accent/10 border border-accent/20 rounded-sm p-4 text-xs font-body flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-0.5">Security Enforcement Note</p>
          <p className="text-muted-foreground leading-relaxed">
            Role definitions and permissions are stored locally in the auth state and verified at every route transition using <code>ProtectedRoute</code>. Super admin credentials remain anchored to your Google Apps Script Config sheet password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
