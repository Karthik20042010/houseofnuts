import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as Crumb } from "lucide-react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import { categories, products } from "@/data/products";

const ITEMS_PER_PAGE = 8;

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const effectiveSlug = location.pathname === "/shop" ? "all" : slug;
  const cat = categories.find((c) => c.id === effectiveSlug);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!cat) return [];
    const base =
      cat.id === "all" ? [...products] : products.filter((p) => p.category === cat.id);
    const minPrice = (p: typeof products[0]) => Math.min(...p.variants.map((v) => v.price));
    switch (sortBy) {
      case "price-asc": return base.sort((a, b) => minPrice(a) - minPrice(b));
      case "price-desc": return base.sort((a, b) => minPrice(b) - minPrice(a));
      case "name-asc": return base.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc": return base.sort((a, b) => b.name.localeCompare(a.name));
      default: return base;
    }
  }, [cat, sortBy]);

  if (!cat) return <Navigate to="/" replace />;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePage = (p: number) => {
    setCurrentPage(p);
    document.getElementById("category-top")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
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
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto w-full mb-8 flex gap-3 flex-wrap">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={c.id === "all" ? "/shop" : `/category/${c.id}`}
            className={`text-[11px] uppercase tracking-[0.15em] px-4 py-2 border transition-colors duration-200 font-body font-medium ${
              c.id === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <section className="bg-clay-light/50 px-6 md:px-12 py-14 border-t border-border">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-end mb-8">
            <div className="flex items-center gap-2">
              <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                className="text-[11px] uppercase tracking-[0.15em] px-3 py-2 border border-border bg-background hover:border-foreground/30 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-24 font-body text-muted-foreground">
              No products in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border">
              <button
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePage(page)}
                  className={`w-10 h-10 flex items-center justify-center text-sm font-body font-medium border transition-all duration-200 ${
                    page === currentPage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
