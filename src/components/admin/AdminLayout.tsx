import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ROLE_BADGES, ROLE_LABELS, UserRole } from "@/types/auth";
import { ShieldCheck, UserCheck } from "lucide-react";

const titleFor = (path: string) => {
  if (path.startsWith("/admin/inventory")) return "Inventory";
  if (path.startsWith("/admin/images")) return "Product Images";
  if (path.startsWith("/admin/developer")) return "Developer Console";
  if (path.startsWith("/admin/roles")) return "Role & Permission Management";
  if (path.startsWith("/admin/orders/")) return "Order Detail";
  return "Orders Management";
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn, role, switchRole } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) navigate("/admin/login", { replace: true });
  }, [isLoggedIn, navigate, pathname]);

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

            {/* Header Role Switcher & Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-muted/50 p-1 rounded border border-border text-xs">
                <span className="text-muted-foreground font-mono text-[10px] uppercase pl-1.5 flex items-center gap-1">
                  <UserCheck size={12} /> Role:
                </span>
                {(["admin", "developer", "staff"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    className={`px-2 py-1 rounded transition-colors text-[11px] font-medium capitalize ${
                      role === r
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
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
