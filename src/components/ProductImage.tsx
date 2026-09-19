import { useState, useEffect } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
  sizes?: string;
}

const FALLBACK_IMAGE = "/images/branding/house-of-nuts-logo-hd.png";

/**
 * Image with a shimmer placeholder that fades out once the file decodes.
 * Automatically falls back to high-res brand logo if original image URL fails to load.
 */
const ProductImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  eager = false,
  sizes,
}: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
    setLoaded(false);
  }, [src]);

  return (
    <div className={`relative w-full h-full aspect-square overflow-hidden bg-muted/30 ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-clay animate-pulse" aria-hidden="true" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        sizes={sizes}
        width={600}
        height={600}
        loading={eager ? "eager" : "lazy"}
        fetchpriority={eager ? "high" : "low"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (imgSrc !== FALLBACK_IMAGE) {
            setImgSrc(FALLBACK_IMAGE);
          }
          setLoaded(true);
        }}
        className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default ProductImage;
