/**
 * Placeholder card matching ProductCard's layout so grids never render as a
 * blank section while product data/images settle (most noticeable on mobile).
 */
const ProductCardSkeleton = () => (
  <div
    className="flex flex-col bg-card border border-border/50 rounded-2xl p-2.5 sm:p-3 shadow-soft animate-pulse"
    aria-hidden="true"
  >
    <div className="aspect-square rounded-xl bg-clay mb-3 sm:mb-4" />
    <div className="h-4 w-3/4 rounded bg-clay mb-2" />
    <div className="h-2.5 w-1/3 rounded bg-clay-light mb-3" />
    <div className="h-2.5 w-full rounded bg-clay-light mb-2" />
    <div className="h-2.5 w-2/3 rounded bg-clay-light mb-4" />
    <div className="flex gap-1.5 mb-4">
      <div className="h-7 w-12 rounded-full bg-clay-light" />
      <div className="h-7 w-12 rounded-full bg-clay-light" />
      <div className="h-7 w-12 rounded-full bg-clay-light" />
    </div>
    <div className="mt-auto pt-3 border-t border-border space-y-2">
      <div className="h-4 w-1/2 rounded bg-clay" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 rounded-full bg-clay-light" />
        <div className="h-10 rounded-full bg-clay" />
      </div>
    </div>
  </div>
);

export const ProductCardSkeletonGrid = ({ count = 8 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </>
);

export default ProductCardSkeleton;
