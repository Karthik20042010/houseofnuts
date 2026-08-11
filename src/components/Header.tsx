import { ShoppingBag, Menu, X, Package, ChevronDown, User, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/data/products";
import { ROLE_BADGES } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isLoggedIn, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-50">
      <nav className="hidden md:flex gap-10 text-xs uppercase tracking-[0.15em] font-medium font-body items-center">
        <Link to="/shop" className="hover:text-accent transition-colors duration-300">Shop</Link>
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-accent transition-colors duration-300">
            Categories <ChevronDown size={12} />
          </button>
          <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-background border border-border shadow-lg min-w-[200px] py-2">
              {categories.filter((c) => c.id !== "all").map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="block px-4 py-2 text-xs uppercase tracking-[0.15em] hover:bg-clay-light hover:text-accent transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link to="/orders" className="hover:text-accent transition-colors duration-300">
          <span className="flex items-center gap-1.5"><Package size={14} /> My Orders</span>
        </Link>
        <Link to="/track" className="hover:text-accent transition-colors duration-300">Track</Link>
        {isHome ? (
          <button onClick={scrollToContact} className="hover:text-accent transition-colors duration-300">Wholesale</button>
        ) : (
          <Link to="/#contact" className="hover:text-accent transition-colors duration-300">Wholesale</Link>
        )}
      </nav>

      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Link to="/" className="font-display text-2xl md:text-4xl font-normal tracking-tight flex-1 text-center md:flex-none hover:text-accent transition-colors">
        House of Nuts
      </Link>

      <div className="flex items-center gap-4">
        <SearchBar />
        
        {/* Account / Admin Portal link */}
        <Link
          to={isLoggedIn ? "/admin" : "/account"}
          title={isLoggedIn ? `Portal (${role})` : "Account Profile"}
          className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-medium font-body hover:text-accent transition-colors"
        >
          {isLoggedIn ? <ShieldCheck size={18} className="text-accent" /> : <User size={18} />}
          <span className="hidden lg:inline">{isLoggedIn ? "Portal" : "Account"}</span>
          {isLoggedIn && (
            <Badge variant={ROLE_BADGES[role].variant} className="text-[9px] px-1 py-0 font-mono hidden xl:inline-block">
              {role}
            </Badge>
          )}
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium font-body hover:text-accent transition-colors duration-300"
        >
          <ShoppingBag size={20} />
          <span className="hidden md:inline">Basket</span>
          {totalItems > 0 && (
            <span className="bg-primary text-primary-foreground size-6 flex items-center justify-center rounded-full tabular-nums text-[11px]">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden max-h-[80vh] overflow-auto">
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Shop All</Link>
          <div className="border-l-2 border-accent pl-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Categories</span>
            {categories.filter((c) => c.id !== "all").map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm uppercase tracking-[0.15em] font-medium text-left"
              >
                {c.label}
              </Link>
            ))}
          </div>
          <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2 flex items-center gap-2">
            <Package size={16} /> My Orders
          </Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Track Order</Link>
          {isHome ? (
            <button onClick={scrollToContact} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Wholesale Enquiry</button>
          ) : (
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Wholesale Enquiry</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
