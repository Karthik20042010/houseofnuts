import { Link } from "react-router-dom";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useInventory } from "@/contexts/InventoryContext";
import { isOutOfStock, isLowStock, stockOf } from "@/lib/inventory";
import { useProductImage } from "@/lib/productImages";
import ProductImage from "@/components/ProductImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickViewProps {
  product: Product;
  open: boolean;
  selectedVariant: number;
  onOpenChange: (open: boolean) => void;
  onVariantChange: (index: number) => void;
}

const QuickView = ({ product, open, selectedVariant, onOpenChange, onVariantChange }: QuickViewProps) => {
  const { addToCart } = useCart();
  const { stock } = useInventory();
  const imageSrc = useProductImage(product);
  const variant = product.variants[selectedVariant];
  const outOfStock = isOutOfStock(stock, variant.id);
  const lowStock = isLowStock(stock, variant.id);
  const remaining = stockOf(stock, variant.id);

  const add = () => {
    if (outOfStock) return;
    addToCart(product, variant);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="gradient-linen aspect-square rounded-xl overflow-hidden">
            <ProductImage
              src={imageSrc}
              alt={product.name}
              eager={false}
              sizes="(max-width: 640px) 90vw, 40vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <DialogTitle className="font-display text-3xl pr-8">{product.name}</DialogTitle>
            <DialogDescription className="mt-2 font-body leading-relaxed">{product.description}</DialogDescription>
            {product.localName && <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body">{product.localName}</p>}

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body mb-2">Choose size</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Choose a size for ${product.name}`}>
                {product.variants.map((item, index) => {
                  const unavailable = isOutOfStock(stock, item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={unavailable}
                      onClick={() => onVariantChange(index)}
                      aria-pressed={index === selectedVariant}
                      className={`min-h-[40px] px-3 border text-xs font-body transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                        index === selectedVariant ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-accent"
                      }`}
                    >
                      {item.size}{unavailable ? " · Sold out" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-3xl">₹{variant.price}</span>
              {variant.mrp && variant.mrp > variant.price && <span className="text-sm text-muted-foreground line-through">₹{variant.mrp}</span>}
            </div>
            {lowStock && !outOfStock && remaining !== null && <p className="mt-1 text-xs text-accent font-body">Only {remaining} left</p>}

            <button
              type="button"
              onClick={add}
              disabled={outOfStock}
              className="mt-6 min-h-[48px] w-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.15em] font-body font-semibold flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {outOfStock ? "Sold out" : <><ShoppingBag size={15} /> Add to basket</>}
            </button>
            <Link to={`/product/${product.id}`} onClick={() => onOpenChange(false)} className="mt-4 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.15em] font-body font-semibold text-accent hover:underline">
              View full details <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
