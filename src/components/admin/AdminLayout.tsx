import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ROLE_BADGES, ROLE_LABELS, UserRole } from "@/types/auth";
import { getActiveRole } from "@/lib/admin";
import { ShieldCheck, UserCheck } from "lucide-react";

const titleFor = (path: string) => {
  if (path === "/admin") return "Admin Dashboard";
  if (path.startsWith("/admin/analytics")) return "Analytics, Metrics & Logs";
  if (path.startsWith("/admin/inventory")) return "Inventory Management";
  if (path.startsWith("/admin/images")) return "Product Images";
  if (path.startsWith("/admin/seo")) return "SEO Launch Checklist";
  if (path.startsWith("/admin/messages")) return "Customer Messages";
  if (path.startsWith("/admin/developer")) return "Developer Console";
  if (path.startsWith("/admin/roles")) return "Role & Permission Management";
  if (path.startsWith("/admin/orders/")) return "Order Detail";
  return "Orders Management";
};

const AdminLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  const { isLoggedIn, role } = useAuth();

  const activeRole = role !== "user" ? role : getActiveRole();
  const isStaffOrAdmin = activeRole === "admin" || activeRole === "staff" || activeRole === "developer";

  // Gate the whole admin shell: require an active staff/admin/developer session.
  if (!isLoggedIn || !isStaffOrAdmin) {
    return <Navigate to="/account" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-clay-light">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <h1 className="font-display text-lg font-semibold">{titleFor(pathname)}</h1>
            </div>

            {/* Header Role Status Badge */}
            <div className="flex items-center gap-3">
              <Badge variant={ROLE_BADGES[role].variant} className="text-xs font-mono">
                {ROLE_LABELS[role]}
              </Badge>
            </div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
