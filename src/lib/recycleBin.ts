import { Product } from "@/data/products";
import {
  addCustomProduct,
  getDeletedProductIds,
  getDeletedVariantIds,
  syncCatalogConfigToRemote,
} from "./customCatalog";
import { adminUpdateInventory } from "./admin";

export interface RecycledProduct {
  id: string; // Unique trash entry ID
  productId: string;
  product: Product;
  stockSnapshot: Record<string, number>; // variantId -> stock count at deletion time
  deletedAt: string; // ISO timestamp
  deletedBy: string; // e.g. "admin"
  reason?: string;
}

export const RECYCLE_BIN_KEY = "hon_recycle_bin_v1";
export const RECYCLE_BIN_EVENT = "hon-recycle-bin-update";

/**
 * Get all deleted items in the Recycle Bin, sorted latest deletion first.
 */
export function getRecycledProducts(): RecycledProduct[] {
  try {
    const raw = localStorage.getItem(RECYCLE_BIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the Recycle Bin list to local storage.
 */
export function saveRecycledProducts(items: RecycledProduct[]) {
  try {
    localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(RECYCLE_BIN_EVENT));
  } catch (e) {
    console.warn("Failed to persist recycle bin to storage:", e);
  }
}

/**
 * Move a product and its exact variant stock levels into the Recycle Bin.
 */
export function moveToRecycleBin(
  product: Product,
  stockMap: Record<string, number> = {},
  actor = "admin",
  reason = "Deleted by admin"
): RecycledProduct {
  const stockSnapshot: Record<string, number> = {};
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v?.id) {
        stockSnapshot[v.id] = typeof stockMap[v.id] === "number" ? stockMap[v.id] : -1;
      }
    }
  }

  const recycledItem: RecycledProduct = {
    id: `recycled_${product.id}_${Date.now()}`,
    productId: product.id,
    product: JSON.parse(JSON.stringify(product)),
    stockSnapshot,
    deletedAt: new Date().toISOString(),
    deletedBy: actor,
    reason,
  };

  const current = getRecycledProducts().filter((item) => item.productId !== product.id);
  current.unshift(recycledItem);
  saveRecycledProducts(current);

  return recycledItem;
}

/**
 * Restore a recycled product and its stock counts back into the live catalog and inventory.
 */
export async function restoreFromRecycleBin(
  recycledId: string,
  onStockRestored?: (restoredStock: Record<string, number>) => void
): Promise<{ ok: boolean; product?: Product; error?: string }> {
  try {
    const all = getRecycledProducts();
    const item = all.find((r) => r.id === recycledId);
    if (!item) {
      return { ok: false, error: "Recycled item not found" };
    }

    // 1. Remove from deleted products filter list so it appears in active catalog
    const deletedIds = getDeletedProductIds().filter((id) => id !== item.productId);
    localStorage.setItem("hon_deleted_products_v1", JSON.stringify(deletedIds));

    // 2. Remove variants from deleted variants filter list
    const variantIdsToRestore = new Set((item.product.variants || []).map((v) => v.id));
    const deletedVariantIds = getDeletedVariantIds().filter((vId) => !variantIdsToRestore.has(vId));
    localStorage.setItem("hon_deleted_variants_v1", JSON.stringify(deletedVariantIds));

    // Clear remote catalog cache so fresh list is computed
    localStorage.removeItem("hon_remote_catalog_v2");

    // 3. Add product back into custom products registry
    addCustomProduct(item.product);

    // 4. Restore variant stock levels into inventory database
    const inventoryUpdates: Array<{ variantId: string; productId: string; size: string; stock: number }> = [];
    for (const v of item.product.variants) {
      if (v?.id && typeof item.stockSnapshot[v.id] === "number" && item.stockSnapshot[v.id] >= 0) {
        inventoryUpdates.push({
          variantId: v.id,
          productId: item.productId,
          size: v.size,
          stock: item.stockSnapshot[v.id],
        });
      }
    }

    if (inventoryUpdates.length > 0) {
      try {
        await adminUpdateInventory(inventoryUpdates);
      } catch (e) {
        console.warn("Failed to push restored stock to server:", e);
      }
    }

    if (onStockRestored) {
      onStockRestored(item.stockSnapshot);
    }

    // 5. Remove from recycle bin
    const remaining = all.filter((r) => r.id !== recycledId);
    saveRecycledProducts(remaining);

    syncCatalogConfigToRemote();
    window.dispatchEvent(new CustomEvent("hon-catalog-update"));

    return { ok: true, product: item.product };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Permanently erase an item from the Recycle Bin.
 */
export function permanentlyDeleteFromRecycleBin(recycledId: string): boolean {
  try {
    const all = getRecycledProducts();
    const filtered = all.filter((r) => r.id !== recycledId);
    saveRecycledProducts(filtered);
    return true;
  } catch {
    return false;
  }
}

/**
 * Empty all items from the Recycle Bin.
 */
export function clearRecycleBin(): boolean {
  try {
    localStorage.removeItem(RECYCLE_BIN_KEY);
    window.dispatchEvent(new CustomEvent(RECYCLE_BIN_EVENT));
    return true;
  } catch {
    return false;
  }
}
