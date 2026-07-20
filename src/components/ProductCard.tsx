import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useInventory } from "@/contexts/InventoryContext";
import { isLowStock, isOutOfStock, stockOf } from "@/lib/inventory";
import { ShoppingBag, Star } from "lucide-react";
import { getAverageRating } from "@/lib/reviews";
import { useProductImage } from "@/lib/productImages";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();
  const { stock } = useInventory();
  const variant = product.variants[selectedVariant];
  const { avg, count } = getAverageRating(product.id);
  const imageSrc = useProductImage(product);
  const oos = isOutOfStock(stock, variant.id);
  const low = isLowStock(stock, variant.id);
  const remaining = stockOf(stock, variant.id);
  const allOos = product.variants.every((v) => isOutOfStock(stock, v.id));

  return (
    <div className="flex flex-col group">
      <Link to={`/product/${product.id}`} className="bg-clay-light p-4 md:p-6 aspect-square relative overflow-hidden flex items-center justify-center mb-4">
        <div className="absolute inset-3 md:inset-5 border border-foreground/5 z-10 pointer-events-none transition-all duration-500 group-hover:inset-2 group-hover:border-foreground/15" />
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && !allOos && (
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1.5 m-4 md:m-6 text-[10px] uppercase tracking-[0.2em] font-medium z-20 shadow-sm font-body">
            {product.badge}
          </div>
        )}
        {allOos && (
          <div className="absolute top-0 right-0 bg-foreground/85 text-background px-3 py-1.5 m-4 md:m-6 text-[10px] uppercase tracking-[0.2em] font-medium z-20 shadow-sm font-body">
            Sold Out
          </div>
        )}
      </Link>

      <Link to={`/product/${product.id}`} className="hover:text-accent transition-colors duration-300">
        <h3 className="font-display text-xl md:text-2xl mb-1">{product.name}</h3>
      </Link>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < Math.round(avg) ? "fill-accent text-accent" : "text-border"} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground font-body">({count})</span>
      </div>
      <p className="text-sm text-muted-foreground font-light tracking-wide mb-3 line-clamp-1">
        {product.description}
      </p>

      {/* Size selector */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {product.variants.map((v, i) => {
          const vOos = isOutOfStock(stock, v.id);
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(i)}
              className={`text-[11px] px-3 py-1.5 border transition-colors duration-200 font-body tracking-wide ${
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

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-border">
        <span className="tabular-nums font-medium text-lg font-body">₹{variant.price}</span>
        <button
          onClick={() => addToCart(product, variant)}
          disabled={oos}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-accent transition-colors duration-300 font-body disabled:bg-muted-foreground/40 disabled:cursor-not-allowed disabled:hover:bg-muted-foreground/40"
        >
          <ShoppingBag size={14} />
          {oos ? "Sold Out" : "Add"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

