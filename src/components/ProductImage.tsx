import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
  sizes?: string;
}

/**
 * Image with a shimmer placeholder that fades out once the file decodes.
 * Prevents the blank/jumpy feel while product photos load.
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
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative w-full h-full aspect-square overflow-hidden ${wrapperClassName}`}>
      {!loaded && !failed && (
        <div className="absolute inset-0 bg-clay animate-pulse" aria-hidden="true" />
      )}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-clay-light">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body px-4 text-center">
            {alt}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          width={600}
          height={600}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "low"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
};

export default ProductImage;
