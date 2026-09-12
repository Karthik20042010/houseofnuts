import { UserRole } from "@/types/auth";

export const RESTRICTED_COMING_SOON_CATEGORIES = ["spices", "honey"];

/**
 * Checks if user is a privileged admin, staff, or developer.
 */
export function isPrivilegedUser(userState: { isLoggedIn?: boolean; role?: UserRole }): boolean {
  const { isLoggedIn, role } = userState || {};
  return Boolean(isLoggedIn && (role === "admin" || role === "staff" || role === "developer"));
}

/**
 * Returns true if a category should be revealed in the UI for the current user.
 * - Restricted categories ("spices", "honey") are HIDDEN from retail customers/guests.
 * - Only revealed to logged-in Admin, Staff, and Developer roles.
 */
export function isCategoryVisibleToUser(
  category: string,
  userState: { isLoggedIn?: boolean; role?: UserRole }
): boolean {
  if (!category || !RESTRICTED_COMING_SOON_CATEGORIES.includes(category.toLowerCase())) {
    return true;
  }
  return isPrivilegedUser(userState);
}

/**
 * Checks if a category is in restricted preview mode for the given user.
 */
export function isCategoryComingSoon(
  category: string,
  userState: { isLoggedIn?: boolean; role?: UserRole }
): boolean {
  if (!category || !RESTRICTED_COMING_SOON_CATEGORIES.includes(category.toLowerCase())) {
    return false;
  }
  return !isPrivilegedUser(userState);
}
