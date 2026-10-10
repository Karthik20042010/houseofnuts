import { apiPost } from "./api";
import type { Order } from "./orders";
import type { UserRole } from "@/types/auth";
import type { Product } from "@/data/products";
import type { CustomCategory, CustomSubcategory } from "./customCatalog";

// The admin password is never stored or sent in repeated API requests.
// On login, Apps Script issues a cryptographically signed session token.
// The session token is stored in sessionStorage (cleared on tab close) with an 8h cap.

const SESSION_KEY = "hon-admin-session";
const TTL_MS = 8 * 60 * 60 * 1000;

export interface Session {
  token: string;
  role: UserRole;
  loggedInAt: number;
  expiresAt?: number;
  /** Legacy alias for backwards compatibility with tests */
  password?: string;
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
    if (!s.role) s.role = "admin";
    // Ensure token exists
    if (!s.token && s.password) {
      s.token = s.password;
    }
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
    s = { token: "oauth-session-token", password: "oauth-session-token", role, loggedInAt: Date.now() };
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
    const res = await apiPost<{
      ok: boolean;
      sessionToken?: string;
      token?: string;
      role?: UserRole;
      expiresAt?: number;
      error?: string;
    }>("adminLogin", { password, role });

    if (res.ok) {
      const issuedToken = res.sessionToken || res.token || "session_" + Date.now();
      const sessionData: Session = {
        token: issuedToken,
        password: issuedToken, // maintain legacy field for test mocks
        role: res.role || role,
        loggedInAt: Date.now(),
        expiresAt: res.expiresAt || Date.now() + TTL_MS,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      window.dispatchEvent(new CustomEvent("hon-auth-change", { detail: { role: sessionData.role } }));
      return { ok: true };
    }
    return { ok: false, error: res.error || "Invalid administrator credentials" };
  } catch {
    return { ok: false, error: "Cannot reach server. Check the Apps Script URL." };
  }
}

function requireAuth(): string {
  const s = readSession();
  const token = s?.token || s?.password;
  if (token) {
    return token;
  }
  throw new Error("Admin authentication required. Please log in.");
}

function authPayload(extra: Record<string, unknown> = {}) {
  const token = requireAuth();
  return {
    token,
    sessionToken: token,
    password: token, // backward compatibility with server
    ...extra,
  };
}

export async function adminFetchOrders(): Promise<Order[]> {
  const res = await apiPost<{ ok: boolean; orders?: Order[]; error?: string }>(
    "getOrders",
    authPayload()
  );
  if (!res.ok) throw new Error(res.error || "Failed to load orders");
  return res.orders || [];
}

export async function adminUpdateOrder(
  orderId: string,
  updates: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"]; tracking?: string },
): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "updateOrder",
    authPayload({ orderId, ...updates })
  );
  if (!res.ok) throw new Error(res.error || "Update failed");
}

export async function adminUpdateInventory(
  items: Array<{ variantId: string; productId: string; size: string; stock: number }>,
): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "updateInventory",
    authPayload({ items })
  );
  if (!res.ok) throw new Error(res.error || "Inventory update failed");
}

export async function adminUpdatePrices(
  items: Array<{ variantId: string; productId: string; size: string; price: number; mrp?: number }>,
): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "updatePrices",
    authPayload({ items })
  );
  if (!res.ok) throw new Error(res.error || "Price update failed");
}

export async function adminSaveCatalog(
  products: Product[],
  metadata: {
    categories: CustomCategory[];
    subcategories: CustomSubcategory[];
    productOrder: string[];
    categoryOrder: string[];
  },
): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "saveCatalog",
    authPayload({ products, metadata })
  );
  if (!res.ok) throw new Error(res.error || "Catalog publish failed");
}

export async function adminSaveCatalogConfig(
  config: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "saveCatalogConfig",
    authPayload({ config })
  );
  if (!res.ok) throw new Error(res.error || "Catalog config save failed");
  return res;
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

export async function adminUploadImage(
  productIdOrOpts: string | UploadImageOptions,
  fileObj?: File,
  categoryParam?: string,
): Promise<string> {
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
    productId = productIdOrOpts as string;
    category = categoryParam || "";
    if (!fileObj) throw new Error("Missing file object for upload");
    filename = fileObj.name;
    mimeType = fileObj.type || "image/jpeg";
    dataBase64 = await fileToBase64(fileObj);
  }

  const res = await apiPost<{ ok: boolean; url?: string; error?: string }>(
    "uploadImage",
    authPayload({
      productId,
      category,
      filename,
      mimeType,
      dataBase64,
    })
  );

  if (!res.ok || !res.url) throw new Error(res.error || "Upload failed");
  return res.url;
}

export async function adminUpdateProductPrice(
  productId: string,
  variantId: string,
  newPrice: number
): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "updateProductPrice",
    authPayload({ productId, variantId, newPrice })
  );
  if (!res.ok) throw new Error(res.error || "Failed to update price");
}

export async function adminFetchUsers(): Promise<Array<{ userId: string; email: string; name: string; phone: string; role: UserRole; createdAt: string }>> {
  const res = await apiPost<{ ok: boolean; users?: Array<{ userId: string; email: string; name: string; phone: string; role: UserRole; createdAt: string }>; error?: string }>(
    "getUsers",
    authPayload()
  );
  if (!res.ok) throw new Error(res.error || "Failed to load users");
  return res.users || [];
}

export async function adminUpdateUserRole(userId: string, role: UserRole): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>(
    "updateUserRole",
    authPayload({ userId, role })
  );
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
  return await apiPost("checkEmailHealth", authPayload());
}

export async function adminFetchAuditLogs(): Promise<Array<{ timestamp: string; actor: string; action: string; details: string }>> {
  const res = await apiPost<{ ok: boolean; logs?: Array<{ timestamp: string; actor: string; action: string; details: string }>; error?: string }>(
    "getAuditLogs",
    authPayload()
  );
  if (!res.ok) throw new Error(res.error || "Failed to load audit logs");
  return res.logs || [];
}

export async function adminGetSeoChecklist(): Promise<Record<string, string>> {
  const res = await apiPost<{ ok: boolean; done?: Record<string, string>; error?: string }>("getSeoChecklist", authPayload());
  if (!res.ok) throw new Error(res.error || "Failed to load checklist");
  return res.done || {};
}

export async function adminSaveSeoChecklist(done: Record<string, string>): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>("saveSeoChecklist", authPayload({ done }));
  if (!res.ok) throw new Error(res.error || "Failed to save checklist");
}
