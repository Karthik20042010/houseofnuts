import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInventory } from "@/contexts/InventoryContext";
import { isLowStock, isOutOfStock, stockOf } from "@/lib/inventory";
import { ShoppingBag, Star, Check, Heart, Zap } from "lucide-react";
import { getAverageRating } from "@/lib/reviews";
import { useProductImage } from "@/lib/productImages";
import ProductImage from "@/components/ProductImage";

interface ProductCardProps {
  product: Product;
  eagerImage?: boolean;
}

const ProductCard = ({ product, eagerImage = false }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { stock } = useInventory();
  const navigate = useNavigate();

  const variant = product.variants[selectedVariant];
  const { avg, count } = getAverageRating(product.id);
  const imageSrc = useProductImage(product);
  const oos = isOutOfStock(stock, variant.id);
  const low = isLowStock(stock, variant.id);
  const remaining = stockOf(stock, variant.id);
  const allOos = product.variants.every((v) => isOutOfStock(stock, v.id));
  const inWishlist = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, variant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = () => {
    addToCart(product, variant);
    navigate("/checkout");
  };

  return (
    <div className="flex flex-col group relative bg-background border border-border/40 hover:border-border rounded-sm p-3 transition-all duration-300">
      {/* Image container */}
      <div className="bg-clay-light p-4 aspect-square relative overflow-hidden flex items-center justify-center mb-4 rounded-sm">
        <Link to={`/product/${product.id}`} className="w-full h-full">
          <ProductImage
            src={imageSrc}
            alt={product.name}
            eager={eagerImage}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 [transition:opacity_500ms,transform_1000ms]"
          />
        </Link>

        {/* Badge */}
        {product.badge && !allOos && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-[10px] uppercase tracking-wider font-medium z-20 shadow-xs font-body rounded-xs">
            {product.badge}
          </div>
        )}
        {allOos && (
          <div className="absolute top-2 left-2 bg-foreground/85 text-background px-2 py-1 text-[10px] uppercase tracking-wider font-medium z-20 shadow-xs font-body rounded-xs">
            Sold Out
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-2 right-2 size-8 rounded-full grid place-items-center z-20 transition-all shadow-xs ${
            inWishlist
              ? "bg-accent text-accent-foreground"
              : "bg-background/90 text-muted-foreground hover:text-accent"
          }`}
        >
          <Heart size={15} className={inWishlist ? "fill-accent-foreground" : ""} />
        </button>
      </div>

      <Link to={`/product/${product.id}`} className="hover:text-accent transition-colors duration-300">
        <h3 className="font-display text-lg md:text-xl mb-1 line-clamp-1">{product.name}</h3>
      </Link>

      {product.localName && (
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body mb-1">
          {product.localName}
        </p>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex" aria-label={`Rated ${avg.toFixed(1)} out of 5`}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < Math.round(avg) ? "fill-accent text-accent" : "text-border"} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground font-body">({count})</span>
      </div>

      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-body mb-1.5">
        ✓ 100% Natural · Freshly packed
      </p>

      <p className="text-xs text-muted-foreground font-light tracking-wide mb-3 line-clamp-1">
        {product.description}
      </p>


      {/* Size selector */}
      <div className="flex gap-1.5 mb-3 flex-wrap" role="group" aria-label="Select size">
        {product.variants.map((v, i) => {
          const vOos = isOutOfStock(stock, v.id);
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(i)}
              aria-pressed={i === selectedVariant}
              className={`text-[10px] px-2.5 py-1 border transition-colors duration-200 font-body tracking-wide rounded-xs ${
                i === selectedVariant
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-foreground/30"
              } ${vOos ? "line-through opacity-50" : ""}`}
              title={vOos ? "Out of stock" : undefined}
            >
              {v.size}
            </button>
          );
        })}
      </div>

      {low && !oos && remaining !== null && (
        <p className="text-[11px] font-body text-accent mb-2">Only {remaining} left</p>
      )}

      {/* Price & Actions */}
      <div className="space-y-2 mt-auto pt-3 border-t border-border">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="tabular-nums font-bold text-lg font-display">₹{variant.price}</span>
            {variant.mrp && variant.mrp > variant.price && (
              <>
                <span className="tabular-nums text-xs text-muted-foreground line-through font-body">₹{variant.mrp}</span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 font-body">
                  {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-body shrink-0">Free Delivery</span>
        </div>


        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAdd}
            disabled={oos}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-[10px] uppercase tracking-wider font-medium transition-all duration-300 font-body rounded-xs disabled:opacity-50 ${
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
            }`}
          >
            {justAdded ? <Check size={12} /> : <ShoppingBag size={12} />}
            {oos ? "Sold Out" : justAdded ? "Added" : "Add"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={oos}
            className="flex items-center justify-center gap-1.5 py-2 px-2 text-[10px] uppercase tracking-wider font-semibold bg-accent text-accent-foreground hover:bg-primary transition-colors font-body rounded-xs disabled:opacity-50"
          >
            <Zap size={12} className="fill-accent-foreground" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
