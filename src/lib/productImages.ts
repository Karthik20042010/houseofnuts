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

export function getAllOverrides(): Overrides {
  return { ...read() };
}

export function getProductImageSrc(product: { id: string; image: string }): string {
  return read()[product.id] || product.image;
}

export function setProductImage(productId: string, src: string) {
  const next = { ...read(), [productId]: src };
  write(next);
}

const GALLERY_STORAGE_KEY = "hon-product-gallery-overrides-v1";

export function getProductGallery(product: { id: string; image: string; images?: string[] }): string[] {
  let customGallery: string[] | undefined;
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (Array.isArray(map[product.id]) && map[product.id].length > 0) {
        customGallery = map[product.id];
      }
    }
  } catch {
    // Ignore
  }

  if (customGallery && customGallery.length > 0) {
    return customGallery;
  }

  const primary = getProductImageSrc(product);
  const extra = product.images || [];
  const list = [primary, ...extra.filter((img) => img !== primary)];
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

export function useProductImage(product: Product | { id: string; image: string }): string {
  return useSyncExternalStore(
    subscribe,
    () => read()[product.id] || product.image,
    () => product.image,
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
