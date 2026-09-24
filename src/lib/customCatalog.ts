import { Product, ProductVariant, categories as defaultCategories } from "@/data/products";
import { apiGet, apiPost } from "./api";
import { clearProductImageCache } from "./productImages";

export interface CustomCategory {
  id: string;
  label: string;
}

export interface CustomSubcategory {
  id: string;
  label: string;
  parentCategory: string;
}

export interface PriceOverride {
  price: number;
  mrp?: number;
}

export const DEFAULT_SUBCATEGORIES: CustomSubcategory[] = [
  // Nuts
  { id: "almonds", label: "Almonds (Badam)", parentCategory: "nuts" },
  { id: "cashews", label: "Cashews (Kaju)", parentCategory: "nuts" },
  { id: "pistachios", label: "Pistachios (Pista)", parentCategory: "nuts" },
  { id: "walnuts", label: "Walnuts (Akhrot)", parentCategory: "nuts" },

  // Dry Fruits
  { id: "dates", label: "Dates (Khajur)", parentCategory: "dry-fruits" },
  { id: "figs", label: "Figs (Anjeer)", parentCategory: "dry-fruits" },
  { id: "raisins", label: "Raisins (Kishmish)", parentCategory: "dry-fruits" },
  { id: "berries", label: "Berries & Exotic Fruits", parentCategory: "dry-fruits" },

  // Spices
  { id: "saffron", label: "Kashmiri Saffron (Kesar)", parentCategory: "spices" },
  { id: "cardamom", label: "Green Cardamom (Elaichi)", parentCategory: "spices" },
  { id: "whole-spices", label: "Whole Organic Spices", parentCategory: "spices" },

  // Honey
  { id: "raw-honey", label: "Raw Wild Forest Honey", parentCategory: "honey" },
  { id: "infused-honey", label: "Nut & Herbal Infused Honey", parentCategory: "honey" },

  // Chocolates
  { id: "nut-chocolates", label: "Nut Chocolates & Dragees", parentCategory: "chocolates" },
  { id: "dark-chocolates", label: "Artisanal Dark Chocolates", parentCategory: "chocolates" },

  // Mixes
  { id: "trail-mixes", label: "Superfood Trail Mixes", parentCategory: "mixes" },
  { id: "snack-mixes", label: "Roasted Snack Mixes", parentCategory: "mixes" },

  // Gifting
  { id: "wooden-boxes", label: "Royal Wooden Gift Boxes", parentCategory: "gifting" },
  { id: "festive-hampers", label: "Festive Gift Hampers", parentCategory: "gifting" },

  // Seeds
  { id: "chia-flax", label: "Organic Chia & Flax Seeds", parentCategory: "seeds" },
  { id: "sunflower-pumpkin", label: "Pumpkin & Sunflower Seeds", parentCategory: "seeds" },

  // Gourmet Flavors
  { id: "savory-roasted", label: "Savory & Spice Roasted", parentCategory: "flavored-nuts" },
  { id: "sweet-roasted", label: "Honey & Sweet Glazed", parentCategory: "flavored-nuts" },

  // Stuffed Dates
  { id: "delicacies", label: "Nut & Saffron Delicacies", parentCategory: "stuffed-dates" },

  // Solar Dried
  { id: "solar-fruits", label: "Solar Dried Natural Fruits", parentCategory: "solar-dried" },

  // Admin & Developer QA Test Subcategories
  { id: "stock-levels-qa", label: "Stock Levels & Thresholds QA", parentCategory: "stock-inventory-test" },
  { id: "order-workflow-qa", label: "Order & Payment Workflow QA", parentCategory: "orders-qa-test" },
  { id: "developer-logs-qa", label: "System Telemetry & Metrics QA", parentCategory: "dev-sandbox" },
];

