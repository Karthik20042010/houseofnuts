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
  PackagePlus,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  X,
  Tag,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { adminUpdateInventory, adminUploadImage } from "@/lib/admin";
import { fetchInventory, StockMap } from "@/lib/inventory";
import { products as baseProducts, Product, ProductVariant } from "@/data/products";
import {
  getAllProducts,
  getCustomCategories,
  addCustomCategory,
  getSubcategoriesForCategory,
  addCustomSubcategory,
  addCustomProduct,
  getPriceOverrides,
  savePriceOverrides,
  PriceOverride,
} from "@/lib/customCatalog";
import { fileToDataUrl, getProductImageSrc } from "@/lib/productImages";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const UNTRACKED = -1;

const presetCatalogImages = [
  { label: "Almonds", url: "/images/catalog/almonds.jpg" },
  { label: "Mamra Badam", url: "/images/catalog/mamra-almonds.jpg" },
  { label: "Cashews", url: "/images/catalog/cashews.jpg" },
  { label: "Pistachios", url: "/images/catalog/mamra-pistachios.jpg" },
  { label: "Walnuts", url: "/images/catalog/walnuts.jpg" },
  { label: "Saffron", url: "/images/catalog/saffron.jpg" },
  { label: "Wild Honey", url: "/images/catalog/honey.jpg" },
  { label: "Berry Mix", url: "/images/catalog/berry-mix.jpg" },
  { label: "Gift Box", url: "/images/catalog/luxury-box.jpg" },
  { label: "Chocolates", url: "/images/catalog/chocolate-box.jpg" },
];

