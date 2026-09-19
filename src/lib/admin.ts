import { apiPost } from "./api";
import type { Order } from "./orders";
import type { UserRole } from "@/types/auth";

// The admin password lives in the Google Sheet's Config tab, never in this
// codebase. On login we send it to Apps Script; on every subsequent admin
// request we re-send it so the server can re-verify. Session is stored in
// sessionStorage (cleared on tab close) with an 8h absolute cap.

const SESSION_KEY = "hon-admin-session";
const TTL_MS = 8 * 60 * 60 * 1000;

export interface Session {
  password: string;
  role: UserRole;
  loggedInAt: number;
}

export function readSession(): Session | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (Date.now() - s.loggedInAt > TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Fallback default role if previously saved without role
    if (!s.role) s.role = "admin";
    return s;
  } catch {
    return null;
  }
}

export function getActiveRole(): UserRole {
  const s = readSession();
  return s ? s.role : "user";
}

export function setSessionRole(role: UserRole) {
  let s = readSession();
  if (s) {
    s.role = role;
  } else {
    s = { password: "oauth-session-token", role, loggedInAt: Date.now() };
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("hon-auth-change", { detail: { role } }));
}

export function isAdminLoggedIn(): boolean {
  return !!readSession();
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("hon-auth-change", { detail: { role: "user" } }));
}

export async function adminLogin(
  password: string,
  role: UserRole = "admin"
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiPost<{ ok: boolean; error?: string }>("adminLogin", { password });
    if (res.ok) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ password, role, loggedInAt: Date.now() } satisfies Session),
      );
      window.dispatchEvent(new CustomEvent("hon-auth-change", { detail: { role } }));
      return { ok: true };
    }
    return { ok: false, error: res.error || "Invalid password" };
  } catch (e) {
    return { ok: false, error: "Cannot reach server. Check the Apps Script URL." };
  }
}

function requireAuth(): string {
  const s = readSession();
  if (s && s.password) {
    return s.password;
  }
  return "";
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
  if (!res.ok) throw new Error(res.error || "Inventory update failed");
}

export async function adminUpdatePrices(
  items: Array<{ variantId: string; productId: string; size: string; price: number; mrp?: number }>,
): Promise<void> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; error?: string }>("updatePrices", { password, items });
  if (!res.ok) throw new Error(res.error || "Price update failed");
}

export interface UploadImageOptions {
  productId: string;
  file?: File;
  category?: string;
  filename?: string;
  mimeType?: string;
  dataBase64?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// Uploads an image file to the shop owner's Google Drive via Apps Script and
// returns a public URL suitable for <img src>. Supports both positional
// args (productId, file, category) and an options object payload.
export async function adminUploadImage(
  productIdOrOpts: string | UploadImageOptions,
  fileObj?: File,
  categoryParam?: string,
): Promise<string> {
  const password = requireAuth();
  let productId: string;
  let category: string;
  let filename: string;
  let mimeType: string;
  let dataBase64: string;

  if (typeof productIdOrOpts === "object" && productIdOrOpts !== null) {
    const opts = productIdOrOpts;
    productId = opts.productId;
    category = opts.category || "";
    if (opts.file) {
      filename = opts.file.name;
      mimeType = opts.file.type || "image/jpeg";
      dataBase64 = await fileToBase64(opts.file);
    } else if (opts.dataBase64) {
      filename = opts.filename || "image.jpg";
      mimeType = opts.mimeType || "image/jpeg";
      dataBase64 = opts.dataBase64;
    } else {
      throw new Error("Missing file or base64 data for upload");
    }
  } else {
    productId = productIdOrOpts;
    category = categoryParam || "";
    if (!fileObj) throw new Error("Missing file object for upload");
    filename = fileObj.name;
    mimeType = fileObj.type || "image/jpeg";
    dataBase64 = await fileToBase64(fileObj);
  }

  const res = await apiPost<{ ok: boolean; url?: string; error?: string }>("uploadImage", {
    password,
    productId,
    category,
    filename,
    mimeType,
    dataBase64,
  });

  if (!res.ok || !res.url) throw new Error(res.error || "Upload failed");
  return res.url;
}

export async function adminUpdateProductPrice(
  productId: string,
  variantId: string,
  newPrice: number
): Promise<void> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; error?: string }>("updateProductPrice", {
    password,
    productId,
    variantId,
    newPrice,
  });
  if (!res.ok) throw new Error(res.error || "Failed to update price");
}

export async function adminFetchUsers(): Promise<Array<{ userId: string; email: string; name: string; phone: string; role: UserRole; createdAt: string }>> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; users?: Array<{ userId: string; email: string; name: string; phone: string; role: UserRole; createdAt: string }>; error?: string }>("getUsers", { password });
  if (!res.ok) throw new Error(res.error || "Failed to load users");
  return res.users || [];
}

export async function adminUpdateUserRole(userId: string, role: UserRole): Promise<void> {
  const password = requireAuth();
  const res = await apiPost<{ ok: boolean; error?: string }>("updateUserRole", { password, userId, role });
  if (!res.ok) throw new Error(res.error || "Failed to update user role");
}

export async function adminCheckEmailHealth(): Promise<{
  ok: boolean;
  remainingDailyQuota: number;
  ownerEmailConfigured: boolean;
  ownerEmail: string;
  testEmailSent: boolean;
  error?: string;
}> {
  const password = requireAuth();
  return await apiPost("checkEmailHealth", { password });
}