const CUSTOM_PRODUCTS_KEY = "hon_custom_products_v1";
const CUSTOM_CATEGORIES_KEY = "hon_custom_categories_v1";
const CUSTOM_SUBCATEGORIES_KEY = "hon_custom_subcategories_v1";
const CUSTOM_PRICE_OVERRIDES_KEY = "hon_custom_price_overrides_v1";
const CUSTOM_CATEGORY_ORDER_KEY = "hon_category_display_order_v1";
const CUSTOM_PRODUCT_ORDER_KEY = "hon_product_display_order_v1";
// A published catalog is the sole source of truth for customers.  The old
// local keys are retained only while an existing installation is being
// migrated; they must never override a published database catalog.
const REMOTE_CATALOG_KEY = "hon_remote_catalog_v2";

let isFetchingRemote = false;

/**
 * The Sheets API can contain old rows from before a product was corrected.
 * Do not show (or re-publish) two cards for the same SKU or the same sellable
 * item. Later rows win: Sheets appends the most recently saved record last.
 */
/**
 * De-duplicates products strictly by immutable product ID.
 * Distinct products with their own unique IDs and SKUs are never heuristically merged.
 */
export function dedupeCatalogProducts(products: Product[]): Product[] {
  const byId = new Map<string, Product>();
  for (const product of products) {
    if (!product?.id || !product?.name || !Array.isArray(product.variants) || product.variants.length === 0) continue;

    // Filter duplicate variants within the same product by SKU
    const seenVariantIds = new Set<string>();
    const uniqueVariants = product.variants.filter((v) => {
      if (!v?.id || seenVariantIds.has(v.id)) return false;
      seenVariantIds.add(v.id);
      return true;
    });
    if (uniqueVariants.length === 0) continue;

    if (byId.has(product.id)) byId.delete(product.id);
    byId.set(product.id, {
      ...product,
      variants: uniqueVariants,
      status: product.status || "active",
    });
  }

  const bySellableIdentity = new Map<string, Product>();
  for (const product of byId.values()) {
    const sizes = product.variants.map((variant) => variant.size.trim().toLowerCase()).sort().join("|");
    const identity = `${product.category}|${product.name.trim().toLowerCase()}|${(product.localName || "").trim().toLowerCase()}|${sizes}`;
    if (bySellableIdentity.has(identity)) bySellableIdentity.delete(identity);
    bySellableIdentity.set(identity, product);
  }
  return Array.from(bySellableIdentity.values());
}

/**
 * Returns potential duplicates (products sharing display names under different IDs)
 * so staff can review, merge or archive them intentionally.
 */
export function findPotentialDuplicates(products: Product[]): Array<{ original: Product; duplicate: Product; reason: string }> {
  const potential: Array<{ original: Product; duplicate: Product; reason: string }> = [];
  const nameMap = new Map<string, Product>();
  for (const p of products) {
    const key = p.name.trim().toLowerCase();
    if (nameMap.has(key)) {
      potential.push({
        original: nameMap.get(key)!,
        duplicate: p,
        reason: `Shared product name "${p.name}" with distinct IDs (${nameMap.get(key)!.id} vs ${p.id})`,
      });
    } else {
      nameMap.set(key, p);
    }
  }
  return potential;
}

