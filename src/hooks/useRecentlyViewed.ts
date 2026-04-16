import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [viewedIds, setViewedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const addViewed = useCallback((productId: string) => {
    setViewedIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { viewedIds, addViewed };
}
