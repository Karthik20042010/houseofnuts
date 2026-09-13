import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { useCatalog } from "@/lib/customCatalog";
import { Link, useNavigate } from "react-router-dom";
import { getProductImageSrc } from "@/lib/productImages";

const RECENT_KEY = "hon-recent-searches";

const loadRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : [];
  } catch {
    return [];
  }
};

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { products, categories } = useCatalog();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, products]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Global triggers: mobile tab bar button + Cmd/Ctrl+K
  useEffect(() => {
    const openSearch = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("hon:open-search", openSearch);
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("hon:open-search", openSearch);
      window.removeEventListener("keydown", keys);
    };
  }, []);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const go = (productId: string) => {
    remember(query.trim());
    setOpen(false);
    setQuery("");
    navigate(`/product/${productId}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active].id);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="hover:text-accent transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Search products"
        aria-expanded={open}
      >
        <Search size={20} />
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-[72px] md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-[420px] bg-background border border-border shadow-xl z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search nuts, spices, honey..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground font-body py-1"
            />
            {query ? (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X size={16} />
              </button>
            ) : (
              <span className="hidden md:inline text-[10px] text-muted-foreground font-body border border-border px-1.5 py-0.5">
                ⌘K
              </span>
            )}
          </div>

          {query.trim().length < 2 ? (
            <div className="p-4 space-y-4">
              {recent.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-2 flex items-center gap-1.5">
                    <Clock size={11} /> Recent
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => setQuery(r)}
                        className="text-xs font-body px-3 py-1.5 border border-border hover:border-foreground/30 transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-2">Browse</p>
                <div className="flex flex-wrap gap-2">
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.id}`}
                      onClick={() => setOpen(false)}
                      className="text-xs font-body px-3 py-1.5 border border-border hover:border-accent hover:text-accent transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-10 px-6 font-body">
                  <p className="text-sm text-muted-foreground mb-4">No products match "{query}"</p>
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-accent hover:gap-3 transition-all"
                  >
                    Browse all products <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                results.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => go(product.id)}
                    onMouseEnter={() => setActive(i)}
                    className={`w-full text-left flex items-center gap-4 px-4 py-3 transition-colors duration-150 border-b border-border/50 last:border-0 ${
                      i === active ? "bg-clay-light" : ""
                    }`}
                  >
                    <img
                      src={getProductImageSrc(product)}
                      alt={product.name}
                      loading="lazy"
                      className="w-12 h-12 object-cover rounded-sm bg-clay"
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
                  </button>
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