export function cleanProductFields(p: Product): Product {
  if (!p) return p;
  const cleanPath = (s?: string) =>
    s ? s.replace(/["'\\]/g, "").trim() : "";
  const cleanText = (s?: string) =>
    s ? s.replace(/^["']|["']$/g, "").trim() : "";
  return {
    ...p,
    name: cleanText(p.name),
    image: cleanPath(p.image),
    images: Array.isArray(p.images) ? p.images.map(cleanPath).filter(Boolean) : undefined,
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          ...v,
          price: Number(v.price) || 0,
          mrp: Number(v.mrp) || (v as unknown as { discountPrice?: number }).discountPrice || Number(v.price) || 0,
        }))
      : [],
  };
}

export async function fetchRemoteCatalogConfig(): Promise<boolean> {
  if (isFetchingRemote) return false;
  isFetchingRemote = true;
  let hasChanges = false;
  try {
    // 1. Fetch products & Google Drive image URLs from Google Sheets Products tab
    let rawSheetProducts: Product[] = [];
    try {
      const prodRes = await apiGet<{ ok: boolean; products?: Product[] }>("getProducts");
      if (prodRes && prodRes.ok && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        rawSheetProducts = prodRes.products.map(cleanProductFields);

        // Sync Google Drive CDN image URLs for products
        const currentImgOverridesRaw = localStorage.getItem("hon-product-image-overrides-v1");
        const currentImgOverrides: Record<string, string> = currentImgOverridesRaw ? JSON.parse(currentImgOverridesRaw) : {};
        let imgOverrideChanged = false;

        for (const p of rawSheetProducts) {
          if (p.id && p.image && (p.image.includes("googleusercontent") || p.image.includes("drive.google"))) {
            if (currentImgOverrides[p.id] !== p.image) {
              currentImgOverrides[p.id] = p.image;
              imgOverrideChanged = true;
            }
          }
        }
        if (imgOverrideChanged) {
          localStorage.setItem("hon-product-image-overrides-v1", JSON.stringify(currentImgOverrides));
          clearProductImageCache();
        }

        hasChanges = true;
      }
    } catch (e) {
      console.debug("Backend getProducts fetch fallback:", e);
    }

    // 2. Fetch central catalog config (custom categories, order, price/image overrides)
    const res = await apiGet<{
      ok: boolean;
      config?: {
        productOrder?: string[];
        categoryOrder?: string[];
        customCategories?: CustomCategory[];
        customSubcategories?: CustomSubcategory[];
        customProducts?: Product[];
        priceOverrides?: Record<string, PriceOverride>;
        imageOverrides?: Record<string, string>;
        galleryOverrides?: Record<string, string[]>;
        catalogVersion?: number;
      };
    }>("getCatalogConfig");

    if (res && res.ok && res.config) {
      const {
        productOrder,
        categoryOrder,
        customCategories,
        customSubcategories,
        customProducts,
        priceOverrides,
        imageOverrides,
        galleryOverrides,
      } = res.config;

      // Extract and unify products from Google Sheets database
      const rawCustomProds: Product[] = Array.isArray(customProducts) ? customProducts.map(cleanProductFields) : [];
      const combinedDbProductsMap = new Map<string, Product>();

      // Base sheet products first
      for (const p of rawSheetProducts) {
        if (p.id) combinedDbProductsMap.set(p.id, p);
      }
      // Rich custom configured products override and augment
      for (const p of rawCustomProds) {
        if (p.id) combinedDbProductsMap.set(p.id, p);
      }

      const allDbProducts = Array.from(combinedDbProductsMap.values());
      if (allDbProducts.length > 0) {
        const dedupedDb = dedupeCatalogProducts(allDbProducts);
        localStorage.setItem(REMOTE_CATALOG_KEY, JSON.stringify(dedupedDb));
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(dedupedDb));
        hasChanges = true;
      }

      if (productOrder) {
        localStorage.setItem(CUSTOM_PRODUCT_ORDER_KEY, JSON.stringify(productOrder));
        hasChanges = true;
      }
      if (categoryOrder) {
        localStorage.setItem(CUSTOM_CATEGORY_ORDER_KEY, JSON.stringify(categoryOrder));
        hasChanges = true;
      }
      if (customCategories) {
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
        hasChanges = true;
      }
      if (customSubcategories) {
        localStorage.setItem(CUSTOM_SUBCATEGORIES_KEY, JSON.stringify(customSubcategories));
        hasChanges = true;
      }
      if (priceOverrides) {
        localStorage.setItem(CUSTOM_PRICE_OVERRIDES_KEY, JSON.stringify(priceOverrides));
        hasChanges = true;
      }
      if (imageOverrides) {
        const currentImgOverridesRaw = localStorage.getItem("hon-product-image-overrides-v1");
        const currentImgOverrides: Record<string, string> = currentImgOverridesRaw ? JSON.parse(currentImgOverridesRaw) : {};
        const mergedImgOverrides = { ...currentImgOverrides, ...imageOverrides };
        localStorage.setItem("hon-product-image-overrides-v1", JSON.stringify(mergedImgOverrides));
        clearProductImageCache();
        hasChanges = true;
      }
      if (galleryOverrides) {
        const cleanedGallery: Record<string, string[]> = {};
        for (const [k, imgs] of Object.entries(galleryOverrides)) {
          if (Array.isArray(imgs) && imgs.length <= 10) {
            cleanedGallery[k] = imgs;
          }
        }
        localStorage.setItem("hon-product-gallery-overrides-v1", JSON.stringify(cleanedGallery));
        clearProductImageCache();
        hasChanges = true;
      }
    } else if (rawSheetProducts.length > 0) {
      const dedupedDb = dedupeCatalogProducts(rawSheetProducts);
      localStorage.setItem(REMOTE_CATALOG_KEY, JSON.stringify(dedupedDb));
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(dedupedDb));
      hasChanges = true;
    }

    if (hasChanges) {
      window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    }
    return true;
  } catch (err) {
    console.debug("Backend catalog config fetch offline / using local cache:", err);
  } finally {
    isFetchingRemote = false;
  }
  return false;
}


