import { apiGet } from "./api";

// variantId -> remaining stock.
export type StockMap = Record<string, number>;

const CACHE_KEY = "hon-inventory";
const CACHE_TTL_MS = 2 * 60 * 1000;

let lastFetchSuccess = true;

export function isInventoryHealthy(): boolean {
  return lastFetchSuccess;
}

export function setInventoryHealthForTest(healthy: boolean) {
  lastFetchSuccess = healthy;
}

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
    lastFetchSuccess = true;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: stock }));
    return stock;
  } catch (e) {
    lastFetchSuccess = false;
    console.warn("Live inventory service unreachable:", e);
    // Use last known cached inventory if available
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        const { data } = JSON.parse(raw) as { t: number; data: StockMap };
        return data;
      } catch {
        // ignore
      }
    }
    return {};
  }
}

// Check if inventory service is temporarily unavailable
export function isInventoryUnavailable(stock: StockMap): boolean {
  return !lastFetchSuccess && Object.keys(stock).length === 0;
}

// null => untracked / unlimited (only if inventory is healthy)
export function stockOf(stock: StockMap, variantId: string): number | null {
  return Object.prototype.hasOwnProperty.call(stock, variantId) ? stock[variantId] : null;
}

export function isOutOfStock(stock: StockMap, variantId: string): boolean {
  // Fail closed: if inventory is completely unavailable, treat stock as unverified / not purchasable
  if (isInventoryUnavailable(stock)) {
    return true;
  }
  const s = stockOf(stock, variantId);
  return s !== null && s <= 0;
}

export function isLowStock(stock: StockMap, variantId: string): boolean {
  if (isInventoryUnavailable(stock)) return false;
  const s = stockOf(stock, variantId);
  return s !== null && s > 0 && s <= 5;
}
