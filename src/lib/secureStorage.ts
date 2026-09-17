import { obfuscatePayload, deobfuscatePayload } from "./encryption";

/**
 * Secure Storage Module
 * Protects user personal information (Name, Email, Phone, Delivery Address, Orders)
 * from being stored in plain text in browser LocalStorage / SessionStorage.
 */

export function setSecureItem<T = unknown>(key: string, value: T, isSession = false): void {
  if (typeof window === "undefined") return;
  try {
    const jsonStr = JSON.stringify(value);
    const encrypted = obfuscatePayload({ d: jsonStr });
    const storage = isSession ? sessionStorage : localStorage;
    storage.setItem(key, encrypted);
  } catch (err) {
    // Fallback if encryption fails
    try {
      const storage = isSession ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota exception
    }
  }
}

export function getSecureItem<T = unknown>(key: string, isSession = false): T | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = isSession ? sessionStorage : localStorage;
    const raw = storage.getItem(key);
    if (!raw) return null;

    // Try decrypting obfuscated payload
    if (!raw.startsWith("{") && !raw.startsWith("[")) {
      const decrypted = deobfuscatePayload<{ d: string }>(raw);
      if (decrypted && decrypted.d) {
        return JSON.parse(decrypted.d) as T;
      }
    }

    // Fallback for legacy plain text storage items
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function removeSecureItem(key: string, isSession = false): void {
  if (typeof window === "undefined") return;
  try {
    const storage = isSession ? sessionStorage : localStorage;
    storage.removeItem(key);
  } catch {
    // Ignore storage removal errors
  }
}

/**
 * Utility to mask PII (Personally Identifiable Information) for UI presentation.
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "••••••••";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.slice(0, 2)}••••${name.slice(-1)}@${domain}`;
}

export function maskPhone(phone?: string): string {
  if (!phone) return "••••••••••";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 10) return "••••••••••";
  return `${clean.slice(0, 2)}••••••${clean.slice(-2)}`;
}
