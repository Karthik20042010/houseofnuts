import { describe, it, expect, beforeEach } from "vitest";
import { ROLE_PERMISSIONS, ROLE_LABELS, UserRole } from "@/types/auth";
import { getActiveRole, setSessionRole, adminLogout, isAdminLoggedIn } from "@/lib/admin";

describe("Role-Based Access Control (RBAC) System", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("should correctly map permissions for Admin role", () => {
    const adminPerms = ROLE_PERMISSIONS.admin;
    expect(adminPerms.canViewOrders).toBe(true);
    expect(adminPerms.canManageOrders).toBe(true);
    expect(adminPerms.canManageInventory).toBe(true);
    expect(adminPerms.canManageImages).toBe(true);
    expect(adminPerms.canAccessDevConsole).toBe(true);
    expect(adminPerms.canManageRoles).toBe(true);
    expect(adminPerms.canViewAnalytics).toBe(true);
  });

  it("should restrict Developer role from managing roles and updating orders", () => {
    const devPerms = ROLE_PERMISSIONS.developer;
    expect(devPerms.canViewOrders).toBe(true);
    expect(devPerms.canManageOrders).toBe(false);
    expect(devPerms.canAccessDevConsole).toBe(true);
    expect(devPerms.canManageRoles).toBe(false);
  });

  it("should restrict Staff role to orders and inventory management", () => {
    const staffPerms = ROLE_PERMISSIONS.staff;
    expect(staffPerms.canViewOrders).toBe(true);
    expect(staffPerms.canManageOrders).toBe(true);
    expect(staffPerms.canManageInventory).toBe(true);
    expect(staffPerms.canAccessDevConsole).toBe(false);
    expect(staffPerms.canManageImages).toBe(false);
  });

  it("should restrict Customer User role from administrative capabilities", () => {
    const userPerms = ROLE_PERMISSIONS.user;
    expect(userPerms.canViewOrders).toBe(false);
    expect(userPerms.canManageInventory).toBe(false);
    expect(userPerms.canAccessDevConsole).toBe(false);
  });

  it("should provide correct labels for all user roles", () => {
    expect(ROLE_LABELS.admin).toBe("Administrator");
    expect(ROLE_LABELS.developer).toBe("Developer");
    expect(ROLE_LABELS.staff).toBe("Store Staff");
    expect(ROLE_LABELS.user).toBe("Customer User");
  });

  it("should default active role to 'user' when not logged in", () => {
    expect(isAdminLoggedIn()).toBe(false);
    expect(getActiveRole()).toBe("user");
  });

  it("should persist and update active session role", () => {
    sessionStorage.setItem("hon-admin-session", JSON.stringify({ password: "pass", role: "developer", loggedInAt: Date.now() }));
    expect(isAdminLoggedIn()).toBe(true);
    expect(getActiveRole()).toBe("developer");

    setSessionRole("staff");
    expect(getActiveRole()).toBe("staff");

    adminLogout();
    expect(isAdminLoggedIn()).toBe(false);
    expect(getActiveRole()).toBe("user");
  });
});
