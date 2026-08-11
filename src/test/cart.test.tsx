import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";

describe("Shopping Cart Context", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it("should start with an empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("should add products and calculate totals correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = products[0];
    const variant = product.variants[0];

    act(() => {
      result.current.addToCart(product, variant);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(variant.price);

    // Add same product variant again
    act(() => {
      result.current.addToCart(product, variant);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(variant.price * 2);
  });

  it("should update quantity and remove item when quantity reaches zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = products[0];
    const variant = product.variants[0];

    act(() => {
      result.current.addToCart(product, variant);
    });

    act(() => {
      result.current.updateQuantity(variant.id, 5);
    });

    expect(result.current.totalItems).toBe(5);

    act(() => {
      result.current.updateQuantity(variant.id, 0);
    });

    expect(result.current.totalItems).toBe(0);
    expect(result.current.items.length).toBe(0);
  });

  it("should apply discount coupons correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = products[0];
    const variant = product.variants[0];

    act(() => {
      result.current.addToCart(product, variant);
      result.current.addToCart(product, variant);
    });

    const subtotal = result.current.subtotal;

    act(() => {
      const res = result.current.applyDiscount("WELCOME10");
      expect(res.success).toBe(true);
    });

    expect(result.current.appliedDiscount?.code).toBe("WELCOME10");
    expect(result.current.discountAmount).toBe(Math.round(subtotal * 0.1));
    expect(result.current.totalPrice).toBe(subtotal - result.current.discountAmount);
  });
});
