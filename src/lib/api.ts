import { checkRateLimit } from "./rateLimiter";
import { obfuscatePayload } from "./encryption";

export const API_URL =
  (import.meta.env.APPS_SCRIPT_URL as string) ||
  (import.meta.env.VITE_APPS_SCRIPT_URL as string) ||
  "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec";

// Sensitive actions subjected to rate limiting
const SENSITIVE_ACTIONS: Record<string, { max: number; windowMs: number }> = {
  adminLogin: { max: 5, windowMs: 60 * 1000 },
  placeOrder: { max: 8, windowMs: 60 * 1000 },
  updateUserRole: { max: 5, windowMs: 60 * 1000 },
  updateProductPrice: { max: 10, windowMs: 60 * 1000 },
};

export async function apiPost<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  // Rate limiting check
  if (SENSITIVE_ACTIONS[action]) {
    const { max, windowMs } = SENSITIVE_ACTIONS[action];
    const limitCheck = checkRateLimit(`api_post_${action}`, max, windowMs);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.error || "Rate limit exceeded. Please wait before retrying.");
    }
  }

  // Encapsulate and obfuscate payload data so network sniffers cannot view plain text database parameters
  const rawData = { action, ...payload };
  const encryptedPayload = obfuscatePayload(rawData);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      enc: encryptedPayload,
    }),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`API error: Status ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiGet<T = unknown>(
  action: string,
  params: Record<string, string> = {},
): Promise<T> {
  // Always route via apiPost (text/plain payload) to avoid Google Apps Script GET 302 redirect CORS blocks in browser console
  return apiPost<T>(action, params);
}

export async function fetchProductSpecsFromDB(): Promise<Record<string, ProductSpecification>> {
  try {
    const res = await apiGet<{ ok: boolean; specs?: Record<string, ProductSpecification> }>("getProductSpecs");
    if (res && res.ok && res.specs && Object.keys(res.specs).length > 0) {
      const { setDynamicProductSpecs } = await import("./productDetails");
      setDynamicProductSpecs(res.specs);
      return res.specs;
    }
  } catch (err) {
    console.warn("Could not fetch product specs from DB, using fallback static specs:", err);
  }
  return {};
}

