import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useInventory } from "@/contexts/InventoryContext";
import { isLowStock, isOutOfStock, stockOf } from "@/lib/inventory";
import { ShoppingBag, Star, Check, Heart, Zap, Eye } from "lucide-react";
import { getAverageRating } from "@/lib/reviews";
import { useProductImage } from "@/lib/productImages";
import ProductImage from "@/components/ProductImage";
import QuickView from "@/components/QuickView";

interface ProductCardProps {
  product: Product;
  eagerImage?: boolean;
}

const ProductCard = ({ product, eagerImage = false }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
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

  useEffect(() => {
    if (!isOutOfStock(stock, variant.id)) return;
    const firstAvailable = product.variants.findIndex((item) => !isOutOfStock(stock, item.id));
    if (firstAvailable >= 0) setSelectedVariant(firstAvailable);
  }, [product.variants, stock, variant.id]);

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
    <div className="flex flex-col group relative bg-card border border-border/50 hover:border-accent/40 rounded-2xl p-2.5 sm:p-3 card-lift shadow-soft">
      {/* Image container */}
      <div className="gradient-linen p-2.5 sm:p-4 aspect-square relative overflow-hidden flex items-center justify-center mb-3 sm:mb-4 rounded-xl shine">
        <Link to={`/product/${product.id}`} className="w-full h-full">
          <ProductImage
            src={imageSrc}
            alt={product.name}
            eager={eagerImage}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="w-full h-full object-cover rounded-lg group-hover:scale-[1.07] [transition:opacity_500ms,transform_1000ms]"
          />
        </Link>

        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 min-h-[36px] px-3 bg-background/95 text-foreground text-[10px] uppercase tracking-[0.14em] font-semibold font-body rounded-full shadow-soft transition-all duration-200 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 focus:opacity-100 focus:translate-y-0"
        >
          <span className="flex items-center gap-1.5"><Eye size={13} /> Quick view</span>
        </button>


        {/* Badge */}
        {product.badge && !allOos && (
          <div className="absolute top-2 left-2 gradient-warm text-accent-foreground px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold z-20 shadow-glow font-body rounded-full">
            {product.badge}
          </div>
        )}
        {allOos && (
          <div className="absolute top-2 left-2 bg-foreground/85 text-background px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium z-20 shadow-soft font-body rounded-full">
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
        <h3 className="font-display text-base sm:text-lg md:text-xl mb-1 line-clamp-2 sm:line-clamp-1">{product.name}</h3>
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

      <p className="text-xs text-muted-foreground font-light tracking-wide mb-3 line-clamp-2 sm:line-clamp-1">
        {product.description}
      </p>


      {/* Size selector */}
      <div className="flex gap-1.5 mb-3 flex-wrap" role="group" aria-label="Select size">
        {product.variants.map((v, i) => {
          const vOos = isOutOfStock(stock, v.id);
          return (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedVariant(i)}
            aria-pressed={i === selectedVariant}
            disabled={vOos}
              className={`text-[10px] px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-[32px] border transition-all duration-200 font-body tracking-wide rounded-full ${
                i === selectedVariant
                  ? "gradient-earth text-primary-foreground border-transparent shadow-soft"
                  : "border-border hover:border-accent/50 hover:text-accent"
              } ${vOos ? "line-through opacity-50 cursor-not-allowed" : ""}`}
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
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <span className="tabular-nums font-bold text-base sm:text-lg font-display">₹{variant.price}</span>
            {variant.mrp && variant.mrp > variant.price && (
              <>
                <span className="tabular-nums text-xs text-muted-foreground line-through font-body">₹{variant.mrp}</span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 font-body whitespace-nowrap">
                  {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-body shrink-0 whitespace-nowrap">Free Delivery</span>
        </div>



        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAdd}
            disabled={oos}
            className={`flex items-center justify-center gap-1.5 min-h-[40px] px-2 text-[10px] uppercase tracking-wider font-semibold transition-all duration-300 font-body rounded-full disabled:opacity-50 ${
              justAdded
                ? "bg-status-delivered text-status-delivered-foreground"
                : "bg-secondary text-foreground hover:bg-accent/15 hover:text-accent border border-border"
            }`}
          >
            {justAdded ? <Check size={12} /> : <ShoppingBag size={12} />}
            {oos ? "Sold Out" : justAdded ? "Added" : "Add"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={oos}
            className="btn-warm flex items-center justify-center gap-1.5 !px-2 !min-h-[40px] !text-[10px] disabled:opacity-50"
          >
            <Zap size={12} className="fill-accent-foreground" />
            Buy Now
          </button>
        </div>

      </div>
      <QuickView
        product={product}
        open={quickViewOpen}
        selectedVariant={selectedVariant}
        onOpenChange={setQuickViewOpen}
        onVariantChange={setSelectedVariant}
      />
    </div>
  );
};

export default ProductCard;
