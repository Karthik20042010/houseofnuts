import { UserRole } from "@/types/auth";

export const RESTRICTED_COMING_SOON_CATEGORIES = ["spices", "honey", "protein", "stuffed-dates"];

export const ADMIN_ONLY_TEST_CATEGORIES = [
  "stock-inventory-test",
  "orders-qa-test",
  "dev-sandbox",
];

/**
 * Checks if user is a privileged admin, staff, or developer.
 */
export function isPrivilegedUser(userState?: { isLoggedIn?: boolean; role?: UserRole }): boolean {
  const { isLoggedIn, role } = userState || {};
  if (role === "admin" || role === "developer" || role === "staff") return true;

  // Fallback to active admin session storage
  try {
    const rawAdminSession = sessionStorage.getItem("hon-admin-session");
    if (rawAdminSession) {
      const parsed = JSON.parse(rawAdminSession);
      if (parsed.role === "admin" || parsed.role === "developer" || parsed.role === "staff") {
        return true;
      }
    }
  } catch {
    // fallback
  }

  return false;
}

/**
 * Returns true if a category should be revealed in the UI for the current user.
 * - Admin/Developer test categories ("stock-inventory-test", "orders-qa-test", "dev-sandbox") are ONLY visible to logged-in Admin, Developer & Staff users.
 * - Hidden completely from public customers.
 */
export function isCategoryVisibleToUser(
  category: string,
  userState?: { isLoggedIn?: boolean; role?: UserRole }
): boolean {
  if (!category) return true;
  const lower = category.toLowerCase();

  if (ADMIN_ONLY_TEST_CATEGORIES.includes(lower)) {
    return isPrivilegedUser(userState);
  }

  return true;
}

/**
 * Checks if a category is in restricted preview mode for the given user.
 */
export function isCategoryComingSoon(
  category: string,
  userState?: { isLoggedIn?: boolean; role?: UserRole }
): boolean {
  if (!category || !RESTRICTED_COMING_SOON_CATEGORIES.includes(category.toLowerCase())) {
    return false;
  }
  return !isPrivilegedUser(userState);
}
