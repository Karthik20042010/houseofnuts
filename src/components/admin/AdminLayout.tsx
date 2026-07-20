import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { isAdminLoggedIn } from "@/lib/admin";

const titleFor = (path: string) => {
  if (path.startsWith("/admin/inventory")) return "Inventory";
  if (path.startsWith("/admin/images")) return "Product Images";
  if (path.startsWith("/admin/orders/")) return "Order Detail";
  return "Orders";
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate("/admin/login", { replace: true });
  }, [navigate, pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-clay-light">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background px-4 sticky top-0 z-20">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="font-display text-lg">{titleFor(pathname)}</h1>
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
