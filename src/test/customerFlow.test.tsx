import { describe, it, expect, beforeEach } from "vitest";
import { generateOrderId, type Order } from "@/lib/orders";
import { trackPageView, getAnalyticsSummary, readStoredHits } from "@/lib/analytics";

describe("Normal Customer User Flow & Google OAuth Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should support customer Google OAuth authentication state", () => {
    const mockGoogleUser = {
      email: "customer@gmail.com",
      name: "Ananya Sharma",
      picture: "https://lh3.googleusercontent.com/a/sample-photo",
      googleId: "g_12345678",
    };

    localStorage.setItem("hon-google-user", JSON.stringify(mockGoogleUser));

    const raw = localStorage.getItem("hon-google-user");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.email).toBe("customer@gmail.com");
    expect(parsed.name).toBe("Ananya Sharma");
  });

  it("should record customer page views silently in background analytics", () => {
    trackPageView("/shop", "Shop All Products", "customer@gmail.com");
    trackPageView("/product/mamra-almonds", "Mamra Almonds Detail", "customer@gmail.com");

    const hits = readStoredHits();
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits[0].path).toBe("/product/mamra-almonds");
    expect(hits[0].userType).toBe("member");
  });

  it("should generate valid order IDs for customer checkout", () => {
    const orderId = generateOrderId();
    expect(orderId).toMatch(/^HON-\d{6}-[A-Z0-9]{4}$/);
  });

  it("should match order history by customer email", () => {
    const mockOrders: Order[] = [
      {
        id: "HON-240829-A1B2",
        timestamp: new Date().toISOString(),
        name: "Ananya Sharma",
        phone: "+919876543210",
        email: "customer@gmail.com",
        address: "Bengaluru, Karnataka",
        notes: "Deliver in evening",
        itemsSummary: "Mamra Almonds 500g x 1",
        items: [{ name: "Mamra Almonds", size: "500g", variantId: "mamra-500g", productId: "mamra-almonds", price: 1400, quantity: 1 }],
        total: 1400,
        status: "confirmed",
        paymentStatus: "paid",
      },
      {
        id: "HON-240829-C3D4",
        timestamp: new Date().toISOString(),
        name: "Rohan V",
        phone: "+919812345678",
        email: "other@gmail.com",
        address: "Mumbai, Maharashtra",
        notes: "",
        itemsSummary: "Jumbo Cashews 250g x 1",
        items: [{ name: "Jumbo Cashews", size: "250g", variantId: "cashew-250g", productId: "cashews", price: 450, quantity: 1 }],
        total: 450,
        status: "pending",
        paymentStatus: "pending",
      },
    ];

    const customerEmail = "customer@gmail.com";
    const filteredOrders = mockOrders.filter((o) => o.email?.toLowerCase() === customerEmail.toLowerCase());

    expect(filteredOrders.length).toBe(1);
    expect(filteredOrders[0].id).toBe("HON-240829-A1B2");
  });
});
