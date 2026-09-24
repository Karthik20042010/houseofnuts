import { useState, useEffect, useMemo } from "react";
import { getItemFallbackChain } from "@/lib/productImages";

interface ProductImageProps {
  id?: string;
  category?: string;
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
  sizes?: string;
}

/**
 * Image with a shimmer placeholder.
 * Automatically rotates through item-specific and category-specific fallback candidate images
 * if the primary image URL fails to load.
 */
const ProductImage = ({
  id,
  category,
  src,
  alt,
  className = "",
  wrapperClassName = "",
  eager = false,
  sizes,
}: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [chainIndex, setChainIndex] = useState(0);

  const fallbackChain = useMemo(() => {
    return getItemFallbackChain({ id, name: alt, image: src, category });
  }, [id, alt, src, category]);

  useEffect(() => {
    setChainIndex(0);
    setLoaded(false);
  }, [src, fallbackChain]);

  const currentSrc = fallbackChain[chainIndex] || src || "/images/nuts/walnuts.jpg";

  return (
    <div className={`relative w-full h-full aspect-square overflow-hidden bg-muted/20 ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-clay animate-pulse" aria-hidden="true" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        sizes={sizes}
        width={600}
        height={600}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (chainIndex + 1 < fallbackChain.length) {
            setChainIndex((prev) => prev + 1);
          } else {
            setLoaded(true);
          }
        }}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default ProductImage;
