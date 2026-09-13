import { getOrders } from "./orders";
import { products } from "@/data/products";

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

// Seed reviews commented out as requested
const seedReviews: Review[] = [
  // { id: "s1", productId: "_global", name: "Priya S.", rating: 5, text: "Absolutely fresh and premium quality! The taste is amazing.", date: "2 weeks ago" },
  // { id: "s2", productId: "_global", name: "Rahul M.", rating: 4, text: "Good packaging and fast delivery. Will order again.", date: "1 month ago" },
  // { id: "s3", productId: "_global", name: "Anita K.", rating: 5, text: "Best quality I've found online. My family loved it!", date: "3 weeks ago" },
];

/**
 * Check if the given reviewer name has a delivered/confirmed/shipped order
 * containing the given product.
 */
export function isVerifiedPurchase(productId: string, reviewerName: string): boolean {
  const product = products.find((p) => p.id === productId);
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
    const userReviews = all
      .filter((r) => r.productId === productId)
      .map((r) => ({ ...r, verified: r.verified ?? isVerifiedPurchase(productId, r.name) }));
    const globalSeeds = seedReviews.map((r) => ({ ...r, productId, verified: false }));
    return [...userReviews, ...globalSeeds];
  } catch {
    return seedReviews.map((r) => ({ ...r, productId, verified: false }));
  }
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
  } catch {
    // ignore
  }
  return newReview;
}

export function getAverageRating(productId: string): { avg: number; count: number } {
  const reviews = getReviews(productId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { avg: sum / reviews.length, count: reviews.length };
}