export function syncCatalogConfigToRemote() {
  try {
    const config = {
      productOrder: getProductDisplayOrder(),
      categoryOrder: getCategoryDisplayOrder(),
      customCategories: JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]"),
      customSubcategories: JSON.parse(localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY) || "[]"),
      customProducts: JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]"),
      priceOverrides: getPriceOverrides(),
      imageOverrides: JSON.parse(localStorage.getItem("hon-product-image-overrides-v1") || "{}"),
      galleryOverrides: JSON.parse(localStorage.getItem("hon-product-gallery-overrides-v1") || "{}"),
    };
    const rawSession = sessionStorage.getItem("hon-admin-session");
    let token = "";
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        token = parsed.token || parsed.password || "";
      } catch {}
    }
    apiPost("saveCatalogConfig", { token, sessionToken: token, password: token, config }).catch((err) => {
      console.debug("Remote catalog config save using local cache fallback:", err);
    });
  } catch {
    // Ignore storage parse errors
  }
}

export function getCategoryDisplayOrder(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORY_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCategoryDisplayOrder(orderedIds: string[]) {
  try {
    localStorage.setItem(CUSTOM_CATEGORY_ORDER_KEY, JSON.stringify(orderedIds));
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
  } catch {
    // Ignore storage errors
  }
}

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const stored: CustomCategory[] = raw ? JSON.parse(raw) : [];

    const existingIds = new Set(defaultCategories.map((c) => c.id));
    const merged: CustomCategory[] = [...defaultCategories];
    for (const c of stored) {
      if (!existingIds.has(c.id as never)) {
        merged.push(c);
        existingIds.add(c.id as never);
      }
    }

    const categoryOrder = getCategoryDisplayOrder();
    if (categoryOrder && categoryOrder.length > 0) {
      const orderMap = new Map<string, number>();
      categoryOrder.forEach((id, idx) => orderMap.set(id, idx));

      merged.sort((a, b) => {
        if (a.id === "all") return -1;
        if (b.id === "all") return 1;

        const indexA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
        const indexB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
        return indexA - indexB;
      });
    }

    return merged;
  } catch {
    return [...defaultCategories];
  }
}

export function addCustomCategory(label: string): CustomCategory {
  const id = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const newCat: CustomCategory = { id, label: label.trim() };

  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const stored: CustomCategory[] = raw ? JSON.parse(raw) : [];
    if (!stored.some((c) => c.id === id)) {
      stored.push(newCat);
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent("hon-catalog-update"));
      syncCatalogConfigToRemote();
    }
  } catch {
    // Ignore storage errors
  }
  return newCat;
}

