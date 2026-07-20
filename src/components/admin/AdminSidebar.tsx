import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Store, LogOut, Nut, Image as ImageIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminLogout } from "@/lib/admin";

const items = [
  { title: "Orders", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Inventory", url: "/admin/inventory", icon: Package, end: false },
  { title: "Images", url: "/admin/images", icon: ImageIcon, end: false },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="size-8 rounded-sm bg-primary text-primary-foreground grid place-items-center shrink-0">
            <Nut size={16} />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-base">House of Nuts</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Admin</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Manage</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Storefront">
                  <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <span>Storefront</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => {
                adminLogout();
                navigate("/admin/login");
              }}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
