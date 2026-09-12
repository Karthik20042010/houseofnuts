import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryComingSoon } from "@/lib/accessControl";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import DeliveryEstimate from "@/components/DeliveryEstimate";
import { ArrowLeft, ShoppingBag, Star, Truck, Shield, Leaf, Heart, Share2, Zap, Check, Clock, Sparkles } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ReviewsSection from "@/components/ReviewsSection";
import { getAverageRating } from "@/lib/reviews";
import { getProductImageSrc } from "@/lib/productImages";
import ProductImage from "@/components/ProductImage";
import { toast } from "sonner";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const auth = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addViewed } = useRecentlyViewed();


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
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Buy 100% pure premium ${product.name} online from House of Nuts Proddatur. Fresh farm harvest.`,
    "image": [product.image.startsWith("http") ? product.image : `https://houseofnuts.in${product.image}`],
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "House of Nuts"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://houseofnuts.in/product/${product.id}`,
      "priceCurrency": "INR",
      "price": variant ? variant.price : product.price,
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "House of Nuts Proddatur"
      }
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`Buy ${product.name} Online`}
        description={`Shop premium quality ${product.name} (${variant?.weight || '100% Natural'}) at House of Nuts Proddatur. Best prices, fresh harvest, fast delivery.`}
        keywords={`${product.name.toLowerCase()}, buy ${product.name.toLowerCase()} online, ${product.name.toLowerCase()} proddatur, house of nuts, dry fruits proddatur`}
        canonicalUrl={`/product/${product.id}`}
        ogImage={product.image.startsWith("http") ? product.image : `https://houseofnuts.in${product.image}`}
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
          {/* Image */}
          <div className="gradient-linen aspect-square relative overflow-hidden rounded-2xl shine">
            <ProductImage
              src={getProductImageSrc(product.id, product.image)}
              alt={product.name}
              eager
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover rounded-2xl"
            />
            {isComingSoon ? (
              <div className="absolute top-4 left-4 bg-amber-600/90 text-amber-50 px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold z-20 shadow-soft font-body rounded-full flex items-center gap-1.5">
                <Clock size={13} /> Coming Soon
              </div>
            ) : product.badge ? (
              <div className="absolute top-4 left-4 gradient-warm text-accent-foreground px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-glow font-body rounded-full">
                {product.badge}
              </div>
            ) : null}
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

        {/* Nutritional Information & Specifications */}
        <section className="mb-16 bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-soft">
          <h3 className="font-display text-2xl md:text-3xl mb-4">Nutritional Highlights & Storage</h3>
          <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6 font-light">
            Approximate nutritional value per <strong className="text-foreground font-medium">100 grams</strong> of {product.name}.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-clay-light/50 border border-border/60 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Energy</p>
              <p className="font-display text-2xl text-accent mt-1">
                {product.category === "dry-fruits" ? "285 kcal" : product.category === "honey" ? "304 kcal" : "575 kcal"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-clay-light/50 border border-border/60 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Protein</p>
              <p className="font-display text-2xl text-foreground mt-1">
                {product.category === "dry-fruits" ? "3.5g" : product.category === "seeds" ? "24g" : product.category === "honey" ? "0.3g" : "21g"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-clay-light/50 border border-border/60 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Dietary Fiber</p>
              <p className="font-display text-2xl text-foreground mt-1">
                {product.category === "dry-fruits" ? "7.5g" : product.category === "seeds" ? "18g" : product.category === "honey" ? "0g" : "12.5g"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-clay-light/50 border border-border/60 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Healthy Fats</p>
              <p className="font-display text-2xl text-foreground mt-1">
                {product.category === "dry-fruits" ? "0.5g" : product.category === "honey" ? "0g" : "49g"}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-5 text-xs text-muted-foreground font-body space-y-1">
            <p><strong>Storage Instructions:</strong> Store in a cool, dry place. Once opened, transfer to an airtight glass container to preserve peak crunch & flavor.</p>
            <p><strong>Shelf Life:</strong> Best within 6 months of packing.</p>
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
