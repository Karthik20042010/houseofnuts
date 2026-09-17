import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as Crumb, SlidersHorizontal, X, Clock } from "lucide-react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/ProductCardSkeleton";
import { useGridReady } from "@/hooks/useGridReady";
import PromoBanner from "@/components/PromoBanner";
import { categories as defaultCategories, products as defaultProducts, Product } from "@/data/products";
import { getAllProducts, getCustomCategories, getSubcategoriesForCategory, useCatalog } from "@/lib/customCatalog";
import { useInventory } from "@/contexts/InventoryContext";
import { isOutOfStock, sortProductsWithStockAndComingSoonLast } from "@/lib/inventory";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryVisibleToUser, isCategoryComingSoon } from "@/lib/accessControl";

import CategoryStrip from "@/components/CategoryStrip";
import BuildBox from "@/components/BuildBox";

const ITEMS_PER_PAGE = 8;

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

const priceBands: { id: string; label: string; min: number; max: number }[] = [
  { id: "u300", label: "Under ₹300", min: 0, max: 299 },
  { id: "300-600", label: "₹300 – ₹600", min: 300, max: 600 },
  { id: "600-1000", label: "₹600 – ₹1000", min: 600, max: 1000 },
  { id: "1000p", label: "₹1000+", min: 1000, max: Infinity },
];

