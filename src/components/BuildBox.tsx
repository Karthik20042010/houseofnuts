import React, { useState } from "react";
import { Product } from "@/data/products";
import { useCatalog } from "@/lib/customCatalog";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Package, Check, Sparkles, Plus, Trash2 } from "lucide-react";

export const BuildBox: React.FC = () => {
  const { products } = useCatalog();
  const { addToCart } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const BOX_SIZE = 4;


  const toggleSelect = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      if (selectedProducts.length >= BOX_SIZE) {
        toast.error(`Your box already has ${BOX_SIZE} items! Remove one to swap.`);
        return;
      }
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const isSelected = (id: string) => selectedProducts.some((p) => p.id === id);

  const calculateBoxPrice = () => {
    const rawTotal = selectedProducts.reduce((sum, p) => sum + (p.variants[0]?.price || 300), 0);
    return Math.round(rawTotal * 0.85); // 15% off bundle discount
  };

  const handleAddBoxToCart = () => {
    if (selectedProducts.length < BOX_SIZE) {
      toast.error(`Please pick ${BOX_SIZE - selectedProducts.length} more item(s) to complete your box.`);
      return;
    }

    const bundlePrice = calculateBoxPrice();
    const boxTitle = `Custom Gift Box (${selectedProducts.map((p) => p.name).join(", ")})`;

    const customBoxProduct: Product = {
      id: `custom-box-${Date.now()}`,
      name: "Custom 4-Pack Gift Box (15% OFF)",
      category: "gifting",
      description: boxTitle,
      image: "/images/branding/poster-hd.png",
      badge: "15% Bundle Savings",
      variants: [{ id: `custom-box-var-${Date.now()}`, size: "4 Pack Set", price: bundlePrice }],
    };

    addToCart(customBoxProduct, customBoxProduct.variants[0]);
    toast.success("Custom 15% OFF Gift Box added to your basket!", {
      description: `Includes: ${selectedProducts.map((p) => p.name).join(", ")}`,
    });
    setSelectedProducts([]);
  };

  return (
    <section id="box" className="py-16 px-6 md:px-12 bg-clay-light border-y border-border">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-accent text-xs font-mono font-semibold uppercase tracking-widest">
            <Sparkles size={14} /> Interactive Experience
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Build Your Own Custom Box
          </h2>
          <p className="font-body text-muted-foreground text-sm leading-relaxed">
            Select any <strong className="text-foreground font-semibold">4 items</strong> to craft your personalized gift box or monthly snack pack and automatically unlock <strong className="text-accent font-semibold">15% OFF</strong>!
          </p>
        </div>

        {/* Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Item Selector Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {products.slice(0, 12).map((product) => {
              const checked = isSelected(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => toggleSelect(product)}
                  className={`cursor-pointer border p-3 rounded-sm bg-background transition-all duration-300 relative flex flex-col items-center text-center gap-2 group ${
                    checked
                      ? "border-accent ring-2 ring-accent/30 bg-accent/5 shadow-xs"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="size-20 overflow-hidden rounded-sm bg-muted grid place-items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-display text-xs font-semibold line-clamp-1">{product.name}</h4>
                  <p className="text-[11px] font-mono text-accent">₹{product.variants[0]?.price}</p>

                  <div
                    className={`absolute top-2 right-2 size-5 rounded-full grid place-items-center text-xs transition-colors ${
                      checked ? "bg-accent text-accent-foreground" : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {checked ? <Check size={12} /> : <Plus size={12} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Box Summary Sidebar */}
          <div className="bg-background border border-border rounded-sm p-6 space-y-6 shadow-xs font-body">
            {/* Visual Box Capacity Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-body">
                <span className="text-muted-foreground">Box Fill Level</span>
                <span className="font-semibold text-accent">{Math.round((selectedProducts.length / BOX_SIZE) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-warm transition-all duration-500 rounded-full"
                  style={{ width: `${(selectedProducts.length / BOX_SIZE) * 100}%` }}
                />
              </div>
            </div>

            {/* Selected Slots */}
            <div className="space-y-3">
              {Array.from({ length: BOX_SIZE }).map((_, idx) => {
                const item = selectedProducts[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-sm border text-xs ${
                      item ? "border-accent/40 bg-clay-light/50" : "border-dashed border-border text-muted-foreground"
                    }`}
                  >
                    {item ? (
                      <>
                        <div className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="size-7 rounded-xs object-cover" />
                          <span className="font-medium text-foreground line-clamp-1">{item.name}</span>
                        </div>
                        <button
                          onClick={() => toggleSelect(item)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="italic font-light">Empty Slot #{idx + 1} — Select a product</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Price Calculation & Checkout */}
            {selectedProducts.length === BOX_SIZE && (
              <div className="bg-accent/10 border border-accent/30 p-3 rounded-sm text-xs font-mono flex items-center justify-between text-accent">
                <span>Bundle Discount (15% OFF)</span>
                <span className="font-bold">SAVED!</span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between font-display text-lg font-bold">
              <span>Box Total:</span>
              <span className="text-accent">
                {selectedProducts.length === 0 ? "₹0" : `₹${calculateBoxPrice()}`}
              </span>
            </div>

            <button
              onClick={handleAddBoxToCart}
              disabled={selectedProducts.length !== BOX_SIZE}
              className={`w-full py-3.5 uppercase tracking-widest text-xs font-semibold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                selectedProducts.length === BOX_SIZE
                  ? "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Package size={16} /> Add Custom Box to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildBox;
