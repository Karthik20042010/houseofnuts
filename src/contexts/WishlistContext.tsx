import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  wishlistCount: number;
  clearWishlist: () => void;
}

const WISHLIST_KEY = "hon-wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback((product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        toast.info(`Removed ${product.name} from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        toast.success(`Added ${product.name} to Wishlist ❤️`);
        return [...prev, product.id];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        wishlistCount: wishlistIds.length,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
