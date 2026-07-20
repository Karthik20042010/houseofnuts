import { apiPost } from "./api";
import type { Order } from "./orders";

// The admin password lives in the Google Sheet's Config tab, never in this
// codebase. On login we send it to Apps Script; on every subsequent admin
// request we re-send it so the server can re-verify. Session is stored in
// sessionStorage (cleared on tab close) with an 8h absolute cap.

const SESSION_KEY = "hon-admin-session";
const TTL_MS = 8 * 60 * 60 * 1000;

interface Session {
  password: string;
  loggedInAt: number;
}

function readSession(): Session | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (Date.now() - s.loggedInAt > TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return !!readSession();
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function adminLogin(password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("adminLogin", { password });
    if (res.ok) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ password, loggedInAt: Date.now() } satisfies Session),
      );
      return { ok: true };
    }
    return { ok: false, error: res.error || "Invalid password" };
  } catch (e) {
    return { ok: false, error: "Cannot reach server. Check the Apps Script URL." };
  }
}

function requireAuth(): string {
  const s = readSession();
  if (!s) throw new Error("Not logged in");
  return s.password;
}

export async function adminFetchOrders(): Promise<Order[]> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; orders?: Order[]; error?: string }>("getOrders", { password });
  if (!res.ok) throw new Error(res.error || "Failed to load orders");
  return res.orders || [];
}

export async function adminUpdateOrder(
  orderId: string,
  updates: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"]; tracking?: string },
): Promise<void> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; error?: string }>("updateOrder", {
    password,
    orderId,
    ...updates,
  });
  if (!res.ok) throw new Error(res.error || "Update failed");
}

export async function adminUpdateInventory(
  items: Array<{ variantId: string; productId: string; size: string; stock: number }>,
): Promise<void> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; error?: string }>("updateInventory", { password, items });
  if (!res.ok) throw new Error(res.error || "Update failed");
}

// Uploads an image file to the shop owner's Google Drive via Apps Script and
// returns a public URL suitable for <img src>. The file is base64-encoded on
// the client (Apps Script has no multipart body helper worth using).
export async function adminUploadImage(
  productId: string,
  file: File,
): Promise<string> {
  const password = requireAuth();
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const res = await apiPost<{ ok: boolean; url?: string; error?: string }>("uploadImage", {
    password,
    productId,
    filename: file.name,
    mimeType: file.type || "image/jpeg",
    dataBase64,
  });
  if (!res.ok || !res.url) throw new Error(res.error || "Upload failed");
  return res.url;
}
