import { apiPost } from "./api";

export interface OrderItem {
  name: string;
  size: string;
  variantId: string;
  productId: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes: string;
  items: OrderItem[];
  itemsSummary: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: "upi" | "card" | "cod" | "bank_transfer";
  utrReference?: string;
}

const STORAGE_KEY = "hon-orders";

export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HON-${dateStr}-${rand}`;
}

// Local, device-only history for the "My Orders" customer page.
// Source of truth for the shop is the Google Sheet.
export function getOrders(): Order[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id: string, status: Order["status"]): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
}

export function cancelOrder(id: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1 && (orders[idx].status === "pending" || orders[idx].status === "confirmed")) {
    orders[idx].status = "cancelled";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  }
  return false;
}

// Server-side place order: appends to Orders sheet, decrements inventory
// atomically (LockService), emails owner. Returns ok:false with
// error:"out_of_stock" if any variant went to zero between add-to-cart and
// checkout.
export interface PlaceOrderResult {
  ok: boolean;
  error?: string;
  outOfStock?: Array<{ variantId: string; name: string; size: string }>;
}

export async function placeOrderApi(order: Order): Promise<PlaceOrderResult> {
  try {
    return await apiPost<PlaceOrderResult>("placeOrder", { order });
  } catch (e) {
    console.error("placeOrder failed:", e);
    return { ok: false, error: "network_error" };
  }
}

// Kept for backwards compatibility with anything that imported it.
export async function submitToGoogleSheet(order: Order): Promise<void> {
  await placeOrderApi(order);
}

export async function sendOwnerEmailNotification(order: Order): Promise<void> {
  // Email is sent from Apps Script on placeOrder.
}
