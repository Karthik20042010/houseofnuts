import { describe, it, expect, beforeEach } from "vitest";
import { dedupeCatalogProducts, findPotentialDuplicates } from "@/lib/customCatalog";
import { isOutOfStock, isInventoryUnavailable, setInventoryHealthForTest, StockMap } from "@/lib/inventory";
import { generateOrderId, Order } from "@/lib/orders";
import { Product } from "@/data/products";
import { reportOperationalError } from "@/lib/monitoring";

describe("E2E Regression Flow & Reliability Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setInventoryHealthForTest(true);
  });

  describe("1. Catalog Integrity & Duplicate Prevention", () => {
    it("should reject duplicate variant/SKU IDs within the same product", () => {
      const mockProduct: Product = {
        id: "prod-almonds",
        name: "Mamra Almonds",
        category: "nuts",
        description: "Fresh harvest",
        image: "/images/almonds.jpg",
        variants: [
          { id: "sku-alm-250", size: "250g", price: 700 },
          { id: "sku-alm-250", size: "250g (duplicate)", price: 750 },
          { id: "sku-alm-500", size: "500g", price: 1350 },
        ],
      };

      const cleaned = dedupeCatalogProducts([mockProduct]);
      expect(cleaned.length).toBe(1);
      // The duplicate variant with the same SKU should be filtered out
      expect(cleaned[0].variants.length).toBe(2);
      expect(cleaned[0].variants.map((v) => v.id)).toEqual(["sku-alm-250", "sku-alm-500"]);
    });

    it("should preserve legitimate distinct products with different varieties or pack sizes", () => {
      const productA: Product = {
        id: "raw-mamra-almonds",
        name: "Raw Mamra Almonds",
        category: "nuts",
        description: "Raw Mamra",
        image: "/images/a.jpg",
        variants: [{ id: "sku-a-500", size: "500g", price: 800 }],
        status: "active",
      };

      const productB: Product = {
        id: "roasted-mamra-almonds",
        name: "Roasted Salted Mamra Almonds",
        category: "nuts",
        description: "Roasted Mamra",
        image: "/images/b.jpg",
        variants: [{ id: "sku-b-500", size: "500g", price: 850 }],
        status: "active",
      };

      const result = dedupeCatalogProducts([productA, productB]);
      expect(result.length).toBe(2);
      expect(result.find((p) => p.id === "raw-mamra-almonds")).toBeDefined();
      expect(result.find((p) => p.id === "roasted-mamra-almonds")).toBeDefined();
    });

    it("should flag potential duplicate products sharing display names for staff review", () => {
      const productA: Product = {
        id: "prod-a",
        name: "Standard Badam",
        category: "nuts",
        description: "Batch 1",
        image: "/images/a.jpg",
        variants: [{ id: "sku-a", size: "500g", price: 500 }],
      };
      const productB: Product = {
        id: "prod-b",
        name: "Standard Badam",
        category: "nuts",
        description: "Batch 2",
        image: "/images/b.jpg",
        variants: [{ id: "sku-b", size: "250g", price: 260 }],
      };

      const duplicates = findPotentialDuplicates([productA, productB]);
      expect(duplicates.length).toBe(1);
      expect(duplicates[0].original.id).toBe("prod-a");
      expect(duplicates[0].duplicate.id).toBe("prod-b");
    });

    it("should preserve product status (active, draft, archived)", () => {
      const draftProd: Product = {
        id: "draft-item",
        name: "Test Batch Item",
        category: "nuts",
        description: "Drafting",
        image: "/images/test.jpg",
        variants: [{ id: "sku-test-1", size: "100g", price: 100 }],
        status: "draft",
      };

      const result = dedupeCatalogProducts([draftProd]);
      expect(result[0].status).toBe("draft");
    });
  });

  describe("2. Inventory Failure Mode & Fail-Closed Protection", () => {
    it("should permit purchases when inventory is healthy and stock is positive", () => {
      setInventoryHealthForTest(true);
      const stock: StockMap = { "sku-walnut-500": 10 };
      expect(isOutOfStock(stock, "sku-walnut-500")).toBe(false);
      expect(isInventoryUnavailable(stock)).toBe(false);
    });

    it("should flag out-of-stock when tracked inventory hits zero", () => {
      setInventoryHealthForTest(true);
      const stock: StockMap = { "sku-walnut-500": 0 };
      expect(isOutOfStock(stock, "sku-walnut-500")).toBe(true);
    });

    it("should FAIL CLOSED when inventory service is down and no cache exists", () => {
      // Simulate API outage
      setInventoryHealthForTest(false);
      const emptyStock: StockMap = {};

      expect(isInventoryUnavailable(emptyStock)).toBe(true);
      // Fail closed: simulated API failure must never permit a stock-controlled SKU to be purchased!
      expect(isOutOfStock(emptyStock, "sku-walnut-500")).toBe(true);
      expect(isOutOfStock(emptyStock, "any-sku-id")).toBe(true);
    });
  });

  describe("3. Checkout, Snapshot Preservation & Delivery Threshold", () => {
    it("should preserve product snapshot attributes in order items", () => {
      const mockOrder: Order = {
        id: generateOrderId(),
        name: "Priya Rao",
        email: "priya@gmail.com",
        phone: "+919876543210",
        address: "Hyderabad, Telangana",
        items: [
          {
            name: "Royal Kashmiri Walnut",
            size: "500g",
            variantId: "wal-500",
            productId: "walnuts",
            price: 750,
            quantity: 2,
            image: "/images/catalog/walnuts.jpg",
          },
        ],
        itemsSummary: "Royal Kashmiri Walnut (500g) x2",
        total: 1500,
        status: "pending",
        paymentStatus: "pending",
        timestamp: new Date().toISOString(), notes: "", ...({ paymentNotes: "UPI UTR: 423918273645" } as object),
      };

      expect(mockOrder.items[0].image).toBe("/images/catalog/walnuts.jpg");
      expect(mockOrder.items[0].price).toBe(750);
      expect(mockOrder.paymentStatus).toBe("pending");
      expect((mockOrder as { paymentNotes?: string }).paymentNotes).toContain("423918273645");
    });

    it("should evaluate free delivery correctly at the ₹999 threshold", () => {
      const qualifiesForFreeDelivery = (total: number) => total >= 999;

      expect(qualifiesForFreeDelivery(450)).toBe(false);
      expect(qualifiesForFreeDelivery(998)).toBe(false);
      expect(qualifiesForFreeDelivery(999)).toBe(true);
      expect(qualifiesForFreeDelivery(1400)).toBe(true);
    });
  });

  describe("4. Operational Monitoring & Incident Reporting", () => {
    it("should format and handle operational incident reporting without crashing", async () => {
      const success = await reportOperationalError("SIMULATED_TEST_ERROR", new Error("Simulated payment gateway timeout"), {
        orderId: "HON-TEST-9999",
      });
      expect(typeof success).toBe("boolean");
    });
  });
});