export const AdminInventory = () => {
  const [allProds, setAllProds] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState(getCustomCategories());

  // Selection states for Category -> Subcategory hierarchy workflow
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  const [stock, setStock] = useState<Record<string, number>>({});
  const [initialStock, setInitialStock] = useState<Record<string, number>>({});

  // Rate/Price Overrides State
  const [pricesMap, setPricesMap] = useState<Record<string, PriceOverride>>({});
  const [initialPrices, setInitialPrices] = useState<Record<string, PriceOverride>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);

  // Image Uploading State
  const [imageUploading, setImageUploading] = useState(false);

  // New Parent Category Form state
  const [newCatLabel, setNewCatLabel] = useState("");

  // New Subcategory Form state
  const [newSubcatParent, setNewSubcatParent] = useState("nuts");
  const [newSubcatLabel, setNewSubcatLabel] = useState("");

  // New Product Form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdLocalName, setNewProdLocalName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("nuts");
  const [newProdSubcategory, setNewProdSubcategory] = useState("almonds");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdImage, setNewProdImage] = useState("/images/catalog/almonds.jpg");
  const [newProdBadge, setNewProdBadge] = useState("Fresh Harvest");
  const [newProdVariants, setNewProdVariants] = useState<
    Array<{ size: string; price: number; mrp: number; stock: number }>
  >([
    { size: "250g", price: 350, mrp: 450, stock: 50 },
    { size: "500g", price: 650, mrp: 850, stock: 30 },
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

  // Available Subcategories based on selected Parent Category
  const activeSubcategoriesList = useMemo(() => {
    return getSubcategoriesForCategory(selectedParentCategory);
  }, [selectedParentCategory]);

  // Reset subcategory selection when parent category changes
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedParentCategory]);

  // Filter products by Search Query, Parent Category, and Subcategory
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProds.filter((p) => {
      // 1. Check Parent Category filter
      if (selectedParentCategory !== "all" && p.category !== selectedParentCategory) {
        return false;
      }
      // 2. Check Subcategory filter
      if (selectedSubcategory !== "all" && p.subcategory !== selectedSubcategory) {
        return false;
      }
      // 3. Check Search Query filter
      if (q && !p.name.toLowerCase().includes(q) && !p.localName?.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [allProds, searchQuery, selectedParentCategory, selectedSubcategory]);

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

  // Image File Selection & Direct Upload Handler
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setImageUploading(true);
    try {
      // 1. Try Google Drive cloud upload if backend is accessible
      try {
        const base64Raw = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = String(reader.result || "");
            const commaIdx = res.indexOf(",");
            resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : res);
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const driveRes = await adminUploadImage({
          productId: newProdName ? newProdName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "new-item",
          dataBase64: base64Raw,
          filename: file.name,
          mimeType: file.type,
          category: newProdCategory,
        });

        if (driveRes && driveRes.ok && driveRes.url) {
          setNewProdImage(driveRes.url);
          toast.success("Image uploaded to Google Drive CDN successfully!");
          setImageUploading(false);
          return;
        }
      } catch {
        // Fallback to local Data URL
      }

      const dataUrl = await fileToDataUrl(file);
      setNewProdImage(dataUrl);
      toast.success("Image file attached successfully!");
    } catch {
      toast.error("Failed to read image file.");
    } finally {
      setImageUploading(false);
    }
  };

  // Handle Add New Parent Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const created = addCustomCategory(newCatLabel);
    toast.success(`Category "${created.label}" created successfully!`);
    setSelectedParentCategory(created.id);
    setNewCatLabel("");
    setIsAddCategoryOpen(false);
    loadData();
  };

  // Handle Add New Subcategory
  const handleAddSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatLabel.trim()) {
      toast.error("Please enter a subcategory name.");
      return;
    }
    const created = addCustomSubcategory(newSubcatParent, newSubcatLabel);
    toast.success(`Subcategory "${created.label}" added under category!`);
    setSelectedParentCategory(newSubcatParent);
    setSelectedSubcategory(created.id);
    setNewSubcatLabel("");
    setIsAddSubcategoryOpen(false);
    loadData();
  };

  // Open Product Creation Modal with pre-selected Category & Subcategory
  const openAddProductModal = () => {
    const parent = selectedParentCategory === "all" ? "nuts" : selectedParentCategory;
    setNewProdCategory(parent);

    const availableSubcats = getSubcategoriesForCategory(parent);
    const sub = selectedSubcategory !== "all" ? selectedSubcategory : (availableSubcats[0]?.id || "almonds");
    setNewProdSubcategory(sub);

    setIsAddProductOpen(true);
  };

  // Handle Add New Product / Item
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (!newProdImage.trim()) {
      toast.error("Please select or upload a product image.");
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
      subcategory: newProdSubcategory,
      description: newProdDescription.trim() || "Hand-selected premium dry fruits",
      image: newProdImage.trim(),
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

    toast.success(`Product "${createdProd.name}" created with attached image!`);
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
        <Loader2 className="animate-spin text-accent" /> Loading category hierarchy & inventory catalog matrix...
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
            <Layers className="h-6 w-6 text-accent" /> Category, Subcategory & Inventory Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Hierarchical workflow: Select Parent Category &rarr; Subcategory &rarr; Upload Image & Update Rates.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-3 py-2 border border-border hover:bg-secondary rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FolderPlus size={14} className="text-accent" /> + Category
          </button>
          <button
            type="button"
            onClick={() => {
              setNewSubcatParent(selectedParentCategory === "all" ? "nuts" : selectedParentCategory);
              setIsAddSubcategoryOpen(true);
            }}
            className="px-3 py-2 border border-border hover:bg-secondary rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FolderPlus size={14} className="text-accent" /> + Subcategory
          </button>
          <button
            type="button"
            onClick={openAddProductModal}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/90 cursor-pointer transition-colors shadow-xs"
          >
            <PackagePlus size={15} /> + Add Product Item
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Summary label="Products in Store" value={allProds.length} sub={`${categoriesList.length} Categories`} />
        <Summary label="Tracked Weight Variants" value={trackedCount} />
        <Summary label="Low Stock (≤5)" value={lowCount} tone="pending" />
        <Summary label="Out of Stock (0)" value={outCount} tone="cancelled" />
      </div>

      {/* STEP 1 & STEP 2 HIERARCHICAL CATEGORY SELECTOR */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs">
        {/* STEP 1: Select Parent Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="size-5 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px]">
                1
              </span>
              Select Parent Category
            </span>
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="text-[11px] text-accent font-semibold hover:underline"
            >
              + Add Category
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedParentCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedParentCategory === "all"
                  ? "bg-accent text-accent-foreground font-bold shadow-xs"
                  : "bg-muted/40 hover:bg-secondary text-muted-foreground"
              }`}
            >
              All Categories ({allProds.length})
            </button>
            {categoriesList
              .filter((c) => c.id !== "all")
              .map((c) => {
                const count = allProds.filter((p) => p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedParentCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      selectedParentCategory === c.id
                        ? "bg-accent text-accent-foreground font-bold shadow-xs"
                        : "bg-muted/40 hover:bg-secondary text-foreground"
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {/* STEP 2: Select Subcategory */}
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="size-5 rounded-full bg-accent text-accent-foreground grid place-items-center text-[10px]">
                2
              </span>
              Select Subcategory ({selectedParentCategory === "all" ? "All Categories" : categoriesList.find((c) => c.id === selectedParentCategory)?.label})
            </span>
            <button
              onClick={() => {
                setNewSubcatParent(selectedParentCategory === "all" ? "nuts" : selectedParentCategory);
                setIsAddSubcategoryOpen(true);
              }}
              className="text-[11px] text-accent font-semibold hover:underline"
            >
              + Add Subcategory under this Category
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedSubcategory("all")}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                selectedSubcategory === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border/80 bg-background hover:bg-secondary text-muted-foreground"
              }`}
            >
              All Subcategories
            </button>
            {activeSubcategoriesList.map((sub) => {
              const count = allProds.filter(
                (p) =>
                  (selectedParentCategory === "all" || p.category === selectedParentCategory) &&
                  p.subcategory === sub.id
              ).length;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    selectedSubcategory === sub.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "border border-border/80 bg-background hover:bg-secondary text-foreground"
                  }`}
                >
                  {sub.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Search & Stock Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/60">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by English name or regional Hindi name (e.g. Badam, Pista, Kaju)..."
              className="w-full pl-9 pr-3 py-2 border border-border bg-background text-xs font-body focus:outline-none focus:border-accent rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllInViewStock(UNTRACKED)}
              className="px-3 py-1.5 text-xs font-body border border-border rounded-lg hover:bg-secondary transition-colors"
              title="Untrack stock for visible products"
            >
              Set Visible to Unlimited (∞)
            </button>
            <button
              type="button"
              onClick={() => setAllInViewStock(0)}
              className="px-3 py-1.5 text-xs font-body border border-border rounded-lg hover:bg-secondary transition-colors text-destructive"
            >
              Set Visible to Out of Stock (0)
            </button>
          </div>
        </div>
      </div>

      {/* Active Breadcrumb Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body bg-muted/20 px-4 py-2 rounded-lg border border-border/60">
        <Filter size={13} className="text-accent" />
        <span>Showing:</span>
        <span className="font-semibold text-foreground">
          {selectedParentCategory === "all" ? "All Categories" : categoriesList.find((c) => c.id === selectedParentCategory)?.label}
        </span>
        <ChevronRight size={12} />
        <span className="font-semibold text-foreground">
          {selectedSubcategory === "all"
            ? "All Subcategories"
            : activeSubcategoriesList.find((s) => s.id === selectedSubcategory)?.label || selectedSubcategory}
        </span>
        <span className="ml-auto font-mono text-[11px] text-accent font-bold">
          {filteredProducts.length} Product Item{filteredProducts.length === 1 ? "" : "s"} Found
        </span>
      </div>

      {/* Catalog & Inventory Product Grid */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3 font-body">
            <div className="size-12 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto">
              <PackagePlus size={24} />
            </div>
            <h3 className="font-display font-bold text-lg">No Products Found in Selected Category</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No items match the selected category & subcategory combination. Click below to create a new product item in this category!
            </p>
            <button
              type="button"
              onClick={openAddProductModal}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:bg-accent/90 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Product to {selectedParentCategory === "all" ? "Inventory" : selectedParentCategory}
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
              {/* Product Header */}
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
                    <div className="text-xs text-muted-foreground font-body mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="capitalize font-semibold text-foreground">
                        {p.category.replace("-", " ")}
                      </span>
                      {p.subcategory && (
                        <>
                          <ChevronRight size={12} className="text-muted-foreground" />
                          <span className="bg-primary/10 text-primary font-mono text-[10px] px-2 py-0.5 rounded font-medium capitalize">
                            Sub: {p.subcategory.replace("-", " ")}
                          </span>
                        </>
                      )}
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
          ))
        )}
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

      {/* MODAL 1: Add New Parent Category Dialog */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 font-body">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <FolderPlus size={18} className="text-accent" /> Create Parent Category
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

      {/* MODAL 2: Add New Subcategory Dialog */}
      {isAddSubcategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 font-body">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <FolderPlus size={18} className="text-accent" /> Create New Subcategory
              </h3>
              <button onClick={() => setIsAddSubcategoryOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubcategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Select Parent Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={newSubcatParent}
                  onChange={(e) => setNewSubcatParent(e.target.value)}
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
                  Subcategory Name / Label <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSubcatLabel}
                  onChange={(e) => setNewSubcatLabel(e.target.value)}
                  placeholder="e.g. Pekans, Macadamia, Whole Spices, Flavored Honey"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubcategoryOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 text-xs"
                >
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Product / Item Dialog */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 font-body my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <PackagePlus size={18} className="text-accent" /> Add New Item / Product to Store
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create a new product with image upload, category, subcategory, rates, and stock.
                </p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              {/* Product Image Picker & Direct File Upload */}
              <div className="space-y-2 border border-border rounded-xl p-3.5 bg-muted/10 font-body text-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon size={15} className="text-accent" /> Product Image File Upload / Selector <span className="text-destructive">*</span>
                  </label>
                  {newProdImage && (
                    <button
                      type="button"
                      onClick={() => setNewProdImage("")}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  {/* Live Image Preview Thumbnail */}
                  <div className="size-20 rounded-xl border border-border bg-background flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                    {newProdImage ? (
                      <img src={newProdImage} alt="Product preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-muted-foreground text-[10px]">
                        <Upload size={16} className="mx-auto mb-1 opacity-50 text-accent" />
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2.5 min-w-0">
                    {/* Direct File Upload Trigger */}
                    <div>
                      <label className="w-full border border-dashed border-accent/50 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-colors rounded-xl p-2.5 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-accent shadow-xs">
                        {imageUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Uploading & Processing Image...
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> Choose Image File from Computer / Device
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileSelect}
                        />
                      </label>
                    </div>

                    {/* Quick Preset Selector */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                      <span className="text-[10px] text-muted-foreground font-semibold shrink-0">Presets:</span>
                      {presetCatalogImages.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => setNewProdImage(img.url)}
                          className={`size-7 rounded-lg border shrink-0 overflow-hidden transition-transform cursor-pointer ${
                            newProdImage === img.url ? "border-accent ring-2 ring-accent/30 scale-105" : "border-border opacity-70 hover:opacity-100"
                          }`}
                          title={img.label}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Image URL Input */}
                    <input
                      type="text"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      placeholder="Or paste external image URL / path (e.g. /images/catalog/almonds.jpg)"
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-[11px] font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

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
                    Parent Category Classification <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setNewProdCategory(newCatId);
                      const subcats = getSubcategoriesForCategory(newCatId);
                      if (subcats.length > 0) {
                        setNewProdSubcategory(subcats[0].id);
                      }
                    }}
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
                    Subcategory Classification
                  </label>
                  <select
                    value={newProdSubcategory}
                    onChange={(e) => setNewProdSubcategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {getSubcategoriesForCategory(newProdCategory).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Product Description
                  </label>
                  <input
                    type="text"
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    placeholder="Short overview of farm source or health benefits..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:border-accent"
                  />
                </div>
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