export function getSubcategoriesForCategory(parentCategoryId: string): CustomSubcategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY);
    const stored: CustomSubcategory[] = raw ? JSON.parse(raw) : [];
    const all = [...DEFAULT_SUBCATEGORIES, ...stored];

    if (parentCategoryId === "all") {
      return all;
    }
    return all.filter((s) => s.parentCategory === parentCategoryId);
  } catch {
    return DEFAULT_SUBCATEGORIES.filter(
      (s) => parentCategoryId === "all" || s.parentCategory === parentCategoryId
    );
  }
}

export function addCustomSubcategory(parentCategory: string, label: string): CustomSubcategory {
  const id = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  const newSubcat: CustomSubcategory = { id, label: label.trim(), parentCategory };

  try {
    const raw = localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY);
    const stored: CustomSubcategory[] = raw ? JSON.parse(raw) : [];
    if (!stored.some((s) => s.id === id && s.parentCategory === parentCategory)) {
      stored.push(newSubcat);
      localStorage.setItem(CUSTOM_SUBCATEGORIES_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent("hon-catalog-update"));
      syncCatalogConfigToRemote();
    }
  } catch {
    // Ignore
  }
  return newSubcat;
}

export function getPriceOverrides(): Record<string, PriceOverride> {
  try {
    const raw = localStorage.getItem(CUSTOM_PRICE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePriceOverrides(overrides: Record<string, PriceOverride>) {
  try {
    localStorage.setItem(CUSTOM_PRICE_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
  } catch {
    // Ignore storage errors
  }
}

// Auto-infer subcategory for default base products
function autoInferSubcategory(product: Product): string | undefined {
  if (product.subcategory) return product.subcategory;
  const nameLower = product.name.toLowerCase();
  const idLower = product.id.toLowerCase();
  const localLower = (product.localName || "").toLowerCase();

  if (nameLower.includes("almond") || localLower.includes("badam") || idLower.includes("almond")) return "almonds";
  if (nameLower.includes("cashew") || localLower.includes("kaju") || idLower.includes("cashew")) return "cashews";
  if (nameLower.includes("pista") || nameLower.includes("pistachio") || idLower.includes("pista")) return "pistachios";
  if (nameLower.includes("walnut") || localLower.includes("akhrot") || idLower.includes("walnut")) return "walnuts";
  if (nameLower.includes("pecan") || nameLower.includes("brazil")) return "nuts";

  if (nameLower.includes("date") || localLower.includes("khajur") || idLower.includes("date")) return "dates";
  if (nameLower.includes("fig") || localLower.includes("anjeer") || idLower.includes("fig")) return "figs";
  if (nameLower.includes("raisin") || localLower.includes("kishmish") || idLower.includes("raisin")) return "raisins";
  if (nameLower.includes("berry") || nameLower.includes("blueberry") || nameLower.includes("blackberry") || nameLower.includes("plum") || nameLower.includes("apricot")) return "berries";

  if (nameLower.includes("saffron") || localLower.includes("kesar")) return "saffron";
  if (nameLower.includes("cardamom") || localLower.includes("elaichi")) return "cardamom";

  if (nameLower.includes("amla") || nameLower.includes("mango") || nameLower.includes("pineapple") || nameLower.includes("kiwi")) return "solar-fruits";
  if (nameLower.includes("chia") || nameLower.includes("flax") || nameLower.includes("haleem")) return "chia-flax";
  if (nameLower.includes("sunflower") || nameLower.includes("pumpkin") || nameLower.includes("watermelon")) return "sunflower-pumpkin";

  if (nameLower.includes("honey")) return "raw-honey";
  if (nameLower.includes("trail") || nameLower.includes("mix") || nameLower.includes("makhana")) return "trail-mixes";

  return undefined;
}


export function getProductDisplayOrder(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCT_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProductDisplayOrder(orderedIds: string[]) {
  try {
    localStorage.setItem(CUSTOM_PRODUCT_ORDER_KEY, JSON.stringify(orderedIds));
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
  } catch {
    // Ignore storage errors
  }
}

const CUSTOM_DELETED_PRODUCTS_KEY = "hon_deleted_products_v1";
const CUSTOM_DELETED_VARIANTS_KEY = "hon_deleted_variants_v1";

export function getDeletedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDeletedVariantIds(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_DELETED_VARIANTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllProducts(baseProducts: Product[]): Product[] {
  // Once the catalog is published, do not merge it with the build-time list.
  // Doing so was the direct cause of products being visible in the shop but
  // absent (or different) in inventory.
  try {
    const rawRemote = localStorage.getItem(REMOTE_CATALOG_KEY);
    if (rawRemote) {
      const remote = JSON.parse(rawRemote) as Product[];
      if (Array.isArray(remote) && remote.length > 0) {
        const deletedProductIds = new Set(getDeletedProductIds());
        const deletedVariantIds = new Set(getDeletedVariantIds());
        const overrides = getPriceOverrides();
        const filtered = remote
          .filter((p) => !deletedProductIds.has(p.id))
          .map((p) => {
            const updatedVariants = (p.variants || [])
              .filter((v) => !deletedVariantIds.has(v.id))
              .map((v) => {
                const ov = overrides[v.id];
                if (ov) {
                  return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
                }
                return v;
              });
            return { ...p, variants: updatedVariants };
          })
          .filter((p) => p.variants.length > 0);
        return dedupeCatalogProducts(filtered);
      }
    }
  } catch {
    localStorage.removeItem(REMOTE_CATALOG_KEY);
  }
  let customProducts: Product[] = [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) {
      customProducts = JSON.parse(raw);
    }
  } catch {
    customProducts = [];
  }

  const deletedProductIds = new Set(getDeletedProductIds());
  const deletedVariantIds = new Set(getDeletedVariantIds());
  const overrides = getPriceOverrides();
  const combinedMap = new Map<string, Product>();

  for (const p of baseProducts) {
    if (deletedProductIds.has(p.id)) continue;

    const inferredSubcat = autoInferSubcategory(p);
    const updatedVariants = p.variants
      .filter((v) => !deletedVariantIds.has(v.id))
      .map((v) => {
        const ov = overrides[v.id];
        if (ov) {
          return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
        }
        return v;
      });

    if (updatedVariants.length > 0) {
      combinedMap.set(p.id, { ...p, subcategory: inferredSubcat, variants: updatedVariants });
    }
  }

  for (const cp of customProducts) {
    if (deletedProductIds.has(cp.id)) continue;

    const updatedVariants = cp.variants
      .filter((v) => !deletedVariantIds.has(v.id))
      .map((v) => {
        const ov = overrides[v.id];
        if (ov) {
          return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
        }
        return v;
      });

    if (updatedVariants.length > 0) {
      combinedMap.set(cp.id, { ...cp, variants: updatedVariants });
    }
  }

  const allList = Array.from(combinedMap.values());
  const customOrder = getProductDisplayOrder();

  if (customOrder && customOrder.length > 0) {
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, idx) => orderMap.set(id, idx));

    allList.sort((a, b) => {
      const indexA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
      const indexB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
      return indexA - indexB;
    });
  }

  return dedupeCatalogProducts(allList);
}

export function deleteCustomProduct(productId: string): boolean {
  try {
    localStorage.removeItem(REMOTE_CATALOG_KEY);
    const deletedProds = getDeletedProductIds();
    if (!deletedProds.includes(productId)) {
      deletedProds.push(productId);
      localStorage.setItem(CUSTOM_DELETED_PRODUCTS_KEY, JSON.stringify(deletedProds));
    }

    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) {
      const stored: Product[] = JSON.parse(raw);
      const filtered = stored.filter((p) => p.id !== productId);
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(filtered));
    }

    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
    return true;
  } catch {
    return false;
  }
}

export function restoreAllDeletedBaseProducts(): boolean {
  try {
    localStorage.removeItem(REMOTE_CATALOG_KEY);
    localStorage.removeItem(CUSTOM_DELETED_PRODUCTS_KEY);
    localStorage.removeItem(CUSTOM_DELETED_VARIANTS_KEY);
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
    return true;
  } catch {
    return false;
  }
}

export function deleteVariantFromProduct(productId: string, variantId: string): boolean {
  try {
    localStorage.removeItem(REMOTE_CATALOG_KEY);
    const deletedVars = getDeletedVariantIds();
    if (!deletedVars.includes(variantId)) {
      deletedVars.push(variantId);
      localStorage.setItem(CUSTOM_DELETED_VARIANTS_KEY, JSON.stringify(deletedVars));
    }

    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) {
      const stored: Product[] = JSON.parse(raw);
      const target = stored.find((p) => p.id === productId);
      if (target) {
        target.variants = target.variants.filter((v) => v.id !== variantId);
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(stored));
      }
    }

    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
    return true;
  } catch {
    return false;
  }
}

