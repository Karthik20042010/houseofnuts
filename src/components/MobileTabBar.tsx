import { Home, Store, Search, Package, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

/**
 * Mobile-only bottom tab bar: thumb-reachable navigation with 44px+ tap targets.
 */
const MobileTabBar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin")) return null;

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const base =
    "flex flex-col items-center justify-center gap-1 min-h-[56px] flex-1 text-[10px] uppercase tracking-[0.12em] font-body font-medium transition-colors duration-200";

  const openSearch = () => {
    window.dispatchEvent(new Event("hon:open-search"));
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="flex items-stretch">
        <Link to="/" className={`${base} ${isActive("/") ? "text-accent" : "text-muted-foreground"}`}>
          <Home size={19} />
          Home
        </Link>
        <Link to="/shop" className={`${base} ${isActive("/shop") || isActive("/category") ? "text-accent" : "text-muted-foreground"}`}>
          <Store size={19} />
          Shop
        </Link>
        <button onClick={openSearch} className={`${base} text-muted-foreground`} aria-label="Search products">
          <Search size={19} />
          Search
        </button>
        <Link to="/orders" className={`${base} ${isActive("/orders") || isActive("/track") ? "text-accent" : "text-muted-foreground"}`}>
          <Package size={19} />
          Orders
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className={`${base} text-muted-foreground relative`}
          aria-label={`Open basket, ${totalItems} items`}
        >
          <span className="relative">
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-accent text-accent-foreground min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full text-[9px] tabular-nums">
                {totalItems}
              </span>
            )}
          </span>
          Basket
        </button>
      </div>
    </nav>
  );
};

export default MobileTabBar;
