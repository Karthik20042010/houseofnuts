import { ShoppingBag, Menu, X, Package, ChevronDown, User, ShieldCheck, Heart, LogOut, UserCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { isCategoryVisibleToUser } from "@/lib/accessControl";
import { useWishlist } from "@/contexts/WishlistContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { useCatalog } from "@/lib/customCatalog";
import { ROLE_BADGES, ROLE_LABELS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";

const Header = () => {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const auth = useAuth();
  const { categories } = useCatalog();
  const { isLoggedIn, role, googleUser, isGoogleAuthenticated, logout } = auth;
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const isAuthenticated = isLoggedIn || isGoogleAuthenticated;
  const displayName = googleUser ? googleUser.name : isLoggedIn ? ROLE_LABELS[role] : "Customer";
  const displayEmail = googleUser ? googleUser.email : isLoggedIn ? `${role}@houseofnuts.com` : "";

  const handleAccountClick = () => {
    const isStaffOrAdmin = role === "admin" || role === "staff" || role === "developer";
    if (isStaffOrAdmin) {
      navigate("/admin");
    } else {
      navigate("/account");
    }
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-8 py-3.5 border-b border-border/60 sticky top-0 bg-background/85 backdrop-blur-xl z-50 shadow-xs transition-all duration-300">
      {/* Login Modal Popup */}
      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <nav className="hidden md:flex gap-8 text-xs uppercase tracking-[0.15em] font-medium font-body items-center">
        <Link to="/shop" className="hover:text-accent transition-colors duration-300">Shop</Link>
        <Link to="/gifting" className="hover:text-accent transition-colors duration-300">Gifting</Link>
        <Link to="/journal" className="hover:text-accent transition-colors duration-300">Journal</Link>
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-accent transition-colors duration-300">
            Categories <ChevronDown size={12} />
          </button>
          <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="bg-background border border-border shadow-lg min-w-[200px] py-2">
              {categories.filter((c) => c.id !== "all" && isCategoryVisibleToUser(c.id, auth)).map((c) => (
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
          <span className="flex items-center gap-1.5"><Package size={14} /> Orders</span>
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

        {/* Wishlist Link */}
        <Link
          to="/wishlist"
          title="My Wishlist"
          className="relative text-muted-foreground hover:text-accent transition-colors p-1"
        >
          <Heart size={20} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground size-4 flex items-center justify-center rounded-full text-[10px] font-bold font-mono">
              {wishlistCount}
            </span>
          )}
        </Link>
        
        {/* Flipkart-Style Login Button & Account Dropdown */}
        {isAuthenticated ? (
          <div className="relative group">
            <button
              onClick={handleAccountClick}
              className="flex items-center gap-2 text-xs font-body hover:text-accent transition-colors py-1 cursor-pointer"
            >
              <div className="size-7 rounded-full bg-accent/10 text-accent grid place-items-center font-bold text-xs shrink-0 overflow-hidden border border-accent/20">
                {googleUser?.picture ? (
                  <img src={googleUser.picture} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden lg:inline font-medium max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={12} className="text-muted-foreground group-hover:rotate-180 transition-transform" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[220px]">
              <div className="bg-background border border-border shadow-xl rounded-sm py-2 font-body text-xs space-y-1">
                <div className="px-4 py-2 border-b border-border">
                  <p className="font-semibold font-display text-sm text-foreground truncate">{displayName}</p>
                  {displayEmail && <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>}
                </div>

                <Link to="/account" className="flex items-center gap-2.5 px-4 py-2 hover:bg-clay-light hover:text-accent transition-colors">
                  <User size={14} /> My Profile
                </Link>

                <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 hover:bg-clay-light hover:text-accent transition-colors">
                  <Package size={14} /> My Orders
                </Link>

                <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2 hover:bg-clay-light hover:text-accent transition-colors">
                  <Heart size={14} /> My Wishlist ({wishlistCount})
                </Link>

                {isLoggedIn && (
                  <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-accent font-medium hover:bg-clay-light transition-colors">
                    <ShieldCheck size={14} /> Role Portal ({role})
                  </Link>
                )}

                <div className="border-t border-border pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-primary text-primary-foreground hover:bg-accent transition-colors px-4 py-2 text-xs font-medium uppercase tracking-wider font-body rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <User size={14} /> Login
          </Link>
        )}

        {/* Basket Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium font-body hover:text-accent transition-colors duration-300 cursor-pointer"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden max-h-[80vh] overflow-auto shadow-xl z-50">
          {!isAuthenticated ? (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-primary text-primary-foreground py-2.5 text-xs font-semibold uppercase tracking-wider font-body rounded flex items-center justify-center gap-2"
            >
              <User size={16} /> Sign In / Register
            </Link>
          ) : (
            <div className="p-3 bg-clay-light rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-foreground">{displayName}</p>
                {displayEmail && <p className="text-[10px] text-muted-foreground">{displayEmail}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-destructive hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Shop All</Link>
          <Link to="/gifting" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Gifting</Link>
          <Link to="/journal" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Journal</Link>
          <div className="border-l-2 border-accent pl-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Categories</span>
            {categories.filter((c) => c.id !== "all" && isCategoryVisibleToUser(c.id, auth)).map((c) => (
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
          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2 flex items-center gap-2">
            <Heart size={16} /> My Wishlist ({wishlistCount})
          </Link>
          <Link to="/track" onClick={() => setMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">Track Order</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
