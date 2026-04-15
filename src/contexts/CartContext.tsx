import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, ProductVariant } from "@/data/products";
import { DiscountCode, validateDiscount, calcDiscount } from "@/lib/discounts";

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedDiscount: DiscountCode | null;
  discountAmount: number;
  applyDiscount: (code: string) => { success: boolean; error?: string };
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("hon-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);

  useEffect(() => {
    localStorage.setItem("hon-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, variant: ProductVariant) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant.id === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variant.id === variantId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedDiscount(null);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const discountAmount = appliedDiscount ? calcDiscount(appliedDiscount, subtotal) : 0;
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const applyDiscount = useCallback((code: string) => {
    const result = validateDiscount(code, subtotal, totalItems);
    if (result.valid && result.discount) {
      setAppliedDiscount(result.discount);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [subtotal, totalItems]);

  const removeDiscount = useCallback(() => setAppliedDiscount(null), []);

  return (
    <CartContext.Provider
      value={{
        items, addToCart, removeFromCart, updateQuantity, clearCart,
        totalItems, subtotal, totalPrice,
        isCartOpen, setIsCartOpen,
        appliedDiscount, discountAmount, applyDiscount, removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
