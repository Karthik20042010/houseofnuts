import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  moveToRecycleBin,
  getRecycledProducts,
  restoreFromRecycleBin,
  permanentlyDeleteFromRecycleBin,
  clearRecycleBin,
  RECYCLE_BIN_KEY,
} from "@/lib/recycleBin";
import { Product } from "@/data/products";
import * as customCatalogModule from "@/lib/customCatalog";
import * as adminModule from "@/lib/admin";

describe("Recycle Bin & Deleted Inventory Management Engine", () => {
  const dummyProduct: Product = {
    id: "test-afghan-figs",
    name: "Afghan Premium Anjeer Figs",
    category: "dry-fruits",
    subcategory: "figs",
    description: "Hand-picked organic sweet figs directly from orchards.",
    image: "/images/catalog/figs.jpg",
    variants: [
      { id: "test-afghan-figs-250g-0", size: "250g", price: 420, mrp: 550 },
      { id: "test-afghan-figs-500g-1", size: "500g", price: 800, mrp: 1050 },
    ],
  };

  const dummyStock = {
    "test-afghan-figs-250g-0": 45,
    "test-afghan-figs-500g-1": 18,
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("should snapshot product details, variants, and stock counts into the recycle bin", () => {
    const recycled = moveToRecycleBin(dummyProduct, dummyStock, "Admin", "Test reason");

    expect(recycled.productId).toBe("test-afghan-figs");
    expect(recycled.deletedBy).toBe("Admin");
    expect(recycled.reason).toBe("Test reason");
    expect(recycled.stockSnapshot).toEqual({
      "test-afghan-figs-250g-0": 45,
      "test-afghan-figs-500g-1": 18,
    });

    const items = getRecycledProducts();
    expect(items).toHaveLength(1);
    expect(items[0].product.name).toBe("Afghan Premium Anjeer Figs");
  });

  it("should handle unlimited / untracked stock (-1) correctly during snapshot", () => {
    const partialStock = {
      "test-afghan-figs-250g-0": 10,
      // 500g is missing, so it should record as -1 (unlimited)
    };

    const recycled = moveToRecycleBin(dummyProduct, partialStock);
    expect(recycled.stockSnapshot["test-afghan-figs-250g-0"]).toBe(10);
    expect(recycled.stockSnapshot["test-afghan-figs-500g-1"]).toBe(-1);
  });

  it("should restore a product and push preserved stock counts to the inventory system", async () => {
    const adminInventorySpy = vi.spyOn(adminModule, "adminUpdateInventory").mockResolvedValue(true as never);
    const syncCatalogSpy = vi.spyOn(customCatalogModule, "syncCatalogConfigToRemote").mockReturnValue();

    // Mark as deleted
    localStorage.setItem("hon_deleted_products_v1", JSON.stringify(["test-afghan-figs", "other-product"]));

    const recycled = moveToRecycleBin(dummyProduct, dummyStock, "Admin");
    expect(getRecycledProducts()).toHaveLength(1);

    let callbackStock: Record<string, number> | null = null;
    const res = await restoreFromRecycleBin(recycled.id, (stock) => {
      callbackStock = stock;
    });

    expect(res.ok).toBe(true);
    expect(res.product?.id).toBe("test-afghan-figs");
    expect(callbackStock).toEqual(dummyStock);

    // Product should be removed from deleted list
    const remainingDeleted = JSON.parse(localStorage.getItem("hon_deleted_products_v1") || "[]");
    expect(remainingDeleted).toEqual(["other-product"]);

    // Recycle bin should be empty
    expect(getRecycledProducts()).toHaveLength(0);

    // Inventory push should be called with variant stock levels
    expect(adminInventorySpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ variantId: "test-afghan-figs-250g-0", stock: 45 }),
        expect.objectContaining({ variantId: "test-afghan-figs-500g-1", stock: 18 }),
      ])
    );

    // Remote sync should be triggered
    expect(syncCatalogSpy).toHaveBeenCalled();
  });

  it("should permanently delete a single item from the recycle bin without restoring it", () => {
    const recycled = moveToRecycleBin(dummyProduct, dummyStock, "Admin");
    expect(getRecycledProducts()).toHaveLength(1);

    const deleted = permanentlyDeleteFromRecycleBin(recycled.id);
    expect(deleted).toBe(true);
    expect(getRecycledProducts()).toHaveLength(0);
  });

  it("should clear the entire recycle bin", () => {
    moveToRecycleBin(dummyProduct, dummyStock, "Admin");
    moveToRecycleBin({ ...dummyProduct, id: "test-product-2", name: "Second Product" }, dummyStock, "Admin");
    expect(getRecycledProducts()).toHaveLength(2);

    const cleared = clearRecycleBin();
    expect(cleared).toBe(true);
    expect(getRecycledProducts()).toHaveLength(0);
    expect(localStorage.getItem(RECYCLE_BIN_KEY)).toBeNull();
  });
});
