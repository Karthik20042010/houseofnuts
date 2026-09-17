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
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod?: "cashfree" | "upi" | "card" | "cod" | "bank_transfer";
  utrReference?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
}

import { getSecureItem, setSecureItem } from "./secureStorage";

const STORAGE_KEY = "hon-orders";

export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HON-${dateStr}-${rand}`;
}

// Encrypted device-only history for the "My Orders" customer page.
// Source of truth for the shop is the Google Sheet database.
export function getOrders(): Order[] {
  const orders = getSecureItem<Order[]>(STORAGE_KEY);
  return orders || [];
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  setSecureItem(STORAGE_KEY, orders);
}

export function updateOrderStatus(id: string, status: Order["status"]): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    setSecureItem(STORAGE_KEY, orders);
  }
}

export function cancelOrder(id: string): boolean {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1 && (orders[idx].status === "pending" || orders[idx].status === "confirmed")) {
    orders[idx].status = "cancelled";
    setSecureItem(STORAGE_KEY, orders);
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
    if (import.meta.env.DEV) console.error("placeOrder failed");
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

export async function fetchOrderStatus(orderId: string): Promise<{
  ok: boolean;
  orderId?: string;
  status?: Order["status"];
  paymentStatus?: Order["paymentStatus"];
  error?: string;
}> {
  try {
    return await apiPost<{
      ok: boolean;
      orderId?: string;
      status?: Order["status"];
      paymentStatus?: Order["paymentStatus"];
      error?: string;
    }>("getOrderStatus", { orderId });
  } catch {
    return { ok: false, error: "network_error" };
  }
}
