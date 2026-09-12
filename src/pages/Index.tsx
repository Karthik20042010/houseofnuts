import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/ProductCardSkeleton";
import { useGridReady } from "@/hooks/useGridReady";
import RecentlyViewed from "@/components/RecentlyViewed";
import WholesaleForm from "@/components/WholesaleForm";
import { products, categories } from "@/data/products";
import { ChevronLeft, ChevronRight, ArrowRight, Phone, MessageCircle, Instagram } from "lucide-react";
const heroImage = "/images/branding/cinematic-store-banner.jpg";
const festiveImage = "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=1440&h=800&fit=crop";
const grandOpeningImage = "/images/branding/grand-opening-banner.jpg";
const categoryImages: Record<string, string> = {
  nuts: "/images/reference-site/cats/nuts.jpg",
  "dry-fruits": "/images/reference-site/cats/dry-fruits.jpg",
  seeds: "/images/reference-site/cats/seeds.jpg",
  mixes: "/images/reference-site/cats/mixes.jpg",
};
import PromoBanner from "@/components/PromoBanner";
import CategoryStrip from "@/components/CategoryStrip";
import BuildBox from "@/components/BuildBox";
import NutNinjaGame from "@/components/NutNinjaGame";
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
  const [gameOpen, setGameOpen] = useState(false);
  const { viewedIds } = useRecentlyViewed();
  const gridReady = useGridReady(`${activeCategory}-${currentPage}-${sortBy}`);

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
      <CategoryStrip />
      <CartDrawer />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-linen">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative px-6 md:px-12 py-16 md:py-24 max-w-[1600px] mx-auto w-full grid md:grid-cols-12 gap-12 md:gap-8 items-center">
          <div className="md:col-span-5 flex flex-col gap-7 order-2 md:order-1 animate-fade-up">
            <p className="eyebrow">Premium Quality</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
              Earth's{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent italic font-light">richest</span>{" "}
              yield.
            </h1>
            <p className="text-lg leading-relaxed max-w-[42ch] text-muted-foreground font-light font-body">
              Sun-cured pistachios, wild honey from deep forests, and spices
              ground under heavy stone. We bring nature's finest directly to your
              table.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-earth"
              >
                Explore Collection
              </button>
              <button onClick={() => setGameOpen(true)} className="btn-warm">
                🎮 Play & Win 20% OFF
              </button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Free delivery</span>
              <span>·</span>
              <span>Fresh roasted</span>
              <span>·</span>
              <span>No preservatives</span>
            </div>
          </div>
          <div className="md:col-span-7 relative group order-1 md:order-2 animate-fade-in">
            <div className="bg-clay/70 backdrop-blur-sm p-4 md:p-6 pb-10 md:pb-14 rounded-t-[100px] md:rounded-t-[140px] rounded-b-3xl shadow-card">
              <img
                src={heroImage}
                alt="Premium dry fruits, nuts, spices and honey collection"
                className="w-full h-[40vh] md:h-[65vh] object-cover rounded-t-[90px] md:rounded-t-[130px] rounded-b-2xl shadow-card transition-transform duration-1000 group-hover:scale-[1.02] origin-bottom"
                width={1440}
                height={900}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
            <div className="absolute -bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur px-6 py-3 rounded-full border border-border shadow-soft whitespace-nowrap z-10">
              <span className="font-display italic text-muted-foreground mr-2">Fresh stock:</span>
              <span className="font-medium tracking-wide font-body">Kashmiri Walnuts & Saffron</span>
            </div>
          </div>
        </div>
      </section>


      {/* Value Propositions / Brand Pillars */}
      <section className="gradient-earth text-primary-foreground py-14 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 font-body">
          {[
            ["100% Natural", "No oils, no additives, no shortcuts. Pure farm origin."],
            ["Small-Batch Roasted", "Roasted fresh to order so every nut snaps with crunch."],
            ["Responsibly Sourced", "Direct partner farms across Kashmir, Iran & California."],
            ["Zero Preservatives", "Vacuum-sealed at peak freshness to lock in flavor."],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-5 transition-colors hover:border-accent/50 hover:bg-primary-foreground/10"
            >
              <h4 className="text-accent text-sm uppercase tracking-wider font-semibold mb-1.5">{title}</h4>
              <p className="text-xs text-primary-foreground/75 font-light leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Recently Viewed */}
      <RecentlyViewed viewedIds={viewedIds} />

      {/* Shop by Category */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-[1600px] mx-auto">
          <p className="eyebrow mb-3">Browse</p>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-4">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Shop by Category</h2>
            <Link to="/shop" className="group text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:text-accent transition-colors flex items-center gap-2">
              View all products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.filter((c) => c.id !== "all").map((c) => {
              const count = products.filter((p) => p.category === c.id).length;
              const sample = products.find((p) => p.category === c.id);
              const categoryImage = categoryImages[c.id] ?? sample?.image;
              return (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="group relative aspect-square bg-clay-light overflow-hidden rounded-2xl flex flex-col justify-end p-4 md:p-6 border border-border/60 hover:border-accent/60 card-lift shadow-soft"
                >
                  {categoryImage && (
                    <img
                      src={categoryImage}
                      alt={c.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={600}
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-transparent transition-opacity duration-500 group-hover:from-primary/90" />
                  <div className="relative">
                    <h3 className="font-display text-2xl md:text-3xl text-primary-foreground leading-tight">{c.label}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-body text-primary-foreground/80 mt-1">{count} item{count !== 1 ? "s" : ""}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>




      {/* Products */}
      <section id="products" className="gradient-linen px-4 sm:px-6 md:px-12 py-14 md:py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 border-b border-border/70 pb-6 md:pb-8 gap-5 md:gap-6">
            <div>
              <p className="eyebrow mb-3">Shop</p>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">Our Collection</h2>
              <p className="text-sm text-muted-foreground font-body mt-2">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full md:w-auto">
              {/* Sort */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="flex-1 sm:flex-none text-[11px] uppercase tracking-[0.15em] px-4 min-h-[44px] rounded-full border border-border bg-background hover:border-accent/60 transition-colors font-body font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category filters */}
              <div className="flex gap-2 overflow-x-auto sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.15em] px-4 min-h-[40px] rounded-full border transition-all duration-300 font-body font-medium ${
                      activeCategory === cat.id
                        ? "gradient-earth text-primary-foreground border-transparent shadow-soft"
                        : "border-border bg-background hover:border-accent/60 hover:text-accent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>



          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 transition-opacity duration-300">
            {!gridReady ? (
              <ProductCardSkeletonGrid count={Math.min(paginated.length || 8, 8)} />
            ) : (
              paginated.map((product, i) => (
                <ProductCard key={product.id} product={product} eagerImage={i < 2} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 md:mt-12 pt-8 border-t border-border/70 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="flex items-center gap-1.5 px-3 sm:px-4 min-h-[44px] rounded-full border border-border bg-background text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-accent/60 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    totalPages <= 5 ||
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center gap-1.5 sm:gap-2">
                    {idx > 0 && page - arr[idx - 1] > 1 && (
                      <span className="text-muted-foreground font-body text-sm px-0.5">…</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-body font-medium border transition-all duration-300 ${
                        page === currentPage
                          ? "gradient-warm text-accent-foreground border-transparent shadow-glow"
                          : "border-border bg-background hover:border-accent/60 hover:text-accent"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="flex items-center gap-1.5 px-3 sm:px-4 min-h-[44px] rounded-full border border-border bg-background text-[11px] uppercase tracking-[0.15em] font-body font-medium hover:border-accent/60 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>

          )}

        </div>
      </section>

      {/* Freshness story */}
      <section className="cv-auto bg-primary px-6 py-16 text-primary-foreground md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div className="overflow-hidden rounded-sm">
            <img
              src="/images/reference-site/promise-a.jpg"
              alt="A freshly roasted assortment of premium nuts and dry fruits"
              className="h-[300px] w-full object-cover md:h-[440px]"
              loading="lazy"
            />
          </div>
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">Farm to your table</p>
            <h2 className="max-w-[12ch] font-display text-4xl leading-[0.95] md:text-6xl">Freshness you can see, taste and trust.</h2>
            <p className="mt-6 max-w-xl font-body leading-relaxed text-primary-foreground/75">
              We choose whole ingredients for their crunch, colour and natural flavour, then pack them carefully so they arrive ready to share.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-primary-foreground/15 pt-7 sm:grid-cols-4">
              {["Whole ingredients", "Packed with care", "Small-batch quality", "Delivered fresh"].map((promise) => (
                <p key={promise} className="text-xs font-medium uppercase tracking-[0.12em] text-primary-foreground/90 font-body">
                  {promise}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grand Opening */}
      <section id="grand-opening" className="cv-auto relative px-6 md:px-12 py-20 bg-clay-light border-t border-border overflow-hidden">
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
                href="https://maps.app.goo.gl/yLEXVbZopiYoc6GfA"
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
                src={grandOpeningImage}
                alt="House of Nuts Grand Opening — 17 December 2025 at KK Street, Gandhi Road, Proddatur"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={900}
                height={1200}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Festive Banner */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <img
          src={festiveImage}
          alt="Festive assortment of premium nuts and dry fruits"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width={1600}
          height={900}
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

      {/* Interactive Custom Box Builder */}
      <BuildBox />

      {/* Gamified Play & Win Modal */}
      <NutNinjaGame isOpen={gameOpen} onClose={() => setGameOpen(false)} />

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
            <a
              href="https://www.instagram.com/houseofnuts_proddatur"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 border border-accent text-accent px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <Instagram size={16} />
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/60 py-12 px-6 border-t border-primary-foreground/10">
        <div className="max-w-[1600px] mx-auto grid md:grid-cols-4 gap-8 text-center md:text-left">
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
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-accent font-body font-medium mb-3">Follow Us</h4>
            <p className="text-xs font-body leading-relaxed">
              <a
                href="https://www.instagram.com/houseofnuts_proddatur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
              >
                <Instagram size={14} /> @houseofnuts_proddatur
              </a>
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
