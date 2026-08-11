import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Store, LogOut, Nut, Image as ImageIcon, Terminal, ShieldCheck } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ROLE_BADGES, ROLE_LABELS, UserRole } from "@/types/auth";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  end?: boolean;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Orders", url: "/admin", icon: LayoutDashboard, end: true, allowedRoles: ["admin", "developer", "staff"] },
  { title: "Inventory", url: "/admin/inventory", icon: Package, end: false, allowedRoles: ["admin", "developer", "staff"] },
  { title: "Images", url: "/admin/images", icon: ImageIcon, end: false, allowedRoles: ["admin", "developer"] },
  { title: "Developer Console", url: "/admin/developer", icon: Terminal, end: false, allowedRoles: ["admin", "developer"] },
  { title: "Role Management", url: "/admin/roles", icon: ShieldCheck, end: false, allowedRoles: ["admin"] },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { role, logout, hasRole } = useAuth();

  const visibleItems = navItems.filter((item) => !item.allowedRoles || hasRole(item.allowedRoles));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="size-8 rounded-sm bg-primary text-primary-foreground grid place-items-center shrink-0">
            <Nut size={16} />
          </div>
          {!collapsed && (
            <div className="leading-tight flex-1 min-w-0">
              <div className="font-display text-base truncate">House of Nuts</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={ROLE_BADGES[role].variant} className="text-[9px] px-1.5 py-0 uppercase font-mono tracking-wider">
                  {ROLE_BADGES[role].label}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Management Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
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
                logout();
                navigate("/admin/login");
              }}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout ({ROLE_LABELS[role]})</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
