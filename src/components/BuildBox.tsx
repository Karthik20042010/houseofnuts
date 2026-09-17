import React, { useState } from "react";
import { Product } from "@/data/products";
import { useCatalog } from "@/lib/customCatalog";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Package, Check, Sparkles, Plus, Trash2, Gift, UtensilsCrossed, Scale, Flame, HeartPulse, Zap } from "lucide-react";

export interface TrailMixIngredient {
  id: string;
  name: string;
  category: "Nuts" | "Dried Fruits" | "Seeds" | "Chocolates";
  basePrice250g: number;
  image: string;
  badge?: string;
  healthTag: string;
}

export const TRAIL_MIX_INGREDIENTS: TrailMixIngredient[] = [
  { id: "california-almonds", name: "California Almonds", category: "Nuts", basePrice250g: 340, image: "/images/nuts/almonds.jpg", badge: "Crunchy", healthTag: "High Protein & Fiber" },
  { id: "jumbo-cashews", name: "Jumbo W320 Cashews", category: "Nuts", basePrice250g: 360, image: "/images/nuts/cashews.jpg", badge: "Creamy", healthTag: "Heart Healthy Fats" },
  { id: "roasted-pistachios", name: "Roasted Pistachios", category: "Nuts", basePrice250g: 440, image: "/images/nuts/pistachios.jpg", badge: "Salted", healthTag: "Low Calorie & Potassium" },
  { id: "chilean-walnuts", name: "Chilean Walnuts", category: "Nuts", basePrice250g: 420, image: "/images/nuts/walnuts.jpg", badge: "Brain Food", healthTag: "Omega-3 Fatty Acids" },
  { id: "dried-cranberries", name: "Dried Cranberries", category: "Dried Fruits", basePrice250g: 280, image: "/images/dry-fruits/cranberries.jpg", badge: "Tangy", healthTag: "Antioxidant Powerhouse" },
  { id: "green-raisins", name: "Afghan Green Raisins", category: "Dried Fruits", basePrice250g: 180, image: "/images/dry-fruits/raisins.jpg", badge: "Sweet", healthTag: "Natural Energy Boost" },
  { id: "kashmiri-anjeer", name: "Kashmiri Figs (Anjeer)", category: "Dried Fruits", basePrice250g: 480, image: "/images/dry-fruits/anjeer.jpg", badge: "Chewy", healthTag: "Rich in Calcium & Iron" },
  { id: "pumpkin-seeds", name: "Crunchy Pumpkin Seeds", category: "Seeds", basePrice250g: 220, image: "/images/seeds/pumpkin-seeds.jpg", badge: "Superfood", healthTag: "High Zinc & Magnesium" },
  { id: "sunflower-seeds", name: "Roasted Sunflower Seeds", category: "Seeds", basePrice250g: 190, image: "/images/seeds/sunflower-seeds.jpg", badge: "Protein", healthTag: "Vitamin E & Minerals" },
  { id: "dark-cacao-nibs", name: "70% Dark Cacao Nibs", category: "Chocolates", basePrice250g: 320, image: "/images/chocolates/lindt-lindor-red-main.jpeg", badge: "Antioxidant", healthTag: "Mood & Heart Booster" },
];

export interface TrailMixPreset {
  id: string;
  title: string;
  tagline: string;
  ingredientIds: string[];
}

export const TRAIL_MIX_PRESETS: TrailMixPreset[] = [
  {
    id: "energy-booster",
    title: "🏋️ Energy Booster",
    tagline: "High Protein & Active Endurance",
    ingredientIds: ["california-almonds", "jumbo-cashews", "dried-cranberries", "pumpkin-seeds", "dark-cacao-nibs"],
  },
  {
    id: "brain-focus",
    title: "🧠 Smart Focus",
    tagline: "Omega-3 & Memory Support",
    ingredientIds: ["chilean-walnuts", "roasted-pistachios", "kashmiri-anjeer", "sunflower-seeds"],
  },
  {
    id: "keto-crunch",
    title: "🌿 Keto Seed & Nut",
    tagline: "Low Carb & Healthy Fats",
    ingredientIds: ["california-almonds", "chilean-walnuts", "pumpkin-seeds", "sunflower-seeds"],
  },
  {
    id: "berry-delight",
    title: "🍇 Berry & Nut Delight",
    tagline: "Sweet & Tangy Antioxidant Blend",
    ingredientIds: ["jumbo-cashews", "dried-cranberries", "green-raisins", "kashmiri-anjeer", "dark-cacao-nibs"],
  },
];

export interface PackSizeOption {
  id: string;
  label: string;
  sizeName: string;
  multiplier: number;
}

