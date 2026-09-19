import { describe, it, expect, beforeEach } from "vitest";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/types/auth";
import { getActiveRole, setSessionRole, adminLogout, isAdminLoggedIn } from "@/lib/admin";
import { trackActivityLog, readStoredLogs, exportAnalyticsLogsToCsv } from "@/lib/analytics";

describe("Admin User Flow & Full Administrative Access Control", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("should authenticate Admin role with full system privileges", () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ password: "master-admin-password", role: "admin", loggedInAt: Date.now() })
    );

    expect(isAdminLoggedIn()).toBe(true);
    expect(getActiveRole()).toBe("admin");
    expect(ROLE_LABELS.admin).toBe("Administrator");

    const adminPerms = ROLE_PERMISSIONS.admin;
    expect(adminPerms.canViewOrders).toBe(true);
    expect(adminPerms.canManageOrders).toBe(true);
    expect(adminPerms.canManageInventory).toBe(true);
    expect(adminPerms.canManageImages).toBe(true);
    expect(adminPerms.canAccessDevConsole).toBe(true);
    expect(adminPerms.canManageRoles).toBe(true);
    expect(adminPerms.canViewAnalytics).toBe(true);
  });

  it("should support dynamic Admin role switching for testing lower tiers", () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ password: "master-admin-password", role: "admin", loggedInAt: Date.now() })
    );

    setSessionRole("developer");
    expect(getActiveRole()).toBe("developer");

    setSessionRole("staff");
    expect(getActiveRole()).toBe("staff");

    setSessionRole("admin");
    expect(getActiveRole()).toBe("admin");
  });

  it("should log administrative audit trail events", () => {
    trackActivityLog(
      "Admin Login",
      "Administrator authenticated into management portal",
      "security",
      "/admin",
      "admin@houseofnuts.in"
    );

    const logs = readStoredLogs();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].action).toBe("Admin Login");
    expect(logs[0].level).toBe("security");
    expect(logs[0].path).toBe("/admin");
  });

  it("should handle admin session logout", () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ password: "master-admin-password", role: "admin", loggedInAt: Date.now() })
    );

    expect(isAdminLoggedIn()).toBe(true);
    adminLogout();
    expect(isAdminLoggedIn()).toBe(false);
    expect(getActiveRole()).toBe("user");
  });

  it("should accept both object options and positional arguments for adminUploadImage", async () => {
    sessionStorage.setItem(
      "hon-admin-session",
      JSON.stringify({ token: "mock_test_token_12345", role: "admin", loggedInAt: Date.now() })
    );

    // Mock fetch for apiPost
    const dummyFile = new File(["dummy content"], "test-almonds.jpg", { type: "image/jpeg" });

    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      return {
        ok: true,
        json: async () => ({ ok: true, url: "https://lh3.googleusercontent.com/d/mock-file-id" }),
      } as Response;
    };

    // Test positional signature
    const url1 = await import("@/lib/admin").then((m) => m.adminUploadImage("california-almonds", dummyFile, "nuts"));
    expect(url1).toBe("https://lh3.googleusercontent.com/d/mock-file-id");

    // Test object signature
    const url2 = await import("@/lib/admin").then((m) =>
      m.adminUploadImage({
        productId: "mamra-almonds",
        file: dummyFile,
        category: "nuts",
      })
    );
    expect(url2).toBe("https://lh3.googleusercontent.com/d/mock-file-id");
  });
});
