import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { products, categories } from "@/data/products";
import { Phone, MessageCircle, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import heroAsset from "@/assets/assortment-bowl.jpg.asset.json";
import grandOpeningAsset from "@/assets/grand-opening.jpg.asset.json";
import festiveAsset from "@/assets/festive-triptych.jpg.asset.json";
const heroImage = heroAsset.url;
import PromoBanner from "@/components/PromoBanner";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const ITEMS_PER_PAGE = 8;

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const { viewedIds } = useRecentlyViewed();

  const filtered = useMemo(() => {
    const base =
      activeCategory === "all"
        ? [...products]
        : products.filter((p) => p.category === activeCategory);

    const getMinPrice = (p: typeof products[0]) =>
      Math.min(...p.variants.map((v) => v.price));

    switch (sortBy) {
      case "price-asc":
        return base.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      case "price-desc":
        return base.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      case "name-asc":
        return base.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return base.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return base;
    }
  }, [activeCategory, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <CartDrawer />

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1600px] mx-auto w-full grid md:grid-cols-12 gap-12 md:gap-8 items-center">
        <div className="md:col-span-5 flex flex-col gap-8 order-2 md:order-1">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent" />
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body">
              Premium Quality
            </p>
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Earth's{" "}
            <span className="text-accent italic font-light">richest</span>{" "}
            yield.
          </h1>
          <p className="text-lg leading-relaxed max-w-[42ch] text-muted-foreground font-light font-body">
            Sun-cured pistachios, wild honey from deep forests, and spices
            ground under heavy stone. We bring nature's finest directly to your
            table.
          </p>
          <div className="pt-2">
            <button
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-primary text-primary-foreground px-10 py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-500 font-body"
            >
              Explore Our Collection
            </button>
          </div>
        </div>
        <div className="md:col-span-7 bg-clay p-4 md:p-6 pb-10 md:pb-14 rounded-t-[100px] md:rounded-t-[140px] rounded-b-lg relative group order-1 md:order-2">
          <img
            src={heroImage}
            alt="Premium dry fruits, nuts, spices and honey collection"
            className="w-full h-[40vh] md:h-[65vh] object-cover rounded-t-[90px] md:rounded-t-[130px] rounded-b shadow-[0_24px_48px_-12px_rgba(59,38,29,0.25)] transition-transform duration-1000 group-hover:scale-[1.01] origin-bottom"
            width={1440}
            height={900}
          />
          <div className="absolute -bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-background px-6 py-3 border border-border shadow-lg whitespace-nowrap z-10">
            <span className="font-display italic text-muted-foreground mr-2">Fresh stock:</span>
            <span className="font-medium tracking-wide font-body">Kashmiri Walnuts & Saffron</span>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed viewedIds={viewedIds} />

      {/* Products */}
      <section id="products" className="bg-clay-light/50 px-6 md:px-12 py-20 border-t border-border">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-8 gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight">Our Collection</h2>
              <p className="text-sm text-muted-foreground font-body mt-2">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="text-[11px] uppercase tracking-[0.15em] px-3 py-2 border border-border bg-background hover:border-foreground/30 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filters */}
              <div className="flex gap-3 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`text-[11px] uppercase tracking-[0.15em] px-4 py-2 border transition-colors duration-200 font-body font-medium ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 transition-opacity duration-300">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-foreground/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Grand Opening */}
      <section id="grand-opening" className="relative px-6 md:px-12 py-20 bg-clay-light border-t border-border overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-accent" />
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body">
                Visit Our Store
              </p>
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95] tracking-tight mb-6">
              Grand <span className="text-accent italic font-light">Opening</span>
            </h2>
            <div className="flex items-baseline gap-4 mb-6 font-body">
              <span className="font-display text-6xl md:text-7xl text-accent">17</span>
              <div className="flex flex-col">
                <span className="uppercase tracking-[0.2em] text-sm font-medium">Dec 2025</span>
                <span className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Wednesday · 9 AM</span>
              </div>
            </div>
            <p className="font-body text-muted-foreground leading-relaxed mb-2">
              10-155/2, KK Street, Gandhi Road
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Proddatur — 516360
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://maps.google.com/?q=10-155/2+KK+Street+Gandhi+Road+Proddatur+516360"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body text-center"
              >
                Get Directions
              </a>
              <a
                href="tel:+919652526920"
                className="border border-foreground/20 px-8 py-4 uppercase tracking-[0.15em] text-xs font-medium hover:border-accent hover:text-accent transition-colors duration-300 font-body text-center"
              >
                +91 96525 26920
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="aspect-[3/4] max-w-md mx-auto bg-background shadow-[0_24px_48px_-12px_rgba(59,38,29,0.25)] overflow-hidden">
              <img
                src={grandOpeningAsset.url}
                alt="House of Nuts Grand Opening — 17 December 2025 at KK Street, Gandhi Road, Proddatur"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Festive Banner */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <img
          src={festiveAsset.url}
          alt="Festive assortment of premium nuts and dry fruits"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        <div className="relative h-full flex items-center px-6 md:px-16 max-w-[1600px] mx-auto">
          <div className="max-w-xl text-primary-foreground">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body mb-4">
              Gifting Season
            </p>
            <h3 className="font-display text-3xl md:text-5xl leading-tight mb-4">
              Hampers crafted with <span className="italic text-accent">care</span>.
            </h3>
            <p className="font-body font-light text-primary-foreground/80 leading-relaxed">
              Custom festive boxes for Diwali, weddings & corporate gifting. WhatsApp us to design yours.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-primary text-primary-foreground py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6 text-accent">Wholesale Enquiry</h2>
          <p className="font-body font-light text-primary-foreground/70 max-w-lg mx-auto mb-10 leading-relaxed">
            We are distributors as well. For bulk orders and wholesale pricing,
            reach out to us directly. We offer competitive rates for businesses,
            events, and corporate gifting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919652526920"
              className="flex items-center justify-center gap-3 border border-primary-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
            >
              <Phone size={16} />
              Call Us
            </a>
            <a
              href="https://wa.me/919652526920?text=Hi, I'm interested in wholesale pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-primary-foreground hover:text-primary transition-all duration-300"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/60 py-12 px-6 border-t border-primary-foreground/10">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h4 className="font-display text-xl text-primary-foreground mb-3">House of Nuts</h4>
            <p className="text-xs font-body leading-relaxed">
              Premium nuts, dry fruits, spices & honey — sourced with care, delivered fresh.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-accent font-body font-medium mb-3">Visit</h4>
            <p className="text-xs font-body leading-relaxed">
              10-155/2, KK Street<br />
              Gandhi Road, Proddatur<br />
              Andhra Pradesh — 516360
            </p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-accent font-body font-medium mb-3">Contact</h4>
            <p className="text-xs font-body leading-relaxed">
              <a href="tel:+919652526920" className="hover:text-accent transition-colors">+91 96525 26920</a><br />
              <a href="https://wa.me/919652526920" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">WhatsApp Support</a>
            </p>
          </div>
        </div>
        <p className="text-[11px] font-body tracking-wide text-center mt-10 pt-6 border-t border-primary-foreground/10">
          © {new Date().getFullYear()} House of Nuts. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