const minPriceOf = (p: Product) => Math.min(...p.variants.map((v) => v.price));

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const auth = useAuth();
  const effectiveSlug = location.pathname === "/shop" ? "all" : slug;

  const { categories: categoriesList, products: allProductsList } = useCatalog();

  const cat = useMemo(() => {
    if (!effectiveSlug) return undefined;
    if (effectiveSlug === "all") return { id: "all", label: "All Products" };

    const foundParent = categoriesList.find((c) => c.id === effectiveSlug);
    if (foundParent) return foundParent;

    const foundSub = getSubcategoriesForCategory("all").find((s) => s.id === effectiveSlug);
    if (foundSub) return { id: foundSub.id, label: foundSub.label };

    return { id: effectiveSlug, label: effectiveSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) };
  }, [effectiveSlug, categoriesList]);

  const { stock } = useInventory();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [bands, setBands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSubcat, setSelectedSubcat] = useState<string>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridReady = useGridReady(`${slug ?? ""}-${currentPage}-${sortBy}`);

  useEffect(() => {
    setCurrentPage(1);
    setBands([]);
    setInStockOnly(false);
    setSelectedSubcat("all");
  }, [effectiveSlug]);

  const subcategories = useMemo(() => {
    if (!cat) return [];
    return getSubcategoriesForCategory(cat.id);
  }, [cat]);

  const filtered = useMemo(() => {
    if (!cat) return [];
    const visibleProducts = allProductsList.filter((p) => isCategoryVisibleToUser(p.category, auth));
    let base = cat.id === "all" ? [...visibleProducts] : visibleProducts.filter((p) => p.category === cat.id || p.subcategory === cat.id);

    if (selectedSubcat && selectedSubcat !== "all") {
      base = base.filter((p) => {
        if (p.subcategory === selectedSubcat) return true;
        const nameLower = p.name.toLowerCase();
        const idLower = p.id.toLowerCase();
        const localLower = (p.localName || "").toLowerCase();

        if (selectedSubcat === "almonds") return nameLower.includes("almond") || localLower.includes("badam") || idLower.includes("almond");
        if (selectedSubcat === "cashews") return nameLower.includes("cashew") || localLower.includes("kaju") || idLower.includes("cashew");
        if (selectedSubcat === "pistachios") return nameLower.includes("pista") || nameLower.includes("pistachio") || idLower.includes("pista");
        if (selectedSubcat === "walnuts") return nameLower.includes("walnut") || localLower.includes("akhrot") || idLower.includes("walnut");
        if (selectedSubcat === "dates") return nameLower.includes("date") || localLower.includes("khajur") || idLower.includes("date");
        if (selectedSubcat === "figs") return nameLower.includes("fig") || localLower.includes("anjeer") || idLower.includes("fig");
        if (selectedSubcat === "raisins") return nameLower.includes("raisin") || localLower.includes("kishmish") || idLower.includes("raisin");
        if (selectedSubcat === "berries") return nameLower.includes("berry") || nameLower.includes("blueberry") || nameLower.includes("blackberry") || nameLower.includes("plum");
        if (selectedSubcat === "chia-flax") return nameLower.includes("chia") || nameLower.includes("flax") || nameLower.includes("haleem");
        if (selectedSubcat === "sunflower-pumpkin") return nameLower.includes("sunflower") || nameLower.includes("pumpkin") || nameLower.includes("watermelon");
        if (selectedSubcat === "solar-fruits") return nameLower.includes("amla") || nameLower.includes("mango") || nameLower.includes("pineapple") || nameLower.includes("kiwi");
        if (selectedSubcat === "laddus") return nameLower.includes("laddu") || localLower.includes("laddu") || nameLower.includes("ball") || idLower.includes("laddu");
        if (selectedSubcat === "dry-fruit-sweets") return nameLower.includes("barfi") || nameLower.includes("katli") || nameLower.includes("halwa") || nameLower.includes("sweets") || idLower.includes("barfi") || idLower.includes("katli");

        return false;
      });
    }

    if (bands.length) {
      const active = priceBands.filter((b) => bands.includes(b.id));
      base = base.filter((p) => {
        const price = minPriceOf(p);
        return active.some((b) => price >= b.min && price <= b.max);
      });
    }

    if (inStockOnly) {
      base = base.filter((p) => p.variants.some((v) => !isOutOfStock(stock, v.id)));
    }

    return sortProductsWithStockAndComingSoonLast(base, stock, auth, sortBy);
  }, [cat, selectedSubcat, sortBy, bands, inStockOnly, stock, auth, allProductsList]);

  if (!cat) return <Navigate to="/" replace />;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilterCount = bands.length + (inStockOnly ? 1 : 0);

  const handlePage = (p: number) => {
    setCurrentPage(p);
    document.getElementById("category-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleBand = (id: string) => {
    setBands((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setBands([]);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const filterControls = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-2.5">Price</p>
        <div className="flex flex-wrap gap-2">
          {priceBands.map((b) => (
            <button
              key={b.id}
              onClick={() => toggleBand(b.id)}
              aria-pressed={bands.includes(b.id)}
              className={`text-[11px] font-body px-3 min-h-[38px] border transition-colors ${
                bands.includes(b.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-2.5">Availability</p>
        <button
          onClick={() => { setInStockOnly(!inStockOnly); setCurrentPage(1); }}
          aria-pressed={inStockOnly}
          className={`text-[11px] font-body px-3 min-h-[38px] border transition-colors ${
            inStockOnly
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-foreground/30"
          }`}
        >
          In stock only
        </button>
      </div>
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="self-start text-[11px] uppercase tracking-[0.15em] font-body text-accent hover:underline"
        >
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://houseofnuts.store/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://houseofnuts.store/shop"
      },
      ...(cat && cat.id !== "all"
        ? [
            {
              "@type": "ListItem",
              "position": 3,
              "name": cat.label,
              "item": `https://houseofnuts.store/category/${cat.id}`,
            },
          ]
        : [])
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": cat ? `${cat.label} Collection` : "House of Nuts Collection",
    "url": `https://houseofnuts.store${effectiveSlug === "all" ? "/shop" : `/category/${effectiveSlug}`}`,
    "numberOfItems": paginated.length,
    "itemListElement": paginated.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://houseofnuts.store/product/${item.id}`,
      "name": item.name
    }))
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={cat ? `${cat.label} Collection | Dry Fruit House Proddatur` : "Shop Premium Dry Fruits, Spices & Honey Proddatur"}
        description={`Explore our handpicked collection of ${cat?.label || 'dry fruits, organic spices & raw wild honey'} at House of Nuts Proddatur (Dry Fruit House). 100% natural, farm-fresh harvest.`}
        keywords={`${cat?.label?.toLowerCase() || 'dry fruits'}, ${cat?.label?.toLowerCase()} proddatur, buy ${cat?.label?.toLowerCase()} online, dryfruit house proddatur, dryfrit proddatur, organic spices proddatur, raw forest honey proddatur, dry fruit gift boxes proddatur, house of nuts`}
        canonicalUrl={effectiveSlug === "all" ? "/shop" : `/category/${effectiveSlug}`}
        jsonLd={[breadcrumbJsonLd, collectionJsonLd]}
      />
      <PromoBanner />
      <Header />
      <CategoryStrip />
      <CartDrawer />

      {/* Breadcrumb + title */}
      <section id="category-top" className="px-6 md:px-12 pt-6 md:pt-8 pb-4 max-w-[1600px] mx-auto w-full">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-body text-muted-foreground mb-3">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Crumb size={12} />
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <Crumb size={12} />
          <span className="text-foreground">{cat.label}</span>
        </nav>
        <div className="flex items-center gap-4 mb-2">
          <div className="h-[1px] w-12 bg-accent" />
          <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body">Category</p>
        </div>
        <h1 className="font-display text-3xl md:text-5xl tracking-tight">{cat.label}</h1>
        <p className="text-xs md:text-sm text-muted-foreground font-body mt-2">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {isCategoryComingSoon(cat.id, auth) && (
          <div className="mt-4 p-5 rounded-sm bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-body animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 grid place-items-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-base text-foreground">Launching Soon!</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider">Coming Soon</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Our artisanal {cat.label} collection (Protein Bars, Sprouted Nut Powders & Active Spreads) is currently in small-batch formulation. Pre-order notifications opening soon!
                </p>
              </div>
            </div>
          </div>
        )}

        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 mt-4 border-t border-border/40">
            <button
              onClick={() => { setSelectedSubcat("all"); setCurrentPage(1); }}
              className={`text-[11px] uppercase tracking-[0.08em] font-body font-semibold px-4 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                selectedSubcat === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-foreground/80 border-border hover:border-foreground/40 hover:bg-clay-light/40"
              }`}
            >
              {cat.id === "all" || cat.label.toLowerCase().includes("all") ? "All Products" : `All ${cat.label}`}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSelectedSubcat(sub.id); setCurrentPage(1); }}
                className={`text-[11px] uppercase tracking-[0.08em] font-body font-semibold px-4 py-1.5 rounded-full transition-all whitespace-nowrap border ${
                  selectedSubcat === sub.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background text-foreground/80 border-border hover:border-foreground/40 hover:bg-clay-light/40"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Customization Studio for Mixes and Gifting */}
      {(cat.id === "mixes" || cat.id === "trail-mixes" || cat.id === "gifting") && (
        <div className="mb-6">
          <BuildBox defaultTab={cat.id === "gifting" ? "gift-box" : "trail-mix"} />
        </div>
      )}

      <section className="bg-clay-light/50 px-6 md:px-12 py-6 md:py-8 border-t border-border">
        <div className="max-w-[1600px] mx-auto">
          {/* Desktop Filter & Sort Bar */}
          <div className="hidden md:flex flex-wrap items-center justify-between gap-4 p-4 bg-background border border-border/80 rounded-md mb-8 shadow-xs">
            <div className="flex flex-wrap items-center gap-6">
              {/* Price Filter Group */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body font-semibold whitespace-nowrap">Price:</span>
                <div className="flex flex-wrap gap-1.5">
                  {priceBands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBand(b.id)}
                      aria-pressed={bands.includes(b.id)}
                      className={`text-[11px] font-body px-3 py-1.5 border transition-all ${
                        bands.includes(b.id)
                          ? "bg-primary text-primary-foreground border-primary font-medium"
                          : "border-border hover:border-foreground/30 text-foreground/80 bg-background"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-4 w-[1px] bg-border hidden xl:block" />

              {/* Availability Filter Group */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body font-semibold whitespace-nowrap">Availability:</span>
                <button
                  onClick={() => { setInStockOnly(!inStockOnly); setCurrentPage(1); }}
                  aria-pressed={inStockOnly}
                  className={`text-[11px] font-body px-3 py-1.5 border transition-all ${
                    inStockOnly
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "border-border hover:border-foreground/30 text-foreground/80 bg-background"
                  }`}
                >
                  In stock only
                </button>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] uppercase tracking-[0.15em] font-body text-accent hover:underline font-medium"
                >
                  Clear filters ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2.5 ml-auto">
              <label htmlFor="sort-desktop" className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-body font-semibold whitespace-nowrap">Sort:</label>
              <select
                id="sort-desktop"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                className="text-[11px] uppercase tracking-[0.15em] px-3 py-1.5 border border-border bg-background hover:border-foreground/30 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className="md:hidden flex items-center justify-between gap-3 mb-6">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 border text-[11px] uppercase tracking-[0.15em] font-body font-medium transition-colors ${
                activeFilterCount > 0 ? "border-accent text-accent bg-accent/5" : "border-border bg-background"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-mobile" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-body font-semibold">Sort:</label>
              <select
                id="sort-mobile"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                className="text-[11px] uppercase tracking-[0.15em] px-3 py-2 border border-border bg-background hover:border-foreground/30 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile filter sheet */}
          {filtersOpen && (
            <div className="md:hidden fixed inset-0 z-[80]">
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-10 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-2xl">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <X size={22} />
                  </button>
                </div>
                {filterControls}
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full mt-6 bg-primary text-primary-foreground min-h-[48px] uppercase tracking-[0.15em] text-xs font-medium font-body"
                >
                  Show {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}

          {paginated.length === 0 ? (
            <div className="text-center py-20 font-body">
              <p className="text-muted-foreground mb-5">No products match these filters.</p>
              {activeFilterCount > 0 ? (
                <button onClick={clearFilters} className="bg-primary text-primary-foreground px-6 min-h-[44px] uppercase tracking-[0.15em] text-xs font-medium">
                  Clear filters
                </button>
              ) : (
                <Link to="/shop" className="bg-primary text-primary-foreground px-6 py-3 inline-block uppercase tracking-[0.15em] text-xs font-medium">
                  Browse all products
                </Link>
              )}
            </div>
          ) : (
            <div key={`${effectiveSlug}-${page}-${sortBy}`} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-300">
              {!gridReady
                ? <ProductCardSkeletonGrid count={Math.min(paginated.length || 8, 8)} />
                : paginated.map((p, i) => <ProductCard key={p.id} product={p} eagerImage={i < 4} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border flex-wrap">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 min-h-[44px] border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`w-11 h-11 flex items-center justify-center text-sm font-body font-medium border transition-all duration-200 ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 min-h-[44px] border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Category;