export const PACK_SIZES: PackSizeOption[] = [
  { id: "250g", label: "250g Standard Jar", sizeName: "250g Jar", multiplier: 1.0 },
  { id: "500g", label: "500g Value Jar (Best Value)", sizeName: "500g Jar", multiplier: 1.9 },
  { id: "1000g", label: "1 Kg Bulk Saver Pouch", sizeName: "1 Kg Pouch", multiplier: 3.6 },
];

interface BuildBoxProps {
  defaultTab?: "gift-box" | "trail-mix";
}

export const BuildBox: React.FC<BuildBoxProps> = ({ defaultTab = "gift-box" }) => {
  const { products } = useCatalog();
  const { addToCart } = useCart();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"gift-box" | "trail-mix">(defaultTab);

  // 1. Gift Box State (4-pack)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const GIFT_BOX_SIZE = 4;

  // 2. Trail Mix State (3-6 ingredients)
  const [selectedIngredients, setSelectedIngredients] = useState<TrailMixIngredient[]>([
    TRAIL_MIX_INGREDIENTS[0],
    TRAIL_MIX_INGREDIENTS[1],
    TRAIL_MIX_INGREDIENTS[4],
    TRAIL_MIX_INGREDIENTS[7],
  ]);
  const [selectedSize, setSelectedSize] = useState<PackSizeOption>(PACK_SIZES[0]);

  const MIN_TRAIL_INGREDIENTS = 3;
  const MAX_TRAIL_INGREDIENTS = 6;

  // Gift Box Handlers
  const toggleSelectGiftProduct = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      if (selectedProducts.length >= GIFT_BOX_SIZE) {
        toast.error(`Your box already has ${GIFT_BOX_SIZE} items! Remove one to swap.`);
        return;
      }
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const isGiftProductSelected = (id: string) => selectedProducts.some((p) => p.id === id);

  const calculateGiftBoxPrice = () => {
    const rawTotal = selectedProducts.reduce((sum, p) => sum + (p.variants[0]?.price || 300), 0);
    return Math.round(rawTotal * 0.85); // 15% off bundle discount
  };

  const handleAddGiftBoxToCart = () => {
    if (selectedProducts.length < GIFT_BOX_SIZE) {
      toast.error(`Please pick ${GIFT_BOX_SIZE - selectedProducts.length} more item(s) to complete your box.`);
      return;
    }

    const bundlePrice = calculateGiftBoxPrice();
    const boxTitle = `Custom Gift Box (${selectedProducts.map((p) => p.name).join(", ")})`;

    const customBoxProduct: Product = {
      id: `custom-box-${Date.now()}`,
      name: "Custom 4-Pack Gift Box (15% OFF)",
      category: "gifting",
      description: boxTitle,
      image: "/images/gifting/gift-box-classic.jpg",
      badge: "15% Bundle Savings",
      variants: [{ id: `custom-box-var-${Date.now()}`, size: "4 Pack Set", price: bundlePrice }],
    };

    addToCart(customBoxProduct, customBoxProduct.variants[0]);
    toast.success("Custom 15% OFF Gift Box added to your basket!", {
      description: `Includes: ${selectedProducts.map((p) => p.name).join(", ")}`,
    });
    setSelectedProducts([]);
  };

  // Trail Mix Handlers
  const toggleSelectIngredient = (ingredient: TrailMixIngredient) => {
    const exists = selectedIngredients.some((i) => i.id === ingredient.id);
    if (exists) {
      if (selectedIngredients.length <= MIN_TRAIL_INGREDIENTS) {
        toast.error(`A custom trail mix must contain at least ${MIN_TRAIL_INGREDIENTS} ingredients!`);
        return;
      }
      setSelectedIngredients(selectedIngredients.filter((i) => i.id !== ingredient.id));
    } else {
      if (selectedIngredients.length >= MAX_TRAIL_INGREDIENTS) {
        toast.error(`You can choose a maximum of ${MAX_TRAIL_INGREDIENTS} ingredients per custom mix.`);
        return;
      }
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const applyPresetRecipe = (preset: TrailMixPreset) => {
    const matched = TRAIL_MIX_INGREDIENTS.filter((i) => preset.ingredientIds.includes(i.id));
    setSelectedIngredients(matched);
    toast.success(`Loaded ${preset.title} Preset!`, {
      description: preset.tagline,
    });
  };

  const isIngredientSelected = (id: string) => selectedIngredients.some((i) => i.id === id);

  const calculateTrailMixPrice = () => {
    if (selectedIngredients.length === 0) return 0;
    const avgBasePrice =
      selectedIngredients.reduce((sum, item) => sum + item.basePrice250g, 0) / selectedIngredients.length;
    const rawPrice = avgBasePrice * selectedSize.multiplier;
    return Math.round(rawPrice * 0.85); // 15% off custom mix discount
  };

  const calculateTrailMixOriginalPrice = () => {
    if (selectedIngredients.length === 0) return 0;
    const avgBasePrice =
      selectedIngredients.reduce((sum, item) => sum + item.basePrice250g, 0) / selectedIngredients.length;
    return Math.round(avgBasePrice * selectedSize.multiplier);
  };

  const handleAddTrailMixToCart = () => {
    if (selectedIngredients.length < MIN_TRAIL_INGREDIENTS) {
      toast.error(`Please select at least ${MIN_TRAIL_INGREDIENTS} ingredients to craft your mix.`);
      return;
    }

    const price = calculateTrailMixPrice();
    const ingredientNames = selectedIngredients.map((i) => i.name).join(", ");

    const customTrailMixProduct: Product = {
      id: `custom-mix-${Date.now()}`,
      name: `Custom Artisanal Trail Mix - ${selectedSize.sizeName} (15% OFF)`,
      category: "mixes",
      description: `Personalized blend containing equal proportions of: ${ingredientNames}. Freshly mixed to order.`,
      image: "/images/mixes/berry-mix.jpg",
      badge: "Custom Crafted (15% OFF)",
      variants: [
        {
          id: `custom-mix-var-${Date.now()}`,
          size: selectedSize.sizeName,
          price: price,
        },
      ],
    };

    addToCart(customTrailMixProduct, customTrailMixProduct.variants[0]);
    toast.success(`Custom Trail Mix (${selectedSize.sizeName}) added to basket!`, {
      description: `Ingredients: ${ingredientNames}`,
    });
  };

  return (
    <section id="box" className="py-16 px-6 md:px-12 bg-clay-light border-y border-border">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {/* Header & Mode Switcher */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-accent text-xs font-mono font-semibold uppercase tracking-widest">
            <Gift size={14} /> Artisanal Customization Studio
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Design Your Own Gourmet Selection
          </h2>
          <p className="font-body text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
            Choose between crafting a <strong className="text-foreground font-semibold">Custom Gift Box Assortment</strong> or formulating your own <strong className="text-foreground font-semibold">Custom Trail Mix Blend</strong> with automatic <strong className="text-accent font-semibold">15% OFF bundle savings</strong>.
          </p>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex p-1 bg-background border border-border rounded-full shadow-xs mt-2">
            <button
              onClick={() => setActiveTab("gift-box")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-body font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "gift-box"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gift size={15} /> Custom Gift Box (4-Pack)
            </button>
            <button
              onClick={() => setActiveTab("trail-mix")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-body font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "trail-mix"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UtensilsCrossed size={15} /> Custom Trail Mix Crafter
            </button>
          </div>
        </div>

        {/* MODE 1: CUSTOM GIFT BOX BUILDER */}
        {activeTab === "gift-box" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
            {/* Product Selector Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-2 no-scrollbar">
              {products.slice(0, 15).map((product) => {
                const checked = isGiftProductSelected(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleSelectGiftProduct(product)}
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

            {/* Gift Box Summary Sidebar */}
            <div className="bg-background border border-border rounded-sm p-6 space-y-6 shadow-xs font-body">
              {/* Visual Fill Gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="text-muted-foreground">Box Capacity ({selectedProducts.length}/{GIFT_BOX_SIZE})</span>
                  <span className="font-semibold text-accent">{Math.round((selectedProducts.length / GIFT_BOX_SIZE) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-warm transition-all duration-500 rounded-full"
                    style={{ width: `${(selectedProducts.length / GIFT_BOX_SIZE) * 100}%` }}
                  />
                </div>
              </div>

              {/* Selected Slots */}
              <div className="space-y-3">
                {Array.from({ length: GIFT_BOX_SIZE }).map((_, idx) => {
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
                            onClick={() => toggleSelectGiftProduct(item)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="italic font-light">Empty Slot #{idx + 1} — Select product</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Discount Tag */}
              {selectedProducts.length === GIFT_BOX_SIZE && (
                <div className="bg-accent/10 border border-accent/30 p-3 rounded-sm text-xs font-mono flex items-center justify-between text-accent">
                  <span>15% Bundle Discount Applied!</span>
                  <span className="font-bold">SAVED!</span>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between font-display text-lg font-bold">
                <span>Box Price:</span>
                <span className="text-accent">
                  {selectedProducts.length === 0 ? "₹0" : `₹${calculateGiftBoxPrice()}`}
                </span>
              </div>

              <button
                onClick={handleAddGiftBoxToCart}
                disabled={selectedProducts.length !== GIFT_BOX_SIZE}
                className={`w-full py-3.5 uppercase tracking-widest text-xs font-semibold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedProducts.length === GIFT_BOX_SIZE
                    ? "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground shadow-sm cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Package size={16} /> Add Custom Box to Basket
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: CUSTOM TRAIL MIX CRAFTER */}
        {activeTab === "trail-mix" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
            {/* Left Column: Presets & Ingredients Selector */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preset Recipe Quick-Fills Bar */}
              <div className="bg-background border border-border/80 p-4 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                  <Zap size={14} /> Quick-Fill Chef Recipes
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRAIL_MIX_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPresetRecipe(preset)}
                      className="text-left p-2.5 rounded-sm border border-border bg-clay-light/40 hover:bg-accent/10 hover:border-accent/60 transition-all text-xs font-body group cursor-pointer"
                    >
                      <p className="font-semibold text-foreground group-hover:text-accent line-clamp-1">{preset.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.tagline}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-body px-1">
                <span className="text-muted-foreground">
                  Select <strong className="text-foreground">{MIN_TRAIL_INGREDIENTS} to {MAX_TRAIL_INGREDIENTS} ingredients</strong> for your custom blend:
                </span>
                <span className="font-semibold text-accent">
                  {selectedIngredients.length} / {MAX_TRAIL_INGREDIENTS} Selected
                </span>
              </div>

              {/* Ingredients Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-2 no-scrollbar">
                {TRAIL_MIX_INGREDIENTS.map((ingredient) => {
                  const checked = isIngredientSelected(ingredient.id);
                  return (
                    <div
                      key={ingredient.id}
                      onClick={() => toggleSelectIngredient(ingredient)}
                      className={`cursor-pointer border p-3 rounded-sm bg-background transition-all duration-300 relative flex flex-col items-center text-center gap-2 group ${
                        checked
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5 shadow-xs"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="size-16 overflow-hidden rounded-sm bg-muted grid place-items-center relative">
                        <img
                          src={ingredient.image}
                          alt={ingredient.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {ingredient.badge && (
                          <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-[9px] text-primary-foreground font-mono font-medium py-0.5">
                            {ingredient.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-xs font-semibold leading-tight line-clamp-1">{ingredient.name}</h4>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium line-clamp-1">{ingredient.healthTag}</p>

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
            </div>

            {/* Trail Mix Summary Sidebar */}
            <div className="bg-background border border-border rounded-sm p-6 space-y-6 shadow-xs font-body">
              {/* Weight / Pack Size Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Scale size={14} className="text-accent" /> Select Pack Weight
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PACK_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-1 text-center rounded-sm border text-[11px] font-mono transition-all cursor-pointer ${
                        selectedSize.id === size.id
                          ? "bg-accent/10 border-accent text-accent font-bold"
                          : "border-border hover:border-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {size.sizeName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Formula Visualization */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Flame size={13} className="text-accent" /> Custom Formula Ratio
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {(100 / Math.max(1, selectedIngredients.length)).toFixed(1)}% each
                  </span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar border-t border-b border-border py-2">
                  {selectedIngredients.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded-sm bg-clay-light/40">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="size-6 rounded-xs object-cover" />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground line-clamp-1">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground">{item.healthTag}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSelectIngredient(item)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                        title="Remove ingredient"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Health Highlights */}
              <div className="space-y-1.5 bg-accent/5 p-3 rounded-sm border border-accent/20">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-accent">
                  <HeartPulse size={13} /> Active Nutritional Profile
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedIngredients.map((i) => (
                    <span key={i.id} className="text-[9px] font-mono bg-background border border-border px-1.5 py-0.5 rounded-xs text-foreground/80">
                      ✨ {i.healthTag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Calculation & Discount */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Regular Base Price:</span>
                  <span className="line-through">₹{calculateTrailMixOriginalPrice()}</span>
                </div>
                <div className="bg-accent/10 border border-accent/30 p-2.5 rounded-sm text-xs font-mono flex items-center justify-between text-accent">
                  <span>15% Custom Blend Savings!</span>
                  <span className="font-bold">SAVE 15%</span>
                </div>
                <div className="flex items-center justify-between font-display text-xl font-bold pt-1">
                  <span>Custom Pack Price:</span>
                  <span className="text-accent">₹{calculateTrailMixPrice()}</span>
                </div>
              </div>

              <button
                onClick={handleAddTrailMixToCart}
                disabled={selectedIngredients.length < MIN_TRAIL_INGREDIENTS}
                className={`w-full py-3.5 uppercase tracking-widest text-xs font-semibold rounded-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedIngredients.length >= MIN_TRAIL_INGREDIENTS
                    ? "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground shadow-sm cursor-pointer"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <UtensilsCrossed size={16} /> Add Custom Mix to Basket
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BuildBox;


