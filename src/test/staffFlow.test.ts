import { describe, it, expect, beforeEach } from "vitest";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/types/auth";
import { getActiveRole, setSessionRole, adminLogout, isAdminLoggedIn } from "@/lib/admin";

describe("Store Staff User Flow & RBAC Constraints", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("should authenticate Staff user and assign 'staff' role label", () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ password: "staff-secret-pass", role: "staff", loggedInAt: Date.now() })
    );

    expect(isAdminLoggedIn()).toBe(true);
    expect(getActiveRole()).toBe("staff");
    expect(ROLE_LABELS.staff).toBe("Store Staff");
  });

  it("should grant Staff rights to view and update order status & inventory", () => {
    const staffPerms = ROLE_PERMISSIONS.staff;
    expect(staffPerms.canViewOrders).toBe(true);
    expect(staffPerms.canManageOrders).toBe(true);
    expect(staffPerms.canManageInventory).toBe(true);
  });

  it("should strictly enforce Staff security boundaries", () => {
    const staffPerms = ROLE_PERMISSIONS.staff;
    expect(staffPerms.canAccessDevConsole).toBe(false);
    expect(staffPerms.canManageImages).toBe(false);
    expect(staffPerms.canManageRoles).toBe(false);
    expect(staffPerms.canViewAnalytics).toBe(false);
  });
});
