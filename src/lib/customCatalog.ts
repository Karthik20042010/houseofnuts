import { Product, ProductVariant, categories as defaultCategories } from "@/data/products";

const CUSTOM_PRODUCTS_KEY = "hon_custom_products_v1";
const CUSTOM_CATEGORIES_KEY = "hon_custom_categories_v1";
const CUSTOM_PRICE_OVERRIDES_KEY = "hon_custom_price_overrides_v1";

export interface CustomCategory {
  id: string;
  label: string;
}

export interface PriceOverride {
  price: number;
  mrp?: number;
}

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const stored: CustomCategory[] = raw ? JSON.parse(raw) : [];
    
    // Combine built-in categories with custom categories
    const existingIds = new Set(defaultCategories.map((c) => c.id));
    const merged = [...defaultCategories];
    for (const c of stored) {
      if (!existingIds.has(c.id)) {
        merged.push(c as any);
        existingIds.add(c.id);
      }
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
    }
  } catch {
    // Ignore storage errors
  }
  return newCat;
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
  } catch {
    // Ignore storage errors
  }
}

export function getAllProducts(baseProducts: Product[]): Product[] {
  let customProducts: Product[] = [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) {
      customProducts = JSON.parse(raw);
    }
  } catch {
    customProducts = [];
  }

  const overrides = getPriceOverrides();

  // Combine base products and custom products
  const combinedMap = new Map<string, Product>();

  for (const p of baseProducts) {
    // Apply price overrides if any
    const updatedVariants = p.variants.map((v) => {
      const ov = overrides[v.id];
      if (ov) {
        return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
      }
      return v;
    });
    combinedMap.set(p.id, { ...p, variants: updatedVariants });
  }

  for (const cp of customProducts) {
    const updatedVariants = cp.variants.map((v) => {
      const ov = overrides[v.id];
      if (ov) {
        return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
      }
      return v;
    });
    combinedMap.set(cp.id, { ...cp, variants: updatedVariants });
  }

  return Array.from(combinedMap.values());
}

export function addCustomProduct(newProduct: Omit<Product, "id"> & { id?: string }): Product {
  const id = newProduct.id || newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
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
  } catch {
    // Ignore storage errors
  }

  return fullProduct;
}

export function addVariantToProduct(productId: string, variant: ProductVariant): boolean {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    const stored: Product[] = raw ? JSON.parse(raw) : [];
    const target = stored.find((p) => p.id === productId);
    if (target) {
      target.variants.push(variant);
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent("hon-catalog-update"));
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}
