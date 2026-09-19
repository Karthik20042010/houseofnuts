// Per-SKU image overrides. Stored in localStorage keyed by product id so the
// admin can swap catalog images without a backend deploy. Uploaded files are
// converted to data URLs (kept small — we warn above ~1.5MB). Pasted URLs are
// stored verbatim. A tiny pub/sub keeps every card in the app in sync the
// moment an override changes.
import { useSyncExternalStore } from "react";
import type { Product } from "@/data/products";

const STORAGE_KEY = "hon-product-image-overrides-v1";

type Overrides = Record<string, string>;

const listeners = new Set<() => void>();
let cache: Overrides | null = null;

function read(): Overrides {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Overrides) {
  cache = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function clearProductImageCache() {
  cache = null;
  listeners.forEach((l) => l());
}

export function getAllOverrides(): Overrides {
  return { ...read() };
}

const CATEGORY_FALLBACKS: Record<string, string[]> = {
  nuts: ["/images/nuts/almonds.jpg", "/images/catalog/walnuts.jpg", "/images/nuts/cashews.jpg", "/images/nuts/pistachios.jpg"],
  "flavored-nuts": ["/images/nuts/almonds.jpg", "/images/nuts/cashews.jpg"],
  "stuffed-dates": ["/images/dry-fruits/dates.jpg", "/images/dry-fruits/anjeer.jpg"],
  "dry-fruits": ["/images/dry-fruits/anjeer.jpg", "/images/dry-fruits/dates.jpg", "/images/dry-fruits/dried-kiwi.jpg"],
  "solar-dried": ["/images/dry-fruits/dried-kiwi.jpg"],
  seeds: ["/images/seeds/pumpkin-seeds.jpg", "/images/seeds/sunflower-seeds.png"],
  mixes: ["/images/mixes/berry-mix.jpg", "/images/mixes/trail-mix.jpg"],
  chocolates: ["/images/chocolates/lindt-lindor-red-main.jpeg", "/images/chocolates/godiva-dark-truffe.png"],
  spices: ["/images/spices/spices-hero.png", "/images/spices/saffron.jpg", "/images/spices/cardamom.jpg"],
  honey: ["/images/honey/wild-honey-hero.png", "/images/honey/honey-jar.jpg"],
  gifting: ["/images/gifting/gift-box-classic.jpg", "/images/gifting/gift-hamper-luxury.jpg"],
};

export function getItemFallbackChain(product: { id?: string; name?: string; image?: string; images?: string[]; category?: string }): string[] {
  const chain: string[] = [];
  const prodId = product.id || "";
  const nameLower = (product.name || "").toLowerCase();
  const idLower = prodId.toLowerCase();

  // 1. Staff/Admin single image override
  const singleOverride = read()[prodId];
  if (singleOverride && typeof singleOverride === "string" && (singleOverride.startsWith("/") || singleOverride.startsWith("http") || singleOverride.startsWith("data:"))) {
    chain.push(singleOverride);
  }

  // 2. Staff/Admin custom gallery overrides
  try {
    const rawGallery = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (rawGallery) {
      const gMap = JSON.parse(rawGallery);
      if (Array.isArray(gMap[prodId])) {
        for (const img of gMap[prodId]) {
          if (typeof img === "string" && (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"))) {
            chain.push(img);
          }
        }
      }
    }
  } catch {
    // Ignore storage parse error
  }

  // 3. Base product image & images array
  if (product.image && typeof product.image === "string" && (product.image.startsWith("/") || product.image.startsWith("http") || product.image.startsWith("data:"))) {
    chain.push(product.image);
  }
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string" && (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"))) {
        chain.push(img);
      }
    }
  }

  // 4. Item-name specific fallback candidates
  if (nameLower.includes("walnut") || nameLower.includes("akhrot") || idLower.includes("walnut")) {
    chain.push("/images/nuts/walnuts.jpg", "/images/catalog/walnuts.jpg");
  } else if (nameLower.includes("almond") || nameLower.includes("badam") || idLower.includes("almond")) {
    chain.push("/images/nuts/mamra-almonds.jpg", "/images/nuts/almonds.jpg");
  } else if (nameLower.includes("cashew") || nameLower.includes("kaju") || idLower.includes("cashew")) {
    chain.push("/images/nuts/cashews.jpg");
  } else if (nameLower.includes("pista") || nameLower.includes("pistachio") || idLower.includes("pista")) {
    chain.push("/images/nuts/pistachios.jpg");
  } else if (nameLower.includes("saffron") || nameLower.includes("kesar")) {
    chain.push("/images/spices/saffron.jpg", "/images/spices/spices-hero.png");
  } else if (nameLower.includes("honey")) {
    chain.push("/images/honey/honey-jar.jpg", "/images/honey/wild-honey-hero.png");
  } else if (nameLower.includes("date") || nameLower.includes("khajur")) {
    chain.push("/images/dry-fruits/dates.jpg");
  } else if (nameLower.includes("fig") || nameLower.includes("anjeer")) {
    chain.push("/images/dry-fruits/anjeer.jpg");
  }

  // 5. Category-level candidate list
  if (product.category && CATEGORY_FALLBACKS[product.category]) {
    chain.push(...CATEGORY_FALLBACKS[product.category]);
  }

  // Default fallback
  chain.push("/images/nuts/almonds.jpg", "/images/branding/house-of-nuts-logo-hd.png");

  // Deduplicate while preserving order
  return Array.from(new Set(chain));
}

