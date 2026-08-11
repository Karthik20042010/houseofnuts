import { checkRateLimit } from "./rateLimiter";

// Central Google Apps Script endpoint. All backend goes through this URL.
export const API_URL =
  "https://script.google.com/macros/s/AKfycbyomb0F_ardu7ESJxebSBu6Qady4RXo4bLjzYbuY1AF6WIUQ4osA3hT1oeOTPi2S2sM/exec";

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

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`API error: Status ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiGet<T = unknown>(
  action: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error(`API error: Status ${res.status}`);
  return res.json() as Promise<T>;
}
