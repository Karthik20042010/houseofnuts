import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getProductDisplayOrder,
  saveProductDisplayOrder,
  getCategoryDisplayOrder,
  saveCategoryDisplayOrder,
  getCustomCategories,
  addCustomCategory,
  fetchRemoteCatalogConfig,
  syncCatalogConfigToRemote,
  getAllProducts,
  dedupeCatalogProducts,
} from "@/lib/customCatalog";
import {
  getProductImageSrc,
  getProductGallery,
  setProductImage,
  setProductGallery,
  clearProductImage,
  clearAllProductImageOverrides,
} from "@/lib/productImages";
import { products as baseProducts } from "@/data/products";
import * as apiModule from "@/lib/api";

describe("Catalog & Product Image Database Synchronization Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("should save and retrieve product display order and dispatch sync payload to DB", async () => {
    const apiPostSpy = vi.spyOn(apiModule, "apiPost").mockResolvedValue({ ok: true });

    const testOrder = ["cashews-w320", "california-almonds", "walnuts"];
    saveProductDisplayOrder(testOrder);

    expect(getProductDisplayOrder()).toEqual(testOrder);
    expect(apiPostSpy).toHaveBeenCalledWith("saveCatalogConfig", expect.objectContaining({
      config: expect.objectContaining({
        productOrder: testOrder,
      }),
    }));
  });

  it("should save and retrieve category display order and apply custom category sequence", async () => {
    const apiPostSpy = vi.spyOn(apiModule, "apiPost").mockResolvedValue({ ok: true });

    const categoryOrder = ["all", "gifting", "spices", "chocolates", "nuts"];
    saveCategoryDisplayOrder(categoryOrder);

    expect(getCategoryDisplayOrder()).toEqual(categoryOrder);
    expect(apiPostSpy).toHaveBeenCalledWith("saveCatalogConfig", expect.objectContaining({
      config: expect.objectContaining({
        categoryOrder,
      }),
    }));

    const categories = getCustomCategories();
    expect(categories[0].id).toBe("all");
    expect(categories[1].id).toBe("gifting");
    expect(categories[2].id).toBe("spices");
  });

  it("should set and clear product image overrides and reflect in DB sync payloads", async () => {
    const apiPostSpy = vi.spyOn(apiModule, "apiPost").mockResolvedValue({ ok: true });
    const dummyProd = { id: "test-item-1", image: "/images/default.jpg" };

    expect(getProductImageSrc(dummyProd)).toBe("/images/default.jpg");

    // Set custom image override
    setProductImage("test-item-1", "/images/custom-uploaded-drive.jpg");
    expect(getProductImageSrc(dummyProd)).toBe("/images/custom-uploaded-drive.jpg");
    expect(apiPostSpy).toHaveBeenCalledWith("saveCatalogConfig", expect.objectContaining({
      config: expect.objectContaining({
        imageOverrides: expect.objectContaining({
          "test-item-1": "/images/custom-uploaded-drive.jpg",
        }),
      }),
    }));

    // Clear individual image override
    clearProductImage("test-item-1");
    expect(getProductImageSrc(dummyProd)).toBe("/images/default.jpg");
  });

  it("should set multi-image gallery and clear all overrides back to clean DB default", async () => {
    const apiPostSpy = vi.spyOn(apiModule, "apiPost").mockResolvedValue({ ok: true });
    const testProd = baseProducts[0];

    const customGallery = ["/images/photo1.jpg", "/images/photo2.jpg", "/images/photo3.jpg"];
    setProductGallery(testProd.id, customGallery);

    expect(getProductGallery(testProd)).toEqual(customGallery);

    // Clear all product image overrides completely
    clearAllProductImageOverrides();

    const resetGallery = getProductGallery(testProd);
    expect(resetGallery).toEqual([testProd.image]);
  });

  it("should fetch remote catalog config from DB API and populate local state vice-versa", async () => {
    const mockRemoteConfig = {
      ok: true,
      config: {
        productOrder: ["walnuts", "pistachios"],
        categoryOrder: ["all", "honey", "seeds"],
        customCategories: [{ id: "organic-spices", label: "Organic Spices" }],
        priceOverrides: { "cal-almond-250": { price: 399, mrp: 499 } },
        imageOverrides: { "walnuts": "/images/drive-walnut.jpg" },
      },
    };

    vi.spyOn(apiModule, "apiGet").mockResolvedValue(mockRemoteConfig);

    const success = await fetchRemoteCatalogConfig();
    expect(success).toBe(true);

    expect(getProductDisplayOrder()).toEqual(["walnuts", "pistachios"]);
    expect(getCategoryDisplayOrder()).toEqual(["all", "honey", "seeds"]);
    expect(getProductImageSrc({ id: "walnuts", image: "/images/catalog/walnuts.jpg" })).toBe("/images/drive-walnut.jpg");

    const allProds = getAllProducts(baseProducts);
    const calAlmond = allProds.find((p) => p.id === "california-almonds");
    const variant250 = calAlmond?.variants.find((v) => v.id === "cal-almond-250");
    expect(variant250?.price).toBe(399);
  });

  it("keeps only the latest record when a catalog contains duplicate products", () => {
    const original = baseProducts.find((product) => product.id === "standard-walnuts")!;
    const duplicate = { ...original, id: "standard-walnuts-copy", variants: original.variants.map((v) => ({ ...v, price: v.price - 10 })) };

    const result = dedupeCatalogProducts([original, duplicate]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("standard-walnuts-copy");
    expect(result[0].variants[0].price).toBe(409);
  });
});
