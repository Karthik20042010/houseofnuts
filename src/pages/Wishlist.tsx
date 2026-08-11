import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { products, Product } from "@/data/products";
import { getProductImageSrc } from "@/lib/productImages";
import { toast } from "sonner";

export const Wishlist: React.FC = () => {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleMoveToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0]);
      removeFromWishlist(product.id);
      toast.success(`Moved ${product.name} to Basket!`);
    }
  };

  return (
    <div className="min-h-screen bg-clay-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-body mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to store
            </button>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Heart className="h-7 w-7 text-accent fill-accent" /> My Wishlist
              <span className="text-lg font-normal text-muted-foreground font-body">
                ({savedProducts.length} items)
              </span>
            </h1>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-body flex items-center gap-1"
            >
              <Trash2 size={14} /> Clear Wishlist
            </button>
          )}
        </div>

        {/* Wishlist Items Grid */}
        {savedProducts.length === 0 ? (
          <div className="bg-background border border-border rounded-sm p-12 text-center space-y-4 max-w-md mx-auto my-12 shadow-xs">
            <div className="size-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto">
              <Heart size={32} />
            </div>
            <h3 className="font-display text-xl font-semibold">Your Wishlist is Empty</h3>
            <p className="text-xs text-muted-foreground font-body">
              Save your favorite dry fruits, nuts, and honey items to buy them later.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-sm uppercase tracking-wider text-xs font-body hover:bg-accent transition-colors"
            >
              <ShoppingBag size={14} /> Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => {
              const defaultVariant = product.variants[0];
              return (
                <div
                  key={product.id}
                  className="bg-background border border-border rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-clay-light">
                    <img
                      src={getProductImageSrc(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-body uppercase tracking-wider px-2 py-0.5 rounded-xs">
                        {product.badge}
                      </span>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      title="Remove from Wishlist"
                      className="absolute top-2 right-2 size-8 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive rounded-full grid place-items-center shadow-xs transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-body">
                    <div>
                      <Link to={`/product/${product.id}`} className="font-display text-base hover:text-accent transition-colors block line-clamp-1">
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground block">{defaultVariant?.size}</span>
                        <span className="font-display text-base font-bold tabular-nums">₹{defaultVariant?.price}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> In Stock
                      </span>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full bg-primary text-primary-foreground py-2.5 rounded-sm uppercase tracking-[0.15em] text-[11px] font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Move to Basket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
