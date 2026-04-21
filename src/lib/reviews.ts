export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

const STORAGE_KEY = "product-reviews";

// Seed reviews so products don't look empty
const seedReviews: Review[] = [
  { id: "s1", productId: "_global", name: "Priya S.", rating: 5, text: "Absolutely fresh and premium quality! The taste is amazing.", date: "2 weeks ago" },
  { id: "s2", productId: "_global", name: "Rahul M.", rating: 4, text: "Good packaging and fast delivery. Will order again.", date: "1 month ago" },
  { id: "s3", productId: "_global", name: "Anita K.", rating: 5, text: "Best quality I've found online. My family loved it!", date: "3 weeks ago" },
];

export function getReviews(productId: string): Review[] {
  try {
    const all: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const userReviews = all.filter((r) => r.productId === productId);
    const globalSeeds = seedReviews.map((r) => ({ ...r, productId }));
    return [...userReviews, ...globalSeeds];
  } catch {
    return seedReviews.map((r) => ({ ...r, productId }));
  }
}

export function addReview(review: Omit<Review, "id" | "date">): Review {
  const newReview: Review = {
    ...review,
    id: `r-${Date.now()}`,
    date: "Just now",
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
