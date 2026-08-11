import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { WishlistProvider, useWishlist } from "@/contexts/WishlistContext";
import { products } from "@/data/products";

describe("Wishlist System Context", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WishlistProvider>{children}</WishlistProvider>
  );

  it("should initialize with an empty wishlist", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.wishlistIds).toEqual([]);
    expect(result.current.wishlistCount).toBe(0);
  });

  it("should toggle items in wishlist", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    const product = products[0];

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.isInWishlist(product.id)).toBe(true);
    expect(result.current.wishlistCount).toBe(1);

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.isInWishlist(product.id)).toBe(false);
    expect(result.current.wishlistCount).toBe(0);
  });

  it("should remove item explicitly from wishlist", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    const product = products[0];

    act(() => {
      result.current.toggleWishlist(product);
    });

    expect(result.current.isInWishlist(product.id)).toBe(true);

    act(() => {
      result.current.removeFromWishlist(product.id);
    });

    expect(result.current.isInWishlist(product.id)).toBe(false);
  });

  it("should clear all items from wishlist", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.toggleWishlist(products[0]);
      result.current.toggleWishlist(products[1]);
    });

    expect(result.current.wishlistCount).toBe(2);

    act(() => {
      result.current.clearWishlist();
    });

    expect(result.current.wishlistCount).toBe(0);
  });
});
