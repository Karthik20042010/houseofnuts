import { apiGet } from "./api";
import { isCategoryComingSoon } from "./accessControl";
import { UserRole } from "@/types/auth";
import { Product } from "@/data/products";

// variantId -> remaining stock. If a variantId is NOT present, treat it as
// untracked (unlimited) so a fresh Sheet with no Inventory rows doesn't
// accidentally hide every product.
export type StockMap = Record<string, number>;

const CACHE_KEY = "hon-inventory";
const CACHE_TTL_MS = 2 * 60 * 1000;

export async function fetchInventory(force = false): Promise<StockMap> {
  if (!force) {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        const { t, data } = JSON.parse(raw) as { t: number; data: StockMap };
        if (Date.now() - t < CACHE_TTL_MS) return data;
      } catch {
        // ignore
      }
    }
  }
  try {
    const res = await apiGet<{ ok: boolean; stock?: StockMap }>("getInventory");
    const stock = res.stock ?? {};
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: stock }));
    return stock;
  } catch (e) {
    console.warn("Inventory fetch using local default stock map:", e);
    return {};
  }
}

// null => untracked / unlimited
export function stockOf(stock: StockMap, variantId: string): number | null {
  return Object.prototype.hasOwnProperty.call(stock, variantId) ? stock[variantId] : null;
}

export function isOutOfStock(stock: StockMap, variantId: string): boolean {
  const s = stockOf(stock, variantId);
  return s !== null && s <= 0;
}

export function isLowStock(stock: StockMap, variantId: string): boolean {
  const s = stockOf(stock, variantId);
  return s !== null && s > 0 && s <= 5;
}

export function isProductOutOfStock(product: { variants: Array<{ id: string }> }, stock: StockMap): boolean {
  if (!product || !product.variants || product.variants.length === 0) return false;
  return product.variants.every((v) => isOutOfStock(stock, v.id));
}

/**
 * Sorts products so that:
 * 1. Available / In-Stock active products come first (Rank 0)
 * 2. Out-of-Stock products move below available products (Rank 1)
 * 3. Coming Soon category products move to the VERY END (Rank 2)
 */
export function sortProductsWithStockAndComingSoonLast<T extends Product>(
  productsList: T[],
  stock: StockMap,
  userState?: { isLoggedIn?: boolean; role?: UserRole },
  sortBy: string = "default"
): T[] {
  const getProductRank = (p: T): number => {
    if (isCategoryComingSoon(p.category, userState)) {
      return 2;
    }
    if (isProductOutOfStock(p, stock)) {
      return 1;
    }
    return 0;
  };

  const getMinPrice = (p: T) =>
    Math.min(...p.variants.map((v) => v.price));

  return [...productsList].sort((a, b) => {
    const rankA = getProductRank(a);
    const rankB = getProductRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    switch (sortBy) {
      case "price-asc":
        return getMinPrice(a) - getMinPrice(b);
      case "price-desc":
        return getMinPrice(b) - getMinPrice(a);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
}
