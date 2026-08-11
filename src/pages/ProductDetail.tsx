import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, ShoppingBag, Star, Truck, Shield, Leaf } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ReviewsSection from "@/components/ReviewsSection";
import { getAverageRating } from "@/lib/reviews";
import { getProductImageSrc } from "@/lib/productImages";
import ProductImage from "@/components/ProductImage";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addViewed } = useRecentlyViewed();

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (product) addViewed(product.id);
  }, [product?.id]);

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

  const variant = product.variants[selectedVariant];
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const { avg: avgRating, count: reviewCount } = getAverageRating(product.id);

  return (
    <div className="min-h-screen">
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
          <div className="bg-clay-light p-6 md:p-10 aspect-square relative overflow-hidden flex items-center justify-center md:sticky md:top-28 md:self-start">
            <ProductImage src={getProductImageSrc(product)} alt={product.name} eager className="w-full h-full object-cover" />
            {product.badge && (
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-2 m-6 text-[10px] uppercase tracking-[0.2em] font-medium z-20 font-body">
                {product.badge}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body mb-2 capitalize">
                {product.category.replace("-", " ")}
              </p>
              <h1 className="font-display text-4xl md:text-5xl mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-accent text-accent" : "text-border"} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-body">{avgRating.toFixed(1)} ({reviewCount} reviews)</span>
              </div>
              <p className="text-muted-foreground font-body leading-relaxed text-lg">{product.description}</p>
            </div>

            {/* Price */}
            <div className="font-display text-4xl">₹{variant.price}</div>

            {/* Variants */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body mb-3">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    className={`text-sm px-5 py-3 border transition-colors duration-200 font-body tracking-wide ${
                      i === selectedVariant
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {v.size} — ₹{v.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-clay-light transition-colors font-body">−</button>
                <span className="px-4 py-3 tabular-nums font-body min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-clay-light transition-colors font-body">+</button>
              </div>
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(product, variant);
                }}
                className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body"
              >
                <ShoppingBag size={16} />
                Add to Basket — ₹{variant.price * quantity}
              </button>
            </div>

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

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-20">
            <h2 className="font-display text-3xl mb-8 border-b border-border pb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="contents">
                  <ProductCard product={p} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/50 py-8 px-6 text-center border-t border-primary-foreground/10">
        <p className="text-xs font-body tracking-wide">© {new Date().getFullYear()} House of Nuts. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProductDetail;
