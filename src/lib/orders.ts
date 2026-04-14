export interface OrderItem {
  name: string;
  size: string;
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
}

const STORAGE_KEY = "hon-orders";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyomb0F_ardu7ESJxebSBu6Qady4RXo4bLjzYbuY1AF6WIUQ4osA3hT1oeOTPi2S2sM/exec";

export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HON-${dateStr}-${rand}`;
}

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

export async function submitToGoogleSheet(order: Order): Promise<void> {
  if (!GOOGLE_SHEET_URL) return;
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: order.timestamp,
        orderId: order.id,
        name: order.name,
        phone: order.phone,
        email: order.email || "",
        address: order.address,
        notes: order.notes,
        items: order.itemsSummary,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }),
    });
  } catch (err) {
    console.error("Failed to save order:", err);
  }
}

export async function sendOwnerEmailNotification(order: Order): Promise<void> {
  // Uses EmailJS free tier or a simple webhook — for now we'll use the Google Sheet
  // which the owner monitors. A future enhancement could add email via Apps Script.
  // The Google Apps Script can be extended to send email:
  // In the Apps Script, add: MailApp.sendEmail("owner@email.com", "New Order", JSON.stringify(orderData));
  console.log("Owner notification: New order", order.id);
}
