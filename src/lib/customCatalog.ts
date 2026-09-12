import { Product, ProductVariant, categories as defaultCategories } from "@/data/products";

const CUSTOM_PRODUCTS_KEY = "hon_custom_products_v1";
const CUSTOM_CATEGORIES_KEY = "hon_custom_categories_v1";
const CUSTOM_SUBCATEGORIES_KEY = "hon_custom_subcategories_v1";
const CUSTOM_PRICE_OVERRIDES_KEY = "hon_custom_price_overrides_v1";

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

  // Solar Dried
  { id: "solar-fruits", label: "Solar Dried Natural Fruits", parentCategory: "solar-dried" },
];

export function getCustomCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const stored: CustomCategory[] = raw ? JSON.parse(raw) : [];

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

  if (nameLower.includes("date") || localLower.includes("khajur") || idLower.includes("date")) return "dates";
  if (nameLower.includes("fig") || localLower.includes("anjeer") || idLower.includes("fig")) return "figs";
  if (nameLower.includes("raisin") || localLower.includes("kishmish") || idLower.includes("raisin")) return "raisins";
  if (nameLower.includes("berry") || nameLower.includes("apricot")) return "berries";

  if (nameLower.includes("saffron") || localLower.includes("kesar")) return "saffron";
  if (nameLower.includes("cardamom") || localLower.includes("elaichi")) return "cardamom";

  if (nameLower.includes("honey")) return "raw-honey";
  if (nameLower.includes("trail") || nameLower.includes("mix")) return "trail-mixes";

  return undefined;
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
  const combinedMap = new Map<string, Product>();

  for (const p of baseProducts) {
    const inferredSubcat = autoInferSubcategory(p);
    const updatedVariants = p.variants.map((v) => {
      const ov = overrides[v.id];
      if (ov) {
        return { ...v, price: ov.price, mrp: ov.mrp ?? v.mrp };
      }
      return v;
    });
    combinedMap.set(p.id, { ...p, subcategory: inferredSubcat, variants: updatedVariants });
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

import { useState, useEffect } from "react";
import { products as defaultProducts } from "@/data/products";

export function useCatalog() {
  const [categoriesList, setCategoriesList] = useState(getCustomCategories);
  const [allProductsList, setAllProductsList] = useState(() => getAllProducts(defaultProducts));

  useEffect(() => {
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