export function addCustomProduct(newProduct: Omit<Product, "id"> & { id?: string }): Product {
  const id = newProduct.id || newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  // Un-delete product if re-created
  try {
    localStorage.removeItem(REMOTE_CATALOG_KEY);
    const deleted = getDeletedProductIds().filter((d) => d !== id);
    localStorage.setItem(CUSTOM_DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
  } catch {}

  const fullProduct: Product = {
    ...newProduct,
    id,
    variants: newProduct.variants.map((v, i) => ({
      ...v,
      id: v.id || `${id}-${v.size.toLowerCase().replace(/[^a-z0-9]+/g, "")}-${i}`,
    })),
  };

  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    const stored: Product[] = raw ? JSON.parse(raw) : [];
    const index = stored.findIndex((p) => p.id === id);
    if (index >= 0) {
      stored[index] = fullProduct;
    } else {
      stored.push(fullProduct);
    }
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(stored));
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));
    syncCatalogConfigToRemote();
  } catch {
    // Ignore storage errors
  }

  return fullProduct;
}

export function getCustomSubcategories(): CustomSubcategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Replace the browser cache only after the database confirms a publish. */
export function setPublishedCatalog(products: Product[]) {
  localStorage.setItem(REMOTE_CATALOG_KEY, JSON.stringify(dedupeCatalogProducts(products)));
  window.dispatchEvent(new CustomEvent("hon-catalog-update"));
}

