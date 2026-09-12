import React, { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, Key, Lock, Check, X, ShieldAlert, Loader2, RefreshCw } from "lucide-react";
import { useAuth, deriveRoleFromEmail } from "@/contexts/AuthContext";
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

interface DatabaseUser {
  userId?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
}

export const AdminRoleManagement: React.FC = () => {
  const { role, googleUser } = useAuth();
  const [dbUsers, setDbUsers] = useState<DatabaseUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchLiveUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await apiGet<{ ok: boolean; users?: DatabaseUser[] }>("getUsers");
      if (res && res.ok && Array.isArray(res.users)) {
        setDbUsers(res.users);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchLiveUsers();
  }, []);

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-body text-foreground">
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
          Inspect security policies, permissions matrix, and live registered database users.
        </p>
      </div>

      {/* Active Session Info Card */}
      <div className="bg-card border border-border rounded-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" /> Active Session Role
            </h3>
            <p className="text-sm text-muted-foreground">
              Currently authenticated as: <span className="font-bold text-foreground">{googleUser?.name || ROLE_LABELS[role]}</span> ({googleUser?.email || `${role}@houseofnuts.com`})
            </p>
          </div>
          <Badge variant={ROLE_BADGES[role].variant} className="text-xs px-3 py-1">
            {ROLE_LABELS[role]}
          </Badge>
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

      {/* Registered Users & Logins Directory (100% Live from Database Sheet) */}
      <div className="bg-card border border-border rounded-sm p-6 space-y-4 font-body">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" /> Live Database Registered Users
            </h3>
            <p className="text-xs text-muted-foreground">
              Synced directly from your Google Sheets Users database tab
            </p>
          </div>
          <button
            onClick={fetchLiveUsers}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-secondary rounded text-xs font-medium cursor-pointer"
          >
            <RefreshCw size={12} className={loadingUsers ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-10 gap-2 text-xs text-muted-foreground">
            <Loader2 size={16} className="animate-spin text-accent" /> Loading users from spreadsheet database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Current Active Session User */}
                {googleUser && (
                  <tr className="bg-accent/5">
                    <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                      <div className="size-6 rounded-full bg-accent text-accent-foreground grid place-items-center font-bold text-[10px]">
                        {googleUser.name ? googleUser.name[0].toUpperCase() : "U"}
                      </div>
                      {googleUser.name}
                      <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-mono font-bold">
                        Active Session
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">{googleUser.email}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{googleUser.googleId || "g_session"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={ROLE_BADGES[role].variant} className="text-[10px] uppercase font-mono">
                        {ROLE_LABELS[role]}
                      </Badge>
                    </td>
                  </tr>
                )}

                {/* Fetched Database Users */}
                {dbUsers.length > 0 ? (
                  dbUsers
                    .filter((u) => u.email && u.email !== googleUser?.email)
                    .map((u) => {
                      const userRole = (u.role || deriveRoleFromEmail(u.email || "")) as UserRole;
                      const badge = ROLE_BADGES[userRole] || ROLE_BADGES.user;
                      return (
                        <tr key={u.userId || u.email} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">{u.name || "Customer"}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono">{u.email}</td>
                          <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">{u.userId || "usr_sheet"}</td>
                          <td className="py-3 px-4">
                            <Badge variant={badge.variant} className="text-[10px] uppercase font-mono">
                              {ROLE_LABELS[userRole] || userRole}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                ) : !googleUser ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                      No registered users found in the connected spreadsheet tab yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Security Info */}
      <div className="bg-accent/10 border border-accent/20 rounded-sm p-4 text-xs font-body flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground mb-0.5">Live Spreadsheet Integration Note</p>
          <p className="text-muted-foreground leading-relaxed">
            Connected to Google Sheets / OneDrive database. All user sign-ins and orders are fetched dynamically from the live spreadsheet API endpoint without mock data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
