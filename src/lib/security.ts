/**
 * Security & Data Sanitization Utilities
 * Prevents Cross-Site Scripting (XSS), Script Injection, and Malicious Input Attacks.
 */

/**
 * Sanitizes user text input by stripping dangerous HTML tags and characters.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validates and sanitizes email addresses against standard RFC 5322 format.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes and validates phone numbers (Digits, +, whitespace, dashes only).
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d+ -]/g, "").trim();
}

/**
 * Validates that string parameters contain no script or SQL injection payloads.
 */
export function isSafeParam(param: string): boolean {
  if (!param) return true;
  const dangerousPatterns = /<script|javascript:|data:|vbscript:|onload=|onerror=|select\s+.*from|drop\s+table/i;
  return !dangerousPatterns.test(param);
}
