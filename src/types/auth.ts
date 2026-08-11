export type UserRole = "admin" | "developer" | "staff" | "user";

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
}

export interface UserSession {
  role: UserRole;
  password?: string;
  loggedInAt: number;
  email?: string;
  name?: string;
  googleUser?: GoogleUser;
}

export interface Permission {
  canViewOrders: boolean;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canManageImages: boolean;
  canAccessDevConsole: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    canViewOrders: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageImages: true,
    canAccessDevConsole: true,
    canManageRoles: true,
    canViewAnalytics: true,
  },
  developer: {
    canViewOrders: true,
    canManageOrders: false,
    canManageInventory: true,
    canManageImages: true,
    canAccessDevConsole: true,
    canManageRoles: false,
    canViewAnalytics: true,
  },
  staff: {
    canViewOrders: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageImages: false,
    canAccessDevConsole: false,
    canManageRoles: false,
    canViewAnalytics: false,
  },
  user: {
    canViewOrders: false,
    canManageOrders: false,
    canManageInventory: false,
    canManageImages: false,
    canAccessDevConsole: false,
    canManageRoles: false,
    canViewAnalytics: false,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  developer: "Developer",
  staff: "Store Staff",
  user: "Customer User",
};

export const ROLE_BADGES: Record<UserRole, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  admin: { label: "Admin", variant: "destructive" },
  developer: { label: "Developer", variant: "default" },
  staff: { label: "Staff", variant: "secondary" },
  user: { label: "Customer", variant: "outline" },
};