export function addVariantToProduct(productId: string, variant: ProductVariant): boolean {
  try {
    // Un-delete variant if re-created
    if (variant.id) {
      const deletedVars = getDeletedVariantIds().filter((v) => v !== variant.id);
      localStorage.setItem(CUSTOM_DELETED_VARIANTS_KEY, JSON.stringify(deletedVars));
    }

    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    const stored: Product[] = raw ? JSON.parse(raw) : [];
    const target = stored.find((p) => p.id === productId);
    if (target) {
      target.variants.push(variant);
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent("hon-catalog-update"));
      syncCatalogConfigToRemote();
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

import { useState, useEffect } from "react";
import { products as defaultProducts } from "@/data/products";

export function useCatalog() {
  const [categoriesList, setCategoriesList] = useState(getCustomCategories);
  const [allProductsList, setAllProductsList] = useState(() => getAllProducts(defaultProducts));

  useEffect(() => {
    // Sync remote central catalog config on mount for all visitors
    fetchRemoteCatalogConfig().then((hasChanges) => {
      if (hasChanges) {
        setCategoriesList(getCustomCategories());
        setAllProductsList(getAllProducts(defaultProducts));
      }
    });

    const handleUpdate = () => {
      setCategoriesList(getCustomCategories());
      setAllProductsList(getAllProducts(defaultProducts));
    };

    window.addEventListener("hon-catalog-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("hon-catalog-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { categories: categoriesList, products: allProductsList };
}
