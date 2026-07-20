import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { products } from "@/data/products";
import { Link } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hover:text-accent transition-colors duration-300"
        aria-label="Search products"
      >
        <Search size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-[90vw] max-w-md bg-background border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nuts, spices, honey..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground font-body"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {query.length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 font-body">
                  No products found for "{query}"
                </p>
              ) : (
                results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-clay-light transition-colors duration-200 border-b border-border/50 last:border-0"
                  >
                    <img
                      src={getProductImageSrc(product)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        From ₹{product.variants[0].price}
                      </p>
                    </div>
                    {product.badge && (
                      <span className="text-[9px] uppercase tracking-[0.15em] bg-accent text-accent-foreground px-2 py-0.5 font-body font-medium">
                        {product.badge}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
