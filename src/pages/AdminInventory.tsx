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
  Trash2,
  Images,
  Star,
  Edit3,
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
import {
  fileToDataUrl,
  getProductImageSrc,
  getProductGallery,
  setProductGallery,
} from "@/lib/productImages";
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

  // Store Media Gallery & Multi-Product Mapper Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);
  const [targetMappingProductIds, setTargetMappingProductIds] = useState<string[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");

  // Existing Product Image Editing Modal State
  const [editingImageProduct, setEditingImageProduct] = useState<Product | null>(null);
  const [editingProductImages, setEditingProductImages] = useState<string[]>([]);

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
  const [newProdImages, setNewProdImages] = useState<string[]>(["/images/catalog/almonds.jpg"]);
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

  const refreshCatalogLocal = () => {
    const prods = getAllProducts(baseProducts);
    setAllProds(prods);
    setCategoriesList(getCustomCategories());

    const initialRates = getPriceOverrides();
    setPricesMap(initialRates);
    setInitialPrices({ ...initialRates });
  };

  const loadData = async (forceNetwork = false, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    refreshCatalogLocal();

    const s: StockMap = await fetchInventory(forceNetwork);
    const prods = getAllProducts(baseProducts);
    const initStock: Record<string, number> = {};
    for (const p of prods) {
      for (const v of p.variants) {
        initStock[v.id] = Object.prototype.hasOwnProperty.call(s, v.id) ? s[v.id] : UNTRACKED;
      }
    }
    setStock((prev) => ({ ...initStock, ...prev }));
    setInitialStock({ ...initStock });
    if (showSpinner) setLoading(false);
  };

  useEffect(() => {
    loadData(true, true);

    const handleCatalogUpdate = () => {
      refreshCatalogLocal();
    };

    window.addEventListener("hon-catalog-update", handleCatalogUpdate);
    return () => window.removeEventListener("hon-catalog-update", handleCatalogUpdate);
  }, []);

  // Available Subcategories based on selected Parent Category
  const activeSubcategoriesList = useMemo(() => {
    return getSubcategoriesForCategory(selectedParentCategory);
  }, [selectedParentCategory]);

  // Aggregate all store media photos across catalog products & presets
  const storeMediaLibrary = useMemo(() => {
    const map = new Map<string, string>();
    presetCatalogImages.forEach((p) => map.set(p.url, `Preset: ${p.label}`));
    allProds.forEach((p) => {
      const gallery = getProductGallery(p);
      gallery.forEach((url) => {
        if (!map.has(url)) {
          map.set(url, p.name);
        }
      });
    });
    return Array.from(map.entries()).map(([url, source]) => ({ url, source }));
  }, [allProds]);

  // Multi-Product Image Mapping Handler
  const handleApplyMultiProductMapping = () => {
    if (selectedMediaUrls.length === 0) {
      toast.error("Please select at least one photo from the store gallery.");
      return;
    }

    if (editingImageProduct) {
      setEditingProductImages((prev) => Array.from(new Set([...prev, ...selectedMediaUrls])));
    }

    if (targetMappingProductIds.length === 0 && !editingImageProduct) {
      toast.error("Please select at least one product ID to map photos to.");
      return;
    }

    let updatedCount = 0;
    for (const pId of targetMappingProductIds) {
      const targetProd = allProds.find((p) => p.id === pId);
      if (!targetProd) continue;

      const existingGallery = getProductGallery(targetProd);
      const merged = Array.from(new Set([...selectedMediaUrls, ...existingGallery]));

      setProductGallery(pId, merged);
      addCustomProduct({
        ...targetProd,
        image: merged[0],
        images: merged,
      });
      updatedCount++;
    }

    if (updatedCount > 0) {
      toast.success(`Mapped ${selectedMediaUrls.length} photo(s) to ${updatedCount} product(s)!`);
    } else if (editingImageProduct) {
      toast.success(`Attached ${selectedMediaUrls.length} photo(s) to ${editingImageProduct.name}!`);
    }

    setIsMediaPickerOpen(false);
    setSelectedMediaUrls([]);
    setTargetMappingProductIds([]);
    refreshCatalogLocal();
  };

  // Reset subcategory selection when parent category changes
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedParentCategory]);

  // Filter products by Search Query, Parent Category, and Subcategory
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allProds.filter((p) => {
      if (selectedParentCategory !== "all" && p.category !== selectedParentCategory) {
        return false;
      }
      if (selectedSubcategory !== "all" && p.subcategory !== selectedSubcategory) {
        return false;
      }
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
      savePriceOverrides(pricesMap);
      setInitialPrices({ ...pricesMap });

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

      toast.success(`Saved ${totalDirtyCount} rate & stock updates!`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save inventory updates");
    } finally {
      setSaving(false);
    }
  };

  // Helper to check if an image file is a duplicate of existing gallery URLs
  const isDuplicateImageFile = async (file: File, existingUrls: string[]): Promise<boolean> => {
    const newDataUrl = await fileToDataUrl(file);
    for (const url of existingUrls) {
      if (url === newDataUrl) return true;
      if (url.startsWith("data:") && newDataUrl.startsWith("data:")) {
        const c1 = url.split(",")[1];
        const c2 = newDataUrl.split(",")[1];
        if (c1 && c2 && c1 === c2) return true;
      }
    }
    return false;
  };

  // Helper for Uploading an Image File to Drive / Data URL
  const processImageFileUpload = async (
    file: File,
    category: string,
    targetProductId?: string
  ): Promise<string> => {
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
        productId: targetProductId || file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        dataBase64: base64Raw,
        filename: file.name,
        mimeType: file.type,
        category,
      });

      if (driveRes && driveRes.ok && driveRes.url) {
        return driveRes.url;
      }
    } catch {
      // Fallback
    }

    return await fileToDataUrl(file);
  };

  // Multiple Image File Selection for New Product Creation
  const handleNewProdImageFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const newUrls: string[] = [];
      let skippedCount = 0;

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const isDup = await isDuplicateImageFile(file, newProdImages);
        if (isDup) {
          skippedCount++;
          continue;
        }

        const url = await processImageFileUpload(file, newProdCategory);
        if (url && !newProdImages.includes(url) && !newUrls.includes(url)) {
          newUrls.push(url);
        }
      }

      if (skippedCount > 0) {
        toast.info(`Skipped ${skippedCount} duplicate photo(s) already in gallery.`);
      }

      if (newUrls.length > 0) {
        setNewProdImages((prev) => Array.from(new Set([...prev, ...newUrls])));
        toast.success(`Attached ${newUrls.length} image(s) to product!`);
      }
    } catch {
      toast.error("Failed to read image files.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  // Multiple Image File Upload for Existing Item Editing
  const handleExistingProdImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingImageProduct) return;
    const targetItem = editingImageProduct;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const newUrls: string[] = [];
      let skippedCount = 0;

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        const isDup = await isDuplicateImageFile(file, editingProductImages);
        if (isDup) {
          skippedCount++;
          continue;
        }

        const url = await processImageFileUpload(file, targetItem.category, targetItem.id);
        if (url && !editingProductImages.includes(url) && !newUrls.includes(url)) {
          newUrls.push(url);
        }
      }

      if (skippedCount > 0) {
        toast.info(`Skipped ${skippedCount} duplicate photo(s) already in gallery.`);
      }

      if (newUrls.length > 0) {
        setEditingProductImages((prev) => Array.from(new Set([...prev, ...newUrls])));
        toast.success(`Added ${newUrls.length} new photo(s) to ${targetItem.name}'s gallery!`);
      }
    } catch {
      toast.error("Failed to upload image files.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  // Open Image Editing Modal for an Existing Product
  const openImageEditModal = (product: Product) => {
    setEditingImageProduct(product);
    const gallery = getProductGallery(product);
    setEditingProductImages(gallery.length > 0 ? gallery : [product.image]);
  };

  // Save Image Gallery Changes for an Existing Product
  const handleSaveProductGallery = () => {
    if (!editingImageProduct) return;
    if (editingProductImages.length === 0) {
      toast.error("Product must have at least one primary cover image.");
      return;
    }

    setProductGallery(editingImageProduct.id, editingProductImages);

    // Update product object in custom catalog if custom product
    addCustomProduct({
      ...editingImageProduct,
      image: editingProductImages[0],
      images: editingProductImages,
    });

    toast.success(`Saved updated image gallery for ${editingImageProduct.name}!`);
    setEditingImageProduct(null);
    refreshCatalogLocal();
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
    refreshCatalogLocal();
  };

  // Handle Add New Subcategory
  const handleAddSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatLabel.trim()) {
      toast.error("Please enter a subcategory name.");
      return;
    }
    const created = addCustomSubcategory(newSubcatParent, newSubcatLabel);
    toast.success(`Subcategory "${created.label}" added!`);
    setSelectedParentCategory(newSubcatParent);
    setSelectedSubcategory(created.id);
    setNewSubcatLabel("");
    setIsAddSubcategoryOpen(false);
    refreshCatalogLocal();
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
    if (newProdImages.length === 0) {
      toast.error("Please attach at least one product image.");
      return;
    }
    if (newProdVariants.length === 0) {
      toast.error("Please add at least one variant rate.");
      return;
    }

    const primaryImg = newProdImages[0];
    const createdProd = addCustomProduct({
      name: newProdName.trim(),
      localName: newProdLocalName.trim() || undefined,
      category: newProdCategory as any,
      subcategory: newProdSubcategory,
      description: newProdDescription.trim() || "Hand-selected premium dry fruits",
      image: primaryImg,
      images: newProdImages,
      badge: newProdBadge.trim() || undefined,
      variants: newProdVariants.map((v) => ({
        id: "",
        size: v.size,
        price: v.price,
        mrp: v.mrp,
      })),
    });

    setProductGallery(createdProd.id, newProdImages);

    // Update stock map with initial stock for newly created variants
    const newStockMap = { ...stock };
    newProdVariants.forEach((v, idx) => {
      const vId = createdProd.variants[idx]?.id;
      if (vId) {
        newStockMap[vId] = v.stock;
      }
    });
    setStock(newStockMap);

    toast.success(`Product "${createdProd.name}" created with ${newProdImages.length} image(s)!`);
    setIsAddProductOpen(false);

    // Reset form
    setNewProdName("");
    setNewProdLocalName("");
    setNewProdDescription("");
    setNewProdImages(["/images/catalog/almonds.jpg"]);
    refreshCatalogLocal();
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
    refreshCatalogLocal();
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
      {/* User Friendly Header Banner & Primary Action Buttons */}
      <div className="bg-background border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-accent" /> Easy Catalog, Multi-Image & Inventory Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Intuitive workflow: Select Category &rarr; Subcategory &rarr; Manage Multiple Images & Variant Rates.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setSelectedMediaUrls([]);
              setTargetMappingProductIds([]);
              setIsMediaPickerOpen(true);
            }}
            className="px-3.5 py-2 border border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Images size={15} /> Media Library & Multi-Mapper
          </button>
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="px-3.5 py-2 border border-border hover:bg-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FolderPlus size={15} className="text-accent" /> + Category
          </button>
          <button
            type="button"
            onClick={() => {
              setNewSubcatParent(selectedParentCategory === "all" ? "nuts" : selectedParentCategory);
              setIsAddSubcategoryOpen(true);
            }}
            className="px-3.5 py-2 border border-border hover:bg-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FolderPlus size={15} className="text-accent" /> + Subcategory
          </button>
          <button
            type="button"
            onClick={openAddProductModal}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/90 cursor-pointer transition-colors shadow-md"
          >
            <PackagePlus size={16} /> + Add Product Item
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
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4 shadow-xs">
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
            {/*
            <button
              type="button"
              onClick={() => setSelectedParentCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                selectedParentCategory === "all"
                  ? "bg-accent text-accent-foreground font-bold shadow-xs"
                  : "bg-muted/40 hover:bg-secondary text-muted-foreground"
              }`}
            >
              All Categories ({allProds.length})
            </button>
            */}
            {categoriesList
              .filter((c) => c.id !== "all")
              .map((c) => {
                const count = allProds.filter((p) => p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedParentCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
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
            {/*
            <button
              type="button"
              onClick={() => setSelectedSubcategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedSubcategory === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border/80 bg-background hover:bg-secondary text-muted-foreground"
              }`}
            >
              All Subcategories
            </button>
            */}
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
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

        {/* STEP 3: Search & Quick Batch Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/60">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by English name or regional Hindi name (e.g. Badam, Pista, Kaju)..."
              className="w-full pl-9 pr-3 py-2 border border-border bg-background text-xs font-body focus:outline-none focus:border-accent rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAllInViewStock(UNTRACKED)}
              className="px-3 py-1.5 text-xs font-body border border-border rounded-xl hover:bg-secondary transition-colors"
              title="Untrack stock for visible products"
            >
              Set Visible to Unlimited (∞)
            </button>
            <button
              type="button"
              onClick={() => setAllInViewStock(0)}
              className="px-3 py-1.5 text-xs font-body border border-border rounded-xl hover:bg-secondary transition-colors text-destructive"
            >
              Set Visible to Out of Stock (0)
            </button>
          </div>
        </div>
      </div>

      {/* Active Breadcrumb Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body bg-muted/20 px-4 py-2 rounded-xl border border-border/60">
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
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3 font-body">
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
              className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-semibold hover:bg-accent/90 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Product to {selectedParentCategory === "all" ? "Inventory" : selectedParentCategory}
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const gallery = getProductGallery(p);
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                {/* Product Header & Image Gallery Preview */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border bg-muted/20">
                  <div className="flex items-start gap-4">
                    {/* Primary Image & Multi-Image Gallery Strip */}
                    <div className="relative group shrink-0">
                      <img
                        src={getProductImageSrc(p)}
                        alt={p.name}
                        className="size-16 object-cover rounded-xl border border-border shadow-xs"
                      />
                      {gallery.length > 1 && (
                        <span className="absolute -bottom-1.5 -right-1.5 bg-accent text-accent-foreground text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                          <Images size={10} /> {gallery.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-display font-bold text-base flex items-center gap-2 flex-wrap">
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

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openImageEditModal(p)}
                      className="text-xs border border-border hover:bg-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-semibold cursor-pointer text-foreground"
                      title="Upload or change photos for this product item"
                    >
                      <Images size={14} className="text-accent" /> Edit Photos ({gallery.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingVariantForProductId(addingVariantForProductId === p.id ? null : p.id);
                      }}
                      className="text-xs border border-border hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-semibold cursor-pointer"
                    >
                      <PlusCircle size={14} /> + Add Weight Variant / Rate
                    </button>
                  </div>
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
            );
          })
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

      {/* MODAL: Edit Multiple Images for Existing Product */}
      {editingImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-5 font-body my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Images size={18} className="text-accent" /> Edit Multi-Image Gallery for {editingImageProduct.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload multiple photos for this item (Packaging, Harvest, Close-up). First photo is the Primary Cover.
                </p>
              </div>
              <button onClick={() => setEditingImageProduct(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Current Multi-Image Gallery Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Current Gallery Photos ({editingProductImages.length})
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {editingProductImages.map((img, idx) => (
                  <div key={idx} className="relative group border border-border rounded-xl overflow-hidden bg-muted/20 aspect-square shadow-xs">
                    <img src={img} alt={`Product photo ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Primary Cover Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1 left-1 bg-accent text-accent-foreground text-[8px] uppercase font-bold font-mono px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Star size={9} /> Primary Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          // Set as Primary Cover by moving to index 0
                          const updated = [img, ...editingProductImages.filter((_, i) => i !== idx)];
                          setEditingProductImages(updated);
                          toast.success("Set as Primary Cover photo!");
                        }}
                        className="absolute top-1 left-1 bg-black/70 hover:bg-accent text-white text-[8px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Make Primary
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    {editingProductImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingProductImages.filter((_, i) => i !== idx);
                          setEditingProductImages(updated);
                          toast.info("Photo removed from gallery.");
                        }}
                        className="absolute bottom-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Photos File Upload */}
            <div className="space-y-3 border-t border-border pt-4 text-xs">
              <label className="block font-semibold text-foreground">
                + Add More Photo Files or Preset Images
              </label>

              <label className="w-full border border-dashed border-accent/60 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-colors rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 font-semibold text-accent shadow-xs">
                {imageUploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Uploading Photo Files...
                  </>
                ) : (
                  <>
                    <Upload size={15} /> Upload Photo Files from Computer (JPG, PNG, WEBP)
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleExistingProdImageFilesUpload}
                />
              </label>

              {/* Presets Gallery Quick Selector */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Or attach preset store photos:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presetCatalogImages.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        setEditingProductImages((prev) => {
                          if (!prev.includes(img.url)) {
                            toast.success(`Attached preset ${img.label} photo!`);
                            return [...prev, img.url];
                          }
                          return prev;
                        });
                      }}
                      className="size-9 rounded-lg border border-border overflow-hidden shrink-0 opacity-70 hover:opacity-100 hover:border-accent transition-all cursor-pointer"
                      title={`Add ${img.label}`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Choose from Media Library & Multi-Product Mapper Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (editingImageProduct) {
                    setTargetMappingProductIds([editingImageProduct.id]);
                  }
                  setIsMediaPickerOpen(true);
                }}
                className="w-full py-2 px-3 border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Images size={15} /> Choose from Store Gallery Library & Map to Products
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setEditingImageProduct(null)}
                className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProductGallery}
                className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-xl text-xs shadow-md"
              >
                Save Product Gallery
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

      {/* MODAL 3: Add New Product / Item Dialog (with Multi-Image Upload) */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 font-body my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <PackagePlus size={18} className="text-accent" /> Add New Item / Product to Store
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create a new product with multiple image gallery upload, category, subcategory, rates, and stock.
                </p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              {/* Product Multi-Image Picker & Direct File Upload */}
              <div className="space-y-3 border border-border rounded-xl p-3.5 bg-muted/10 font-body text-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Images size={16} className="text-accent" /> Product Image Gallery ({newProdImages.length} Attached) <span className="text-destructive">*</span>
                  </label>
                  {newProdImages.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      First photo is Primary Cover
                    </span>
                  )}
                </div>

                {/* Multi-Image Thumbnail Gallery Grid */}
                {newProdImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {newProdImages.map((img, idx) => (
                      <div key={idx} className="relative group border border-border rounded-lg overflow-hidden bg-background aspect-square shadow-xs">
                        <img src={img} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-0.5 left-0.5 bg-accent text-accent-foreground text-[7px] uppercase font-bold px-1 rounded font-mono">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewProdImages(newProdImages.filter((_, i) => i !== idx))}
                          className="absolute bottom-0.5 right-0.5 bg-destructive text-destructive-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Multi-File Upload Trigger */}
                <label className="w-full border border-dashed border-accent/50 hover:border-accent bg-accent/5 hover:bg-accent/10 transition-colors rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-accent shadow-xs">
                  {imageUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading & Attaching Photo Files...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload Multiple Image Files (JPG, PNG, WEBP)
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleNewProdImageFilesSelect}
                  />
                </label>

                {/* Quick Preset Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-muted-foreground font-semibold shrink-0">Presets:</span>
                  {presetCatalogImages.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        if (!newProdImages.includes(img.url)) {
                          setNewProdImages([...newProdImages, img.url]);
                        }
                      }}
                      className="size-7 rounded-lg border border-border overflow-hidden shrink-0 opacity-70 hover:opacity-100 transition-transform hover:scale-105 cursor-pointer"
                      title={`Attach ${img.label}`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
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
                    Product Overview & Health Benefits
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
      {/* MODAL 4: Store Media Gallery Library & Multi-Product Mapper */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-body">
          <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-3xl shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Images size={20} className="text-accent" /> Store Media Library & Multi-Product Mapper
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select existing photos and map them to multiple product IDs simultaneously.
                </p>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Media Library */}
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-muted/20">
              <Search size={15} className="text-muted-foreground" />
              <input
                type="text"
                value={mediaSearchQuery}
                onChange={(e) => setMediaSearchQuery(e.target.value)}
                placeholder="Search photos by product name or preset label..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            {/* 1. SELECT PHOTOS GRID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Choose Photos ({selectedMediaUrls.length} Selected)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const filtered = storeMediaLibrary
                      .filter((m) => !mediaSearchQuery || m.source.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
                      .map((m) => m.url);
                    setSelectedMediaUrls(selectedMediaUrls.length === filtered.length ? [] : filtered);
                  }}
                  className="text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                >
                  {selectedMediaUrls.length > 0 ? "Clear Selection" : "Select All Visible"}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-border rounded-xl bg-muted/10">
                {storeMediaLibrary
                  .filter((m) => !mediaSearchQuery || m.source.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
                  .map((m, i) => {
                    const isSelected = selectedMediaUrls.includes(m.url);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedMediaUrls((prev) =>
                            isSelected ? prev.filter((u) => u !== m.url) : [...prev, m.url]
                          );
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 aspect-square cursor-pointer transition-all ${
                          isSelected
                            ? "border-accent ring-2 ring-accent/40 scale-95"
                            : "border-border/60 hover:border-accent/60 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={m.url} alt={m.source} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-accent fill-background" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] truncate px-1 text-center font-mono">
                          {m.source}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 2. MAP TO MULTIPLE PRODUCT IDS */}
            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Select Product IDs to Map Photos To ({targetMappingProductIds.length} Selected)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTargetMappingProductIds(allProds.map((p) => p.id))}
                    className="text-accent font-semibold hover:underline cursor-pointer"
                  >
                    Select All Products
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setTargetMappingProductIds([])}
                    className="text-muted-foreground font-semibold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-xl bg-muted/10">
                {allProds.map((p) => {
                  const isChecked = targetMappingProductIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "border-accent bg-accent/10 font-semibold"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetMappingProductIds((prev) => [...prev, p.id]);
                          } else {
                            setTargetMappingProductIds((prev) => prev.filter((id) => id !== p.id));
                          }
                        }}
                        className="accent-accent"
                      />
                      <img src={getProductImageSrc(p)} alt={p.name} className="size-6 rounded object-cover border border-border shrink-0" />
                      <div className="truncate">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-[9px] text-muted-foreground font-mono truncate">ID: {p.id}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-2 border border-border rounded-xl hover:bg-secondary text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyMultiProductMapping}
                className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-xl text-xs shadow-md hover:bg-accent/90 cursor-pointer"
              >
                Apply Photo Mapping ({selectedMediaUrls.length} photos &rarr; {targetMappingProductIds.length || (editingImageProduct ? 1 : 0)} products)
              </button>
            </div>
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
