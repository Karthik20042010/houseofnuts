import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCatalog } from "@/lib/customCatalog";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryComingSoon } from "@/lib/accessControl";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import { ArrowLeft, ShoppingBag, Star, Truck, Shield, Leaf, Heart, Share2, Zap, Check, Clock, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, MapPin, Award, CheckCircle2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ReviewsSection from "@/components/ReviewsSection";
import { getAverageRating } from "@/lib/reviews";
import { getProductImageSrc, getProductGallery } from "@/lib/productImages";
import { getProductSpecification } from "@/lib/productDetails";
import ProductImage from "@/components/ProductImage";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const auth = useAuth();
  const { products } = useCatalog();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addViewed } = useRecentlyViewed();

  // Touch Swipe Gesture State for Mobile Carousel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (product) addViewed(product.id);
  }, [product, addViewed]);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6">
          <p className="text-muted-foreground font-body text-lg">Product not found</p>
          <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isComingSoon = isCategoryComingSoon(product.category, auth);
  const variant = product.variants[selectedVariant];
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const { avg: avgRating, count: reviewCount } = getAverageRating(product.id);
  const wishlisted = isInWishlist(product.id);
  const specs = getProductSpecification(product.id, product.category, product.name);

  const gallery = getProductGallery(product);
  const activeImageSrc = gallery[activeImageIndex] || getProductImageSrc(product);

  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && gallery.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % gallery.length);
    } else if (isRightSwipe && gallery.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
  };

  const handleAdd = () => {
    if (isComingSoon) return;
    for (let i = 0; i < quantity; i++) addToCart(product, variant);
  };

  const handleBuyNow = () => {
    if (isComingSoon) return;
    handleAdd();
    navigate("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `${product.name} — ₹${variant.price} at House of Nuts`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — share it with anyone");
    } catch {
      /* user cancelled the share sheet */
    }
  };
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Buy 100% pure premium ${product.name} online from House of Nuts Proddatur. Fresh farm harvest.`,
    "image": gallery.map((img) => (img.startsWith("http") ? img : `https://houseofnuts.store${img}`)),
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "House of Nuts"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://houseofnuts.store/product/${product.id}`,
      "priceCurrency": "INR",
      "price": variant ? variant.price : product.price,
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "House of Nuts Proddatur"
      }
    }
  };

  if (reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": reviewCount,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`Buy ${product.name} Online`}
        description={`Shop premium quality ${product.name} (${variant?.weight || '100% Natural'}) at House of Nuts Proddatur. Best prices, fresh harvest, fast delivery.`}
        keywords={`${product.name.toLowerCase()}, buy ${product.name.toLowerCase()} online, ${product.name.toLowerCase()} proddatur, house of nuts, dry fruits proddatur`}
        canonicalUrl={`/product/${product.id}`}
        ogImage={activeImageSrc.startsWith("http") ? activeImageSrc : `https://houseofnuts.store${activeImageSrc}`}
        ogType="product"
        jsonLd={productJsonLd}
      />
      <Header />
      <CartDrawer />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize">{product.category.replace("-", " ")}</span>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-20">
          {/* Image & Multi-Image Gallery Interactive Swipe Carousel */}
          <div className="space-y-4 font-body">
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="gradient-linen aspect-square relative overflow-hidden rounded-2xl shine border border-border/60 group select-none touch-pan-y cursor-grab active:cursor-grabbing"
            >
              {/* Sliding Viewport */}
              <div
                className="w-full h-full flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
              >
                {gallery.map((imgSrc, i) => (
                  <div key={i} className="w-full h-full shrink-0 flex-none relative">
                    <ProductImage
                      src={imgSrc}
                      alt={`${product.name} photo ${i + 1}`}
                      eager={i === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                ))}
              </div>

              {/* Badges */}
              {isComingSoon ? (
                <div className="absolute top-4 left-4 bg-amber-600/90 text-amber-50 px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold z-20 shadow-soft rounded-full flex items-center gap-1.5">
                  <Clock size={13} /> Coming Soon
                </div>
              ) : product.badge ? (
                <div className="absolute top-4 left-4 gradient-warm text-accent-foreground px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-glow rounded-full z-20">
                  {product.badge}
                </div>
              ) : null}

              {/* Previous / Next Arrows (Flipkart / Amazon style) */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/90 hover:bg-background text-foreground border border-border/80 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % gallery.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-background/90 hover:bg-background text-foreground border border-border/80 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Flipkart Dots Pagination Bar */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`rounded-full transition-all cursor-pointer ${
                        activeImageIndex === i
                          ? "w-5 h-2 bg-accent shadow-xs"
                          : "size-2 bg-background/70 hover:bg-background/90"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`size-16 rounded-xl border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-accent ring-2 ring-accent/30 scale-105"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-accent font-body">
                {product.localName || product.category.replace("-", " ")}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl mt-1 leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="flex" aria-label={`Rated ${avgRating.toFixed(1)} out of 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(avgRating) ? "fill-accent text-accent" : "text-border"} />
                  ))}
                </div>
                <span className="text-sm font-medium font-body">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground font-body">({reviewCount} reviews)</span>
              </div>
            </div>

            {isComingSoon && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Coming Soon for Retail Customers</h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-body mt-0.5">
                    This artisanal product is currently available only for early staff & admin testing. Public ordering opens soon!
                  </p>
                </div>
              </div>
            )}

            <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-display text-4xl">₹{variant.price}</span>
              {variant.mrp && variant.mrp > variant.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through font-body">₹{variant.mrp}</span>
                  <span className="text-xs font-semibold font-body bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-xs uppercase tracking-wider">
                    Save ₹{variant.mrp - variant.price} ({Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off)
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body mb-3">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    disabled={isComingSoon}
                    onClick={() => setSelectedVariant(i)}
                    className={`text-sm px-5 py-3 border transition-colors duration-200 font-body tracking-wide ${
                      i === selectedVariant
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-foreground/30"
                    } ${isComingSoon ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                  >
                    {v.size} — ₹{v.price}
                  </button>
                ))}
              </div>
            </div>


            {/* Quantity & Add to Cart */}
            {isComingSoon ? (
              <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-2">
                <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm flex items-center justify-center gap-1.5 font-body">
                  <Clock size={16} /> Coming Soon for Retail Customers
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-body max-w-md mx-auto">
                  Public customer access for this category will be launched shortly. Logged-in admin and staff accounts retain full access.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 min-h-[48px] hover:bg-clay-light transition-colors font-body">−</button>
                    <span className="px-4 min-h-[48px] flex items-center justify-center tabular-nums font-body min-w-[3rem] text-center">{quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="px-4 min-h-[48px] hover:bg-clay-light transition-colors font-body">+</button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground min-h-[52px] uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body active:scale-[0.98]"
                  >
                    <ShoppingBag size={16} />
                    Add to Basket — ₹{variant.price * quantity}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground min-h-[48px] uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-primary hover:text-primary-foreground transition-colors active:scale-[0.98]"
                  >
                    <Zap size={15} /> Buy Now
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    aria-pressed={wishlisted}
                    className={`min-h-[48px] px-4 border flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-body transition-colors ${
                      wishlisted ? "border-accent text-accent bg-accent/10" : "border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {wishlisted ? <Check size={15} /> : <Heart size={15} />}
                    <span className="hidden sm:inline">{wishlisted ? "Saved" : "Save"}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share this product"
                    className="min-h-[48px] px-4 border border-border hover:border-accent hover:text-accent transition-colors flex items-center"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </>
            )}

            {/* Delivery estimate by PIN code */}
            <DeliveryEstimate />




            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck size={20} className="text-accent" />
                <span className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield size={20} className="text-accent" />
                <span className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Leaf size={20} className="text-accent" />
                <span className="text-[11px] text-muted-foreground font-body uppercase tracking-wider">100% Natural</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rich Product Specifications, Origin, Nutrition & Health Benefits */}
        <section className="mb-16 bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-soft space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-accent" size={20} />
              <h3 className="font-display text-2xl md:text-3xl">Product Specifications & Provenance</h3>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed font-light">
              Authentic single-origin harvest details, quality grading, and certified nutritional values per <strong className="text-foreground font-medium">100 grams</strong> of {product.name}.
            </p>
          </div>

          {/* Provenance & Grade Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {specs.grade && (
              <div className="p-4 rounded-xl bg-clay-light/40 border border-border/60">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold flex items-center gap-1">
                  <Award size={12} className="text-accent" /> Grade / Variety
                </p>
                <p className="font-body text-xs font-bold text-foreground mt-1">{specs.grade}</p>
              </div>
            )}

            {specs.origin && (
              <div className="p-4 rounded-xl bg-clay-light/40 border border-border/60">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-accent" /> Origin
                </p>
                <p className="font-body text-xs font-bold text-foreground mt-1">{specs.origin}</p>
              </div>
            )}

            {specs.processing && (
              <div className="p-4 rounded-xl bg-clay-light/40 border border-border/60">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} className="text-accent" /> Processing
                </p>
                <p className="font-body text-xs font-bold text-foreground mt-1">{specs.processing}</p>
              </div>
            )}

            {specs.shelfLife && (
              <div className="p-4 rounded-xl bg-clay-light/40 border border-border/60">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold flex items-center gap-1">
                  <Clock size={12} className="text-accent" /> Shelf Life
                </p>
                <p className="font-body text-xs font-bold text-foreground mt-1">{specs.shelfLife}</p>
              </div>
            )}
          </div>

          {/* Nutritional Values Grid */}
          <div>
            <h4 className="font-display text-lg mb-3 text-foreground">Nutritional Values (per 100g)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold">Energy</p>
                <p className="font-display text-xl text-accent mt-0.5">{specs.nutritionalPer100g.energy}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-clay-light/50 border border-border/60 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold">Protein</p>
                <p className="font-display text-xl text-foreground mt-0.5">{specs.nutritionalPer100g.protein}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-clay-light/50 border border-border/60 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold">Healthy Fats</p>
                <p className="font-display text-xl text-foreground mt-0.5">{specs.nutritionalPer100g.healthyFats}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-clay-light/50 border border-border/60 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold">Dietary Fiber</p>
                <p className="font-display text-xl text-foreground mt-0.5">{specs.nutritionalPer100g.fiber}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-clay-light/50 border border-border/60 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-semibold">Carbohydrates</p>
                <p className="font-display text-xl text-foreground mt-0.5">{specs.nutritionalPer100g.carbs}</p>
              </div>
            </div>
          </div>

          {/* Key Health Benefits */}
          {specs.healthBenefits && specs.healthBenefits.length > 0 && (
            <div className="border-t border-border pt-5">
              <h4 className="font-display text-lg mb-3 text-foreground flex items-center gap-1.5">
                <Sparkles size={16} className="text-accent" /> Key Health & Wellness Benefits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {specs.healthBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-body text-foreground/90 bg-clay-light/30 p-2.5 rounded-lg border border-border/40">
                    <CheckCircle2 size={15} className="text-accent shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage & Flavor Profile */}
          <div className="border-t border-border pt-5 text-xs text-muted-foreground font-body space-y-2">
            {specs.flavorProfile && (
              <p><strong className="text-foreground">Flavor Profile:</strong> {specs.flavorProfile}</p>
            )}
            {specs.storage && (
              <p><strong className="text-foreground">Storage Instructions:</strong> {specs.storage}</p>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-20">
            <h2 className="font-display text-3xl mb-8 border-b border-border pb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile add-to-basket bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-[55] bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-body">{variant.size}</p>
          <p className="font-display text-xl leading-none">₹{variant.price * quantity}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground min-h-[48px] uppercase tracking-[0.15em] text-xs font-medium font-body active:scale-[0.98] transition-transform"
        >
          <ShoppingBag size={15} /> Add to Basket
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/50 py-8 px-6 pb-24 md:pb-8 text-center border-t border-primary-foreground/10">
        <p className="text-xs font-body tracking-wide">© {new Date().getFullYear()} House of Nuts. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProductDetail;
