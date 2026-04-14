import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

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
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover bg-clay-light"
                  />
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-display text-lg leading-tight">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground font-body">{item.variant.size}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="size-7 border border-border flex items-center justify-center hover:bg-clay-light transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm tabular-nums font-body w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="size-7 border border-border flex items-center justify-center hover:bg-clay-light transition-colors"
                        >
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
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-body text-sm uppercase tracking-[0.1em]">Total</span>
                <span className="font-display text-3xl">₹{totalPrice}</span>
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
