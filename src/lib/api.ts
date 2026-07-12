// Central Google Apps Script endpoint. All backend goes through this URL.
// The Apps Script code lives in docs/apps-script.js — paste it into your
// linked Google Sheet's Extensions → Apps Script and redeploy.
export const API_URL =
  "https://script.google.com/macros/s/AKfycbyomb0F_ardu7ESJxebSBu6Qady4RXo4bLjzYbuY1AF6WIUQ4osA3hT1oeOTPi2S2sM/exec";

// We use text/plain to keep POST as a CORS-safe "simple request" (no preflight
// — Apps Script does not respond to OPTIONS). Body is still JSON.
export async function apiPost<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
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
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
