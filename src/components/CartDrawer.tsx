import { useState } from "react";
import { X, Plus, Minus, Trash2, Tag, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { getProductImageSrc } from "@/lib/productImages";

const CartDrawer = () => {
  const {
    items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity,
    subtotal, totalPrice, totalItems, appliedDiscount, discountAmount,
    applyDiscount, removeDiscount,
  } = useCart();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess(false);
    const result = applyDiscount(promoInput);
    if (result.success) {
      setPromoSuccess(true);
      setPromoInput("");
    } else {
      setPromoError(result.error || "Invalid code");
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">Your Basket ({totalItems})</h2>
          <button onClick={() => setIsCartOpen(false)} className="hover:text-accent transition-colors">
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 p-6">
            <p className="text-muted-foreground font-body">Your basket is empty</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-sm uppercase tracking-[0.15em] font-medium hover:text-accent transition-colors font-body"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div key={item.variant.id} className="flex gap-4 py-4 border-b border-border last:border-0">
                  <img src={getProductImageSrc(item.product)} alt={item.product.name} className="w-20 h-20 object-cover bg-clay-light" />
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-display text-lg leading-tight">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground font-body">{item.variant.size}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.variant.id, item.quantity - 1)} className="size-7 border border-border flex items-center justify-center hover:bg-clay-light transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm tabular-nums font-body w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} className="size-7 border border-border flex items-center justify-center hover:bg-clay-light transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium tabular-nums font-body">₹{item.variant.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.variant.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-border space-y-4">
              {/* Discount code input */}
              {!appliedDiscount ? (
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); setPromoSuccess(false); }}
                        placeholder="Discount code"
                        className="w-full border border-border bg-background pl-9 pr-3 py-2.5 font-body text-xs uppercase tracking-wider focus:outline-none focus:border-accent transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim()}
                      className="px-4 py-2.5 bg-accent text-accent-foreground text-xs uppercase tracking-wider font-body font-medium hover:bg-primary transition-colors disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-destructive font-body mt-1.5">{promoError}</p>}
                  {promoSuccess && <p className="text-xs text-accent font-body mt-1.5 flex items-center gap-1"><Check size={12} /> Code applied!</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-accent/10 border border-accent/20 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-accent" />
                    <span className="text-xs font-body font-medium uppercase tracking-wider">{appliedDiscount.code}</span>
                    <span className="text-xs text-muted-foreground font-body">— {appliedDiscount.description}</span>
                  </div>
                  <button onClick={removeDiscount} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                {appliedDiscount && (
                  <>
                    <div className="flex justify-between text-sm font-body text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body text-accent">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span className="tabular-nums">-₹{discountAmount}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-body text-sm uppercase tracking-[0.1em]">Total</span>
                  <span className="font-display text-3xl">₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/checkout");
                }}
                className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