export function getProductImageSrc(product: { id: string; image: string; name?: string; category?: string }): string {
  const chain = getItemFallbackChain(product);
  return chain[0] || "/images/nuts/almonds.jpg";
}

import { syncCatalogConfigToRemote } from "./customCatalog";

export function setProductImage(productId: string, src: string) {
  const next = { ...read(), [productId]: src };
  write(next);
  syncCatalogConfigToRemote();
}

const GALLERY_STORAGE_KEY = "hon-product-gallery-overrides-v1";

export function getProductGallery(product: { id: string; image: string; images?: string[]; category?: string; name?: string }): string[] {
  let customGallery: string[] | undefined;
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      const keys = Object.keys(map);
      const massMappedKeys = keys.filter((k) => Array.isArray(map[k]) && map[k].length > 10);
      if (massMappedKeys.length > 0) {
        for (const key of massMappedKeys) {
          delete map[key];
        }
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(map));
        syncCatalogConfigToRemote();
      }
      
      if (Array.isArray(map[product.id]) && map[product.id].length > 0) {
        const unique = Array.from(new Set(map[product.id] as string[]));
        if (unique.length <= 10) {
          customGallery = unique;
        }
      }
    }
  } catch {
    // Ignore
  }

  if (customGallery && customGallery.length > 0) {
    return customGallery;
  }

  const primary = getProductImageSrc(product);
  const extra = (product.images && product.images.length > 0) ? product.images.filter((img) => typeof img === "string") : [primary];
  const sanitizedExtra = extra.length > 10 ? [primary] : extra;
  const list = [primary, ...sanitizedExtra.filter((img) => img !== primary)];
  return Array.from(new Set(list));
}

export function setProductGallery(productId: string, images: string[]) {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[productId] = images;
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(map));
    if (images.length > 0) {
      setProductImage(productId, images[0]);
    } else {
      syncCatalogConfigToRemote();
    }
    listeners.forEach((l) => l());
  } catch {
    // Ignore
  }
}

export function clearProductImage(productId: string) {
  const next = { ...read() };
  delete next[productId];
  write(next);
  syncCatalogConfigToRemote();
}

export function clearAllProductImageOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GALLERY_STORAGE_KEY);
    
    // Clean up any custom products saved in localStorage that had multi-image arrays attached
    const customProdsRaw = localStorage.getItem("hon_custom_products_v1");
    if (customProdsRaw) {
      const customProds = JSON.parse(customProdsRaw);
      if (Array.isArray(customProds)) {
        const cleaned = customProds.map((p: Record<string, unknown>) => ({
          ...p,
          images: undefined,
        }));
        localStorage.setItem("hon_custom_products_v1", JSON.stringify(cleaned));
      }
    }

    cache = null;
    listeners.forEach((l) => l());
    syncCatalogConfigToRemote();
  } catch {
    // Ignore
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProductImage(product: Product | { id: string; image: string; category?: string }): string {
  return useSyncExternalStore(
    subscribe,
    () => getProductImageSrc(product),
    () => getProductImageSrc(product),
  );
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
