import { getOrders } from "./orders";
import { getAllProducts } from "./customCatalog";
import { products as defaultProducts } from "@/data/products";
import { apiGet, apiPost } from "./api";

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified?: boolean;
}

const STORAGE_KEY = "product-reviews";

/**
 * Check if the given reviewer name has a confirmed/delivered order
 * containing the given product.
 */
export function isVerifiedPurchase(productId: string, reviewerName: string): boolean {
  const allProducts = getAllProducts(defaultProducts);
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return false;
  const normalizedReviewer = reviewerName.trim().toLowerCase();
  if (!normalizedReviewer) return false;

  try {
    const orders = getOrders();
    return orders.some((order) => {
      if (order.status === "cancelled") return false;
      const orderName = (order.name || "").trim().toLowerCase();
      if (orderName !== normalizedReviewer) return false;
      return order.items.some(
        (item) => item.name.trim().toLowerCase() === product.name.trim().toLowerCase()
      );
    });
  } catch {
    return false;
  }
}

export function getReviews(productId: string): Review[] {
  try {
    const all: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return all
      .filter((r) => r.productId === productId)
      .map((r) => ({ ...r, verified: r.verified ?? isVerifiedPurchase(productId, r.name) }));
  } catch {
    return [];
  }
}

export async function fetchServerReviews(productId?: string): Promise<Review[]> {
  try {
    const res = await apiGet<{ ok: boolean; reviews?: Review[] }>("getReviews", productId ? { productId } : {});
    if (res.ok && Array.isArray(res.reviews)) {
      const local: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const localMap = new Map(local.map((r) => [r.id, r]));
      res.reviews.forEach((r) => localMap.set(r.id, r));
      const merged = Array.from(localMap.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return res.reviews;
    }
  } catch {
    // Fall back to local reviews
  }
  return productId ? getReviews(productId) : [];
}

export function addReview(review: Omit<Review, "id" | "date" | "verified">): Review {
  const verified = isVerifiedPurchase(review.productId, review.name);
  const newReview: Review = {
    ...review,
    id: `r-${Date.now()}`,
    date: "Just now",
    verified,
  };
  try {
    const all: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    all.unshift(newReview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    // Submit to server for permanent storage & moderation
    apiPost("submitReview", { review: newReview }).catch(() => {
      // Background sync fallback
    });
  } catch {
    // ignore
  }
  return newReview;
}

export function getAverageRating(productId: string): { avg: number; count: number } {
  const reviews = getReviews(productId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { avg: Number((sum / reviews.length).toFixed(1)), count: reviews.length };
}
