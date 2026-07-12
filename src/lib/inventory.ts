import { apiGet } from "./api";

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
    console.error("Inventory fetch failed:", e);
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
