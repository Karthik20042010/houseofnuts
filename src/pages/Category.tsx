import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as Crumb, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/ProductCardSkeleton";
import { useGridReady } from "@/hooks/useGridReady";
import PromoBanner from "@/components/PromoBanner";
import { categories, products, Product } from "@/data/products";
import { useInventory } from "@/contexts/InventoryContext";
import { isOutOfStock } from "@/lib/inventory";

import CategoryStrip from "@/components/CategoryStrip";

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
  const effectiveSlug = location.pathname === "/shop" ? "all" : slug;
  const cat = categories.find((c) => c.id === effectiveSlug);
  const { stock } = useInventory();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [bands, setBands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridReady = useGridReady(`${slug ?? ""}-${currentPage}-${sortBy}`);

  useEffect(() => {
    setCurrentPage(1);
    setBands([]);
    setInStockOnly(false);
  }, [effectiveSlug]);

  const filtered = useMemo(() => {
    if (!cat) return [];
    let base = cat.id === "all" ? [...products] : products.filter((p) => p.category === cat.id);

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

    switch (sortBy) {
      case "price-asc": return base.sort((a, b) => minPriceOf(a) - minPriceOf(b));
      case "price-desc": return base.sort((a, b) => minPriceOf(b) - minPriceOf(a));
      case "name-asc": return base.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc": return base.sort((a, b) => b.name.localeCompare(a.name));
      default: return base;
    }
  }, [cat, sortBy, bands, inStockOnly, stock]);

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

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <CategoryStrip />
      <CartDrawer />

      {/* Breadcrumb + title */}
      <section id="category-top" className="px-6 md:px-12 pt-10 md:pt-14 pb-6 max-w-[1600px] mx-auto w-full">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-body text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Crumb size={12} />
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <Crumb size={12} />
          <span className="text-foreground">{cat.label}</span>
        </nav>
        <div className="flex items-center gap-4 mb-3">
          <div className="h-[1px] w-12 bg-accent" />
          <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body">Category</p>
        </div>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight">{cat.label}</h1>
        <p className="text-sm text-muted-foreground font-body mt-3">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Category chips */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto w-full mb-8 flex gap-3 overflow-x-auto md:flex-wrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={c.id === "all" ? "/shop" : `/category/${c.id}`}
            className={`text-[11px] uppercase tracking-[0.15em] px-4 min-h-[40px] flex items-center whitespace-nowrap border transition-colors duration-200 font-body font-medium ${
              c.id === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <section className="bg-clay-light/50 px-6 md:px-12 py-10 md:py-14 border-t border-border">
        <div className="max-w-[1600px] mx-auto">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`md:hidden flex items-center gap-2 px-4 min-h-[44px] border text-[11px] uppercase tracking-[0.15em] font-body font-medium transition-colors ${
                activeFilterCount > 0 ? "border-accent text-accent" : "border-border"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
            <div className="hidden md:block" />
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="sort" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium">Sort:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                className="text-[11px] uppercase tracking-[0.15em] px-3 min-h-[44px] border border-border bg-background hover:border-foreground/30 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Desktop filters */}
          <div className="hidden md:block mb-10 pb-8 border-b border-border">{filterControls}</div>

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
