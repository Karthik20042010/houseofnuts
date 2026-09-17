import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeletonGrid } from "@/components/ProductCardSkeleton";
import { useGridReady } from "@/hooks/useGridReady";
import RecentlyViewed from "@/components/RecentlyViewed";
import WholesaleForm from "@/components/WholesaleForm";
import { useCatalog } from "@/lib/customCatalog";
import { ChevronLeft, ChevronRight, ArrowRight, Phone, MessageCircle, Instagram, Clock, ShieldCheck, Leaf, Flame, Globe2, CheckCircle2, Award, PackageCheck, Truck, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryComingSoon, isCategoryVisibleToUser, isPrivilegedUser } from "@/lib/accessControl";

import { useInventory } from "@/contexts/InventoryContext";
import { sortProductsWithStockAndComingSoonLast } from "@/lib/inventory";

const heroImage = "/images/branding/cinematic-store-banner.jpg";
const festiveImage = "/images/gifting/festive-nut-hamper-banner.png";
const grandOpeningImage = "/images/branding/grand-opening-banner.jpg";
const categoryImages: Record<string, string> = {
  nuts: "/images/nuts/almonds.jpg",
  "dry-fruits": "/images/dry-fruits/anjeer.jpg",
  chocolates: "/images/chocolates/lindt-lindor-red-main.jpeg",
  mixes: "/images/mixes/berry-mix.jpg",
  gifting: "/images/gifting/gift-box-classic.jpg",
  spices: "/images/spices/spices-hero.png",
  honey: "/images/honey/wild-honey-hero.png",
  seeds: "/images/seeds/pumpkin-seeds.jpg",
  "solar-dried": "/images/dry-fruits/dried-kiwi.jpg",
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
  const auth = useAuth();
  const { stock } = useInventory();
  const { products, categories } = useCatalog();
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [gameOpen, setGameOpen] = useState(false);
  const { viewedIds } = useRecentlyViewed();
  const gridReady = useGridReady(`${activeCategory}-${currentPage}-${sortBy}`);

  const isPrivileged = isPrivilegedUser(auth);
  const isHoneyComingSoon = isCategoryComingSoon("honey", auth);

  const filtered = useMemo(() => {
    const visibleProducts = products.filter((p) => isCategoryVisibleToUser(p.category, auth));
    const base =
      activeCategory === "all"
        ? [...visibleProducts]
        : visibleProducts.filter((p) => p.category === activeCategory || p.subcategory === activeCategory);

    return sortProductsWithStockAndComingSoonLast(base, stock, auth, sortBy);
  }, [activeCategory, sortBy, auth, stock, products]);

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

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "House of Nuts Featured Products",
    "url": "https://houseofnuts.store/",
    "numberOfItems": 6,
    "itemListElement": products.slice(0, 6).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://houseofnuts.store/product/${item.id}`,
      "name": item.name
    }))
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Premier Dry Fruit House, Spices, Wild Honey & Gift Boxes Proddatur"
        description="House of Nuts Proddatur (Dry Fruit House) — Shop 100% natural Mamra almonds (Badam), Iranian pistachios (Pista), jumbo cashews, organic spices, raw wild forest honey & luxury gift boxes online in Proddatur, AP."
        keywords="dryfruit house, dry fruit house proddatur, dryfrit proddatur, dryfruit proddatur, dry fruit store near me, dry fruit shop in proddatur, organic spices proddatur, raw forest honey proddatur, wild honey proddatur, dry fruit gift boxes proddatur, luxury hampers, badam, pista, kaju, anjeer, dates, House of Nuts Proddatur"
        canonicalUrl="/"
        jsonLd={homeJsonLd}
      />
      <PromoBanner />
      <Header />
      <CategoryStrip />
      <CartDrawer />

      {/* Hero — editorial bento */}
      <section className="px-4 sm:px-6 md:px-12 pt-6 pb-10 md:pt-10 md:pb-16">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[620px]">
          {/* Main tile */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl group min-h-[440px] shadow-card animate-fade-in">
            <img
              src={heroImage}
              alt="Premium dry fruits, nuts, spices and honey collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              width={1440}
              height={900}
              loading="eager"
              fetchpriority="high"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 md:p-12 text-primary-foreground max-w-2xl">
              <span className="w-fit mb-4 rounded-full bg-gold/95 text-earth px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] font-body">
                Premium Quality
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-tight mb-4">
                Nature's finest,{" "}
                <span className="italic text-gold">handpicked harvest.</span>
              </h1>
              <p className="text-base md:text-lg text-primary-foreground/90 font-light font-body mb-7 max-w-[46ch]">
                Sun-cured pistachios, wild forest honey and stone-ground spices — sourced
                direct from partner farms and packed fresh for your table.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() =>
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-full bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] font-body text-earth transition-colors hover:bg-background"
                >
                  Explore Collection
                </button>
                <button
                  onClick={() => setGameOpen(true)}
                  className="rounded-full border border-primary-foreground/40 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] font-body text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  Play & Win 20% Off
                </button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 pt-6 font-body text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                <span>Free delivery</span>
                <span>·</span>
                <span>Fresh roasted</span>
                <span>·</span>
                <span>No preservatives</span>
              </div>
            </div>
          </div>

          {/* Side tiles */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <Link
              to="/gifting"
              className="relative overflow-hidden rounded-3xl group min-h-[220px] shadow-soft"
            >
              <img
                src="/images/gifting/gift-hamper-luxury.jpg"
                alt="Festive gift hampers"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-earth/85 to-earth/10" />
              <div className="absolute inset-0 flex flex-col justify-end p-7 text-primary-foreground">
                <h2 className="font-display text-3xl leading-tight">Festive Gift Hampers</h2>
                <p className="text-xs text-primary-foreground/80 font-body mt-1">
                  Curated boxes, ready to gift.
                </p>
              </div>
            </Link>

            <Link
              to="/category/honey"
              className="relative overflow-hidden rounded-3xl text-gold p-7 flex flex-col justify-between min-h-[220px] shadow-soft group"
            >
              <img
                src="/images/honey/wild-honey-hero.png"
                alt="Wild Forest Honey and Artisanal Spices"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-earth/95 via-earth/70 to-earth/30" />
              <div className="relative z-10">
                {isHoneyComingSoon ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-body bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full backdrop-blur-xs font-semibold">
                    <Clock size={11} /> Coming Soon
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.2em] font-body border border-gold/30 px-2 py-1 rounded-full text-gold">
                    Small batch
                  </span>
                )}
                <h2 className="font-display text-3xl mt-5 leading-tight text-primary-foreground">
                  Wild Forest Honey<br />& Artisanal Spices
                </h2>
              </div>
              <span className="relative z-10 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-body font-medium text-gold">
                {isHoneyComingSoon ? "Preview Collection" : "Shop now"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>



      {/* Value Propositions / Brand Pillars */}
      <section className="bg-[#3B1A0E] relative overflow-hidden py-14 px-6 md:px-12 border-y border-amber-900/40">
        {/* Soft background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 pointer-events-none" />
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 font-body relative z-10">
          {[
            {
              title: "100% Natural",
              copy: "No oils, no additives, no shortcuts. Pure farm origin guaranteed.",
              icon: Leaf,
            },
            {
              title: "Small-Batch Roasted",
              copy: "Roasted fresh to order in small batches so every nut snaps with maximum crunch.",
              icon: Flame,
            },
            {
              title: "Responsibly Sourced",
              copy: "Direct partner farms across Kashmir, Iran & California for handpicked quality.",
              icon: Globe2,
            },
            {
              title: "Zero Preservatives",
              copy: "Vacuum-sealed at peak harvest freshness to lock in natural oil & flavor.",
              icon: ShieldCheck,
            },
          ].map(({ title, copy, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-amber-500/20 bg-amber-950/40 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-amber-900/50 hover:shadow-xl group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4 transition-transform group-hover:scale-110 group-hover:bg-amber-500/25">
                <Icon size={22} className="text-amber-300" />
              </div>
              <h4 className="text-[#FFF5EB] text-sm uppercase tracking-wider font-semibold mb-2 group-hover:text-amber-200 transition-colors">
                {title}
              </h4>
              <p className="text-xs text-[#E6D5C3] font-normal leading-relaxed">
                {copy}
              </p>
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
              <div className="flex gap-2 overflow-x-auto sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full border transition-all duration-200 font-body ${
                      activeCategory === cat.id
                        ? "bg-accent/10 text-foreground border-accent/60 font-medium shadow-xs"
                        : "border-border/70 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
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
      <section className="cv-auto bg-[#2D130B] relative overflow-hidden px-6 py-16 text-primary-foreground md:px-12 md:py-24 border-y border-amber-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-12 lg:items-center lg:gap-14 relative z-10">
          {/* Image side */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-3xl border border-amber-500/25 shadow-2xl group">
            <img
              src="/images/gifting/dry-fruits-thali.jpg"
              alt="A freshly roasted assortment of premium nuts and dry fruits on traditional brass thali"
              className="h-[320px] w-full object-cover md:h-[480px] rounded-3xl transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D130B]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#2D130B]/70 backdrop-blur-md border border-amber-500/30 flex items-center justify-between text-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Award size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider font-body text-[#FFF5EB]">Artisanal Harvest</h5>
                  <p className="text-[11px] text-amber-200/80 font-light">100% Pure & Organically Farm Sourced</p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.16em] font-body bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
                Direct Farm
              </span>
            </div>
          </div>

          {/* Text side */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="w-fit mb-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] font-body backdrop-blur-xs">
              Farm To Your Table
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-[#FFF8F0] mb-6">
              Freshness you can see,{" "}
              <span className="italic text-amber-300 font-light">taste and trust.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#E6D5C3] font-light font-body leading-relaxed mb-8 max-w-xl">
              We hand-select whole ingredients for their natural crunch, rich color, and pristine flavor — vacuum-sealing each batch to preserve farm-fresh purity until it reaches your doorstep.
            </p>

            {/* Promise Feature Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-amber-500/20 pt-8">
              {[
                { label: "Whole Ingredients", desc: "Unbroken, full-kernel selection", icon: Leaf },
                { label: "Packed With Care", desc: "Vacuum-sealed eco-friendly boxes", icon: PackageCheck },
                { label: "Small-Batch Quality", desc: "Fresh slow-roasting on demand", icon: Flame },
                { label: "Delivered Fresh", desc: "Express delivery across India & Proddatur", icon: Truck },
              ].map(({ label, desc, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/15 hover:border-amber-400/40 transition-colors">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-[#FFF5EB] font-body mb-0.5">{label}</h5>
                    <p className="text-[11px] text-[#D8C4B0] font-light font-body leading-tight">{desc}</p>
                  </div>
                </div>
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

      {/* Store Location & Interactive Google Maps */}
      <section id="location" className="py-20 px-6 md:px-12 bg-secondary/30 border-t border-border/60">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-body font-semibold uppercase tracking-widest">
              <MapPin size={14} /> Retail Store in Proddatur
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-foreground">
              Visit House of Nuts
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-sm md:text-base">
              Experience the finest selection of handpicked Mamra almonds, Iranian pistachios, jumbo cashews, organic spices, and raw forest honey directly at our physical store.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <h3 className="font-display text-lg text-foreground mb-1">Store Address</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  10-155/2, KK Street, Gandhi Road<br />
                  Proddatur, Andhra Pradesh — 516360
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
                <h3 className="font-display text-lg text-foreground mb-1">Opening Hours</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  Monday – Sunday<br />
                  <span className="font-semibold text-accent">9:00 AM – 9:30 PM</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://share.google/MXS8ulw5qZr3b2rEa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-earth flex items-center gap-2 shadow-soft hover:scale-[1.02] transition-transform"
              >
                <MapPin size={16} /> Open Google Maps Directions
              </a>
              <a
                href="tel:+919652526920"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border bg-card text-xs font-body font-semibold uppercase tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                <Phone size={14} className="text-accent" /> Call Store: +91 96525 26920
              </a>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-xl h-[380px] md:h-[440px]">
            <iframe
              title="House of Nuts Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3856.883713028247!2d78.5524!3d14.7526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb370b3b4f62083%3A0x6b77c5e21975e53e!2sProddatur%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale-[20%] hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border border-border text-[11px] font-body font-medium shadow-md">
              <a
                href="https://share.google/MXS8ulw5qZr3b2rEa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-accent hover:underline"
              >
                <MapPin size={13} /> View on Google Maps
              </a>
            </div>
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

      {/* SEO Keyword & Location Authority Section */}
      <section className="bg-background py-16 px-6 md:px-12 border-t border-border/80 text-foreground">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-accent text-xs font-body font-semibold uppercase tracking-[0.2em]">Proddatur Dry Fruit House</span>
            <h2 className="font-display text-2xl md:text-4xl text-foreground mt-2">
              House of Nuts — Best Dry Fruit Store, Spices &amp; Wild Honey in Proddatur
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-body mt-3 leading-relaxed">
              Looking for a trusted <strong>dry fruit house</strong> or <strong>dryfruit shop in Proddatur</strong>? House of Nuts brings you 100% natural, farm-fresh harvest dry fruits, stone-ground organic spices, raw wild forest honey, and handcrafted luxury gift hampers directly to your doorstep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-xs font-body leading-relaxed">
            <div className="p-5 rounded-2xl bg-card border border-border/70">
              <h3 className="font-display text-base text-foreground mb-2">Dry Fruits &amp; Nuts (Badam, Pista, Kaju)</h3>
              <p className="text-muted-foreground">
                Shop authentic Kashmiri &amp; Iranian Mamra Almonds (Badam), naturally opened Iranian Pistachios (Pista), Jumbo W180/W240 Cashews (Kaju), organic Anjeer (Figs), Akhrot (Walnuts), and Medjool Dates at direct farm rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70">
              <h3 className="font-display text-base text-foreground mb-2">Organic Spices Proddatur</h3>
              <p className="text-muted-foreground">
                Sourced from organic spice gardens — Grade-A Kashmiri Saffron (Kesar), aromatic Green Cardamom (Elaichi), Ceylon Cinnamon (Dalchini), Cloves (Laung), and Black Pepper. Pure, unadulterated &amp; stone-ground.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70">
              <h3 className="font-display text-base text-foreground mb-2">Raw Wild Forest Honey</h3>
              <p className="text-muted-foreground">
                100% unprocessed, unpasteurized raw forest wild honey collected from natural hives. Packed with enzymes, antioxidants, and pure floral aroma with zero added sugar or artificial preservatives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/70">
              <h3 className="font-display text-base text-foreground mb-2">Dry Fruit Gift Boxes &amp; Hampers</h3>
              <p className="text-muted-foreground">
                Customized luxury dry fruit gift packs for weddings, Diwali, corporate gifting, and family celebrations in Proddatur. Elegant packaging with custom box builder options and bulk delivery.
              </p>
            </div>
          </div>

          {/* Sub-Category & Sub-Sub Tag Link Index */}
          <div className="pt-6 border-t border-border/60">
            <h3 className="font-display text-sm uppercase tracking-[0.18em] text-accent mb-4 text-center">
              Popular Sub-Categories &amp; Sub-Tag Directory
            </h3>
            <div className="flex flex-wrap justify-center gap-2 text-[11px] font-body">
              {[
                { label: "Kashmiri Mamra Almonds", path: "/category/almonds" },
                { label: "Iranian Mamra Badam", path: "/category/almonds" },
                { label: "California Almonds", path: "/category/almonds" },
                { label: "Jumbo W180 Cashews", path: "/category/cashews" },
                { label: "W240 Kaju Whole", path: "/category/cashews" },
                { label: "Roasted Salted Kaju", path: "/category/cashews" },
                { label: "Iranian Jumbo Pista", path: "/category/pistachios" },
                { label: "Salted Roasted Pistachios", path: "/category/pistachios" },
                { label: "Chilean Akhrot Kernels", path: "/category/walnuts" },
                { label: "Organic Turkish Anjeer", path: "/category/figs" },
                { label: "Medjool & Ajwa Dates", path: "/category/dates" },
                { label: "Golden Long Kishmish", path: "/category/raisins" },
                { label: "Kashmiri Mongra Saffron", path: "/category/saffron" },
                { label: "Green Elaichi (Cardamom)", path: "/category/cardamom" },
                { label: "Organic Whole Spices", path: "/category/whole-spices" },
                { label: "Raw Forest Wild Honey", path: "/category/raw-honey" },
                { label: "Royal Wooden Gift Boxes", path: "/category/wooden-boxes" },
                { label: "Festive Diwali Hampers", path: "/category/festive-hampers" },
                { label: "Wedding Dry Fruit Boxes", path: "/gifting" },
                { label: "Proddatur Dry Fruit House", path: "/shop" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="px-3 py-1.5 rounded-full bg-card border border-border/70 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
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
            <a
              href="https://share.google/MXS8ulw5qZr3b2rEa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-accent text-xs hover:underline font-medium"
            >
              <MapPin size={13} /> View on Google Maps
            </a>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-accent font-body font-medium mb-3">Contact</h4>
            <p className="text-xs font-body leading-relaxed space-y-1">
              <a href="tel:+919652526920" className="block hover:text-accent transition-colors">+91 96525 26920</a>
              <a href="mailto:houseofnutsproddatur@gmail.com" className="block text-accent hover:underline font-medium">houseofnutsproddatur@gmail.com</a>
              <a href="https://wa.me/919652526920" target="_blank" rel="noopener noreferrer" className="block hover:text-accent transition-colors">WhatsApp Support</a>
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
        <div className="mt-8 pt-6 border-t border-primary-foreground/10 flex flex-wrap justify-center items-center gap-3 text-[11px] font-body tracking-wide text-primary-foreground/60">
          <Link to="/T&C" className="hover:text-accent transition-colors">Terms & Conditions</Link>
          <span>·</span>
          <Link to="/privacy_policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/refund_policy" className="hover:text-accent transition-colors">Refund Policy</Link>
          <span>·</span>
          <Link to="/return_policy" className="hover:text-accent transition-colors">Return Policy</Link>
          <span>·</span>
          <Link to="/shipping_policy" className="hover:text-accent transition-colors">Shipping Policy</Link>
        </div>
        <p className="text-[11px] font-body tracking-wide text-center mt-4">
          © {new Date().getFullYear()} House of Nuts. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
