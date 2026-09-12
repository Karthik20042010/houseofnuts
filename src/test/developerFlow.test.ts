import { describe, it, expect, beforeEach } from "vitest";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/types/auth";
import { getActiveRole, isAdminLoggedIn } from "@/lib/admin";
import { getAnalyticsSummary } from "@/lib/analytics";

describe("Developer User Flow & Technical Console Verification", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("should authenticate Developer role with correct label", () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ password: "dev-secret-pass", role: "developer", loggedInAt: Date.now() })
    );

    expect(isAdminLoggedIn()).toBe(true);
    expect(getActiveRole()).toBe("developer");
    expect(ROLE_LABELS.developer).toBe("Developer");
  });

  it("should grant Developer permissions to Developer Console, Analytics & Drive Uploads", () => {
    const devPerms = ROLE_PERMISSIONS.developer;
    expect(devPerms.canAccessDevConsole).toBe(true);
    expect(devPerms.canViewAnalytics).toBe(true);
    expect(devPerms.canManageImages).toBe(true);
    expect(devPerms.canManageInventory).toBe(true);
    expect(devPerms.canViewOrders).toBe(true);
  });

  it("should prevent Developer from modifying User Roles", () => {
    const devPerms = ROLE_PERMISSIONS.developer;
    expect(devPerms.canManageRoles).toBe(false);
  });

  it("should allow Developer to access Analytics & System Logs data engine", () => {
    const summary = getAnalyticsSummary("30d");
    expect(summary).toBeDefined();
    expect(summary.totalViews).toBeGreaterThan(0);
    expect(summary.monthlyTrends.length).toBe(30);
    expect(summary.locationStats.length).toBeGreaterThan(0);
  });
});
