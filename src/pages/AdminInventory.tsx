import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Save,
  Search,
  AlertCircle,
  Minus,
  Plus,
  Infinity as InfIcon,
  PlusCircle,
  FolderPlus,
  DollarSign,
  Tag,
  X,
  PackagePlus,
  Layers,
  Sparkles,
} from "lucide-react";
import { adminUpdateInventory } from "@/lib/admin";
import { fetchInventory, StockMap } from "@/lib/inventory";
import { products as baseProducts, Product, ProductVariant } from "@/data/products";
import {
  getAllProducts,
  getCustomCategories,
  addCustomCategory,
  addCustomProduct,
  getPriceOverrides,
  savePriceOverrides,
  PriceOverride,
} from "@/lib/customCatalog";
import { toast } from "sonner";
import { getProductImageSrc } from "@/lib/productImages";
import { Badge } from "@/components/ui/badge";

const UNTRACKED = -1;

export const AdminInventory = () => {
  const [allProds, setAllProds] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState(getCustomCategories());
  const [stock, setStock] = useState<Record<string, number>>({});
  const [initialStock, setInitialStock] = useState<Record<string, number>>({});

  // Rate/Price Overrides State
  const [pricesMap, setPricesMap] = useState<Record<string, PriceOverride>>({});
  const [initialPrices, setInitialPrices] = useState<Record<string, PriceOverride>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // New Category Form state
  const [newCatLabel, setNewCatLabel] = useState("");

  // New Product Form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdLocalName, setNewProdLocalName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("nuts");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdImage, setNewProdImage] = useState("/images/catalog/almonds.jpg");
  const [newProdBadge, setNewProdBadge] = useState("Fresh Harvest");
  const [newProdVariants, setNewProdVariants] = useState<
    Array<{ size: string; price: number; mrp: number; stock: number }>
  >([
    { size: "250g", price: 299, mrp: 399, stock: 50 },
    { size: "500g", price: 549, mrp: 749, stock: 30 },
  ]);

  // Inline Add Variant state (per product)
  const [addingVariantForProductId, setAddingVariantForProductId] = useState<string | null>(null);
  const [variantSize, setVariantSize] = useState("250g");
  const [variantPrice, setVariantPrice] = useState<number>(350);
  const [variantMrp, setVariantMrp] = useState<number>(450);
  const [variantStock, setVariantStock] = useState<number>(50);

  const loadData = async () => {
    setLoading(true);
    const prods = getAllProducts(baseProducts);
    setAllProds(prods);
    setCategoriesList(getCustomCategories());

    const initialRates = getPriceOverrides();
    setPricesMap(initialRates);
    setInitialPrices({ ...initialRates });

    const s: StockMap = await fetchInventory(true);
    const initStock: Record<string, number> = {};
    for (const p of prods) {
      for (const v of p.variants) {
        initStock[v.id] = Object.prototype.hasOwnProperty.call(s, v.id) ? s[v.id] : UNTRACKED;
      }
    }
    setStock(initStock);
    setInitialStock({ ...initStock });
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleCatalogUpdate = () => {
      loadData();
    };

    window.addEventListener("hon-catalog-update", handleCatalogUpdate);
    return () => window.removeEventListener("hon-catalog-update", handleCatalogUpdate);
  }, []);

  const filteredProducts = useMemo(() => {
    const searchStr = q.toLowerCase().trim();
    return allProds.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (searchStr && !p.name.toLowerCase().includes(searchStr) && !p.localName?.toLowerCase().includes(searchStr)) {
        return false;
      }
      return true;
    });
  }, [allProds, q, cat]);

  // Compute dirty stock changes
  const dirtyStockIds = useMemo(
    () => Object.keys(stock).filter((k) => stock[k] !== initialStock[k]),
    [stock, initialStock]
  );

  // Compute dirty price/rate changes
  const dirtyPriceIds = useMemo(
    () =>
      Object.keys(pricesMap).filter(
        (k) =>
          pricesMap[k]?.price !== initialPrices[k]?.price ||
          pricesMap[k]?.mrp !== initialPrices[k]?.mrp
      ),
    [pricesMap, initialPrices]
  );

  const totalDirtyCount = dirtyStockIds.length + dirtyPriceIds.length;

  const setStockVal = (id: string, val: number) => setStock((s) => ({ ...s, [id]: val }));

  const setRateVal = (id: string, field: "price" | "mrp", val: number) => {
    setPricesMap((prev) => {
      const current = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...current,
          price: field === "price" ? val : current.price || 0,
          mrp: field === "mrp" ? val : current.mrp,
        },
      };
    });
  };

  const setAllInViewStock = (val: number) => {
    setStock((s) => {
      const next = { ...s };
      for (const p of filteredProducts) {
        for (const v of p.variants) {
          next[v.id] = val;
        }
      }
      return next;
    });
  };

  const handleSaveAllChanges = async () => {
    setSaving(true);
    try {
      // 1. Save Rate / Price Overrides locally and broadcast catalog updates
      savePriceOverrides(pricesMap);
      setInitialPrices({ ...pricesMap });

      // 2. Save Inventory Stock to Apps Script / Google Sheets
      const items: Array<{ variantId: string; productId: string; size: string; stock: number }> = [];
      for (const p of allProds) {
        for (const v of p.variants) {
          const val = stock[v.id];
          if (val === UNTRACKED || val === undefined) continue;
          items.push({
            variantId: v.id,
            productId: p.id,
            size: v.size,
            stock: Math.max(0, Math.floor(val)),
          });
        }
      }

      await adminUpdateInventory(items);
      sessionStorage.removeItem("hon-inventory");
      setInitialStock({ ...stock });

      toast.success(`Successfully saved ${totalDirtyCount} rate & stock updates!`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save inventory updates");
    } finally {
      setSaving(false);
    }
  };

  // Handle Add New Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const created = addCustomCategory(newCatLabel);
    toast.success(`New category "${created.label}" created successfully!`);
    setCat(created.id);
    setNewCatLabel("");
    setIsAddCategoryOpen(false);
    loadData();
  };

  // Handle Add New Item / Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (newProdVariants.length === 0) {
      toast.error("Please add at least one variant rate.");
      return;
    }

    const createdProd = addCustomProduct({
      name: newProdName.trim(),
      localName: newProdLocalName.trim() || undefined,
      category: newProdCategory as any,
      description: newProdDescription.trim() || "Hand-selected premium dry fruits",
      image: newProdImage.trim() || "/images/catalog/almonds.jpg",
      badge: newProdBadge.trim() || undefined,
      variants: newProdVariants.map((v) => ({
        id: "",
        size: v.size,
        price: v.price,
        mrp: v.mrp,
      })),
    });

    // Update stock map with initial stock for newly created variants
    const newStockMap = { ...stock };
    newProdVariants.forEach((v, idx) => {
      const vId = createdProd.variants[idx]?.id;
      if (vId) {
        newStockMap[vId] = v.stock;
      }
    });
    setStock(newStockMap);

    toast.success(`Product "${createdProd.name}" created & added to inventory!`);
    setIsAddProductOpen(false);

    // Reset form
    setNewProdName("");
    setNewProdLocalName("");
    setNewProdDescription("");
    loadData();
  };

  // Handle Adding a new Variant to an existing product
  const handleAddVariantToProduct = (product: Product) => {
    if (!variantSize.trim() || variantPrice <= 0) {
      toast.error("Please provide valid size and price rate.");
      return;
    }
    const vId = `${product.id}-${variantSize.toLowerCase().replace(/[^a-z0-9]+/g, "")}-${Date.now()}`;
    const newVariantObj: ProductVariant = {
      id: vId,
      size: variantSize.trim(),
      price: variantPrice,
      mrp: variantMrp > 0 ? variantMrp : undefined,
    };

    const updatedVariants = [...product.variants, newVariantObj];
    addCustomProduct({
      ...product,
      variants: updatedVariants,
    });

    setStock((prev) => ({ ...prev, [vId]: variantStock }));
    toast.success(`Added new variant (${variantSize}) rate to ${product.name}!`);
    setAddingVariantForProductId(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center items-center gap-2 text-xs text-muted-foreground font-body">
        <Loader2 className="animate-spin text-accent" /> Loading inventory catalog & pricing matrix...
      </div>
    );
  }

  const trackedCount = Object.values(stock).filter((v) => v !== UNTRACKED).length;
  const lowCount = Object.entries(stock).filter(([, v]) => v !== UNTRACKED && v > 0 && v <= 5).length;
  const outCount = Object.entries(stock).filter(([, v]) => v !== UNTRACKED && v <= 0).length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-28 font-body text-foreground">
      {/* Header Banner & Primary Actions */}
      <div className="bg-background border border-border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-accent" /> Catalog, Category & Inventory Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage product items, category classifications, variant rates (Price ₹ / MRP ₹), and live stock.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-3.5 py-2 border border-border hover:bg-secondary rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FolderPlus size={15} className="text-accent" /> + Add Category
          </button>
          <button
            type="button"
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/90 cursor-pointer transition-colors shadow-xs"
          >
            <PackagePlus size={15} /> + Add New Product / Item
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Summary label="Total Items in Store" value={allProds.length} sub={`${categoriesList.length} Categories`} />
        <Summary label="Tracked Variants" value={trackedCount} />
        <Summary label="Low Stock (≤5)" value={lowCount} tone="pending" />
        <Summary label="Out of Stock (0)" value={outCount} tone="cancelled" />
      </div>

      {/* Filter & Action Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products by English or regional name (e.g. Badam, Pista)..."
              className="w-full pl-9 pr-3 py-2 border border-border bg-background text-xs font-body focus:outline-none focus:border-accent rounded-lg"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-xs font-body focus:outline-none rounded-lg cursor-pointer max-w-[180px]"
          >
            <option value="all">All Categories ({categoriesList.length})</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAllInViewStock(UNTRACKED)}
            className="px-3 py-1.5 text-xs font-body border border-border rounded-lg hover:bg-secondary transition-colors"
            title="Untrack stock for visible products"
          >
            Set All Visible to Unlimited (∞)
          </button>
          <button
            type="button"
            onClick={() => setAllInViewStock(0)}
            className="px-3 py-1.5 text-xs font-body border border-border rounded-lg hover:bg-secondary transition-colors text-destructive"
          >
            Set All Visible to 0 (Out of Stock)
          </button>
        </div>
      </div>

      {/* Catalog & Inventory Product Grid */}
      <div className="space-y-4">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            {/* Product Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <img src={getProductImageSrc(p)} alt={p.name} className="size-12 object-cover rounded-lg border border-border" />
                <div>
                  <div className="font-display font-bold text-base flex items-center gap-2">
                    {p.name}
                    {p.localName && (
                      <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded font-mono font-medium">
                        {p.localName}
                      </span>
                    )}
                    {p.badge && (
                      <Badge variant="outline" className="text-[9px] uppercase font-mono">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-body mt-0.5 flex items-center gap-2">
                    <span className="capitalize font-medium text-foreground">Category: {p.category.replace("-", " ")}</span>
                    <span>•</span>
                    <span className="truncate max-w-md">{p.description}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddingVariantForProductId(addingVariantForProductId === p.id ? null : p.id);
                }}
                className="text-xs border border-border hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
              >
                <PlusCircle size={13} /> + Add Weight Variant / Rate
              </button>
            </div>

            {/* Inline Add Variant Form */}
            {addingVariantForProductId === p.id && (
              <div className="p-4 bg-accent/5 border-b border-border space-y-3 font-body text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent" /> Add New Weight Variant & Rate for {p.name}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                      Weight Size
                    </label>
                    <input
                      type="text"
                      value={variantSize}
                      onChange={(e) => setVariantSize(e.target.value)}
                      placeholder="e.g. 100g, 500g, 1 Kg"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                      Selling Rate (Price ₹)
                    </label>
                    <input
                      type="number"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(Number(e.target.value))}
                      placeholder="350"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                      Original MRP ₹
                    </label>
                    <input
                      type="number"
                      value={variantMrp}
                      onChange={(e) => setVariantMrp(Number(e.target.value))}
                      placeholder="450"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      value={variantStock}
                      onChange={(e) => setVariantStock(Number(e.target.value))}
                      placeholder="50"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddingVariantForProductId(null)}
                    className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVariantToProduct(p)}
                    className="px-4 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:bg-accent/90"
                  >
                    Save Variant Rate
                  </button>
                </div>
              </div>
            )}

            {/* Variants Matrix (Rates, MRP, Stock) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {p.variants.map((v) => {
                const stockVal = stock[v.id];
                const untracked = stockVal === UNTRACKED || stockVal === undefined;
                const low = !untracked && stockVal > 0 && stockVal <= 5;
                const out = !untracked && stockVal <= 0;

                const currentPrice = pricesMap[v.id]?.price ?? v.price;
                const currentMrp = pricesMap[v.id]?.mrp ?? (v.mrp || Math.round(v.price * 1.25));

                const isPriceDirty =
                  currentPrice !== (initialPrices[v.id]?.price ?? v.price) ||
                  currentMrp !== (initialPrices[v.id]?.mrp ?? (v.mrp || Math.round(v.price * 1.25)));
                const isStockDirty = stockVal !== initialStock[v.id];

                return (
                  <div
                    key={v.id}
                    className={`border rounded-xl p-3.5 transition-colors space-y-3 ${
                      isPriceDirty || isStockDirty ? "border-accent bg-accent/5" : "border-border/80 bg-background"
                    }`}
                  >
                    {/* Size & Status Badges */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="font-semibold text-xs text-foreground font-mono">{v.size} Variant</span>
                      <div className="flex gap-1 items-center">
                        {out && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-status-cancelled/15 text-status-cancelled rounded">
                            Out of Stock
                          </span>
                        )}
                        {low && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-status-pending/15 text-status-pending rounded">
                            Low Stock ({stockVal})
                          </span>
                        )}
                        {(isPriceDirty || isStockDirty) && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-accent/20 text-accent rounded font-mono">
                            Edited
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate & Pricing Controls */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase font-semibold text-muted-foreground mb-1">
                          Selling Rate (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => setRateVal(v.id, "price", Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1 border border-border rounded bg-background text-xs font-bold tabular-nums text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-semibold text-muted-foreground mb-1">
                          Original MRP (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={currentMrp}
                            onChange={(e) => setRateVal(v.id, "mrp", Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1 border border-border rounded bg-background text-xs font-semibold tabular-nums text-muted-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock Counter Controls */}
                    <div>
                      <label className="block text-[9px] uppercase font-semibold text-muted-foreground mb-1">
                        Stock Inventory Level
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStockVal(v.id, Math.max(0, (untracked ? 0 : stockVal) - 1))}
                          disabled={untracked}
                          className="p-1.5 border border-border rounded-lg hover:bg-secondary disabled:opacity-40"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min={0}
                          disabled={untracked}
                          value={untracked ? "" : stockVal}
                          onChange={(e) => setStockVal(v.id, e.target.value === "" ? 0 : Number(e.target.value))}
                          className="flex-1 border border-border px-2 py-1 text-xs font-body tabular-nums text-center focus:outline-none focus:border-accent rounded-lg disabled:bg-muted/50 font-bold"
                          placeholder={untracked ? "Unlimited (∞)" : "0"}
                        />
                        <button
                          type="button"
                          onClick={() => setStockVal(v.id, (untracked ? 0 : stockVal) + 1)}
                          disabled={untracked}
                          className="p-1.5 border border-border rounded-lg hover:bg-secondary disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStockVal(v.id, untracked ? 0 : UNTRACKED)}
                          title={untracked ? "Enable tracked stock counter" : "Set to unlimited stock (∞)"}
                          className={`p-1.5 border rounded-lg transition-colors ${
                            untracked ? "border-accent text-accent font-bold bg-accent/10" : "border-border hover:bg-secondary"
                          }`}
                        >
                          <InfIcon size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Save Changes Bar */}
      {totalDirtyCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 font-body">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <AlertCircle size={16} className="text-accent animate-pulse" />
              <span>
                You have <strong className="font-bold text-accent">{totalDirtyCount} unsaved change{totalDirtyCount === 1 ? "" : "s"}</strong> (Rates & Stock)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStock({ ...initialStock });
                  setPricesMap({ ...initialPrices });
                }}
                className="px-4 py-2 text-xs border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveAllChanges}
                disabled={saving}
                className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save All Changes ({totalDirtyCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Category Dialog */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 font-body">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <FolderPlus size={18} className="text-accent" /> Create New Product Category
              </h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Category Name / Label <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="e.g. Organic Spices, Energy Bars, Festive Combos"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 text-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Product / Item Dialog */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 font-body my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <PackagePlus size={18} className="text-accent" /> Add New Item / Product to Store
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create a new product with category, weight sizes, rates (Price ₹), and initial stock.
                </p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Product English Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. Royal Kashmiri Saffron"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Regional / Hindi Name (Chip Label)
                  </label>
                  <input
                    type="text"
                    value={newProdLocalName}
                    onChange={(e) => setNewProdLocalName(e.target.value)}
                    placeholder="e.g. Kesar"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Category Classification <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {categoriesList
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    placeholder="e.g. Bestseller, Organic, Premium"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="Short overview of the product, farm source, or health benefits..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Product Image Link / Path
                </label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="/images/catalog/almonds.jpg or Google Drive image URL"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                />
              </div>

              {/* Product Weight Rates & MRP Table */}
              <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" /> Weight Variants & Rates (Price ₹ / MRP ₹)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewProdVariants([
                        ...newProdVariants,
                        { size: "1 Kg", price: 999, mrp: 1299, stock: 20 },
                      ])
                    }
                    className="text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                  >
                    + Add Size Row
                  </button>
                </div>

                <div className="space-y-2">
                  {newProdVariants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Size (e.g. 250g)"
                        value={v.size}
                        onChange={(e) => {
                          const updated = [...newProdVariants];
                          updated[i].size = e.target.value;
                          setNewProdVariants(updated);
                        }}
                        className="px-2 py-1 border border-border rounded bg-background text-xs font-medium"
                      />
                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...newProdVariants];
                          updated[i].price = Number(e.target.value);
                          setNewProdVariants(updated);
                        }}
                        className="px-2 py-1 border border-border rounded bg-background text-xs font-bold"
                      />
                      <input
                        type="number"
                        placeholder="MRP ₹"
                        value={v.mrp}
                        onChange={(e) => {
                          const updated = [...newProdVariants];
                          updated[i].mrp = Number(e.target.value);
                          setNewProdVariants(updated);
                        }}
                        className="px-2 py-1 border border-border rounded bg-background text-xs font-semibold"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...newProdVariants];
                            updated[i].stock = Number(e.target.value);
                            setNewProdVariants(updated);
                          }}
                          className="w-full px-2 py-1 border border-border rounded bg-background text-xs"
                        />
                        {newProdVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setNewProdVariants(newProdVariants.filter((_, idx) => idx !== i))}
                            className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 text-xs shadow-md"
                >
                  Save & Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "pending" | "cancelled";
}) => (
  <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
    <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground font-body">{label}</div>
    <div
      className={`font-display text-2xl font-bold mt-1 tabular-nums ${
        tone === "pending" ? "text-status-pending" : tone === "cancelled" ? "text-status-cancelled" : "text-foreground"
      }`}
    >
      {value}
    </div>
    {sub && <div className="text-[10px] text-muted-foreground mt-0.5 font-body">{sub}</div>}
  </div>
);

export default AdminInventory;
