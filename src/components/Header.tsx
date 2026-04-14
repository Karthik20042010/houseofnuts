import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="hidden md:flex gap-10 text-xs uppercase tracking-[0.15em] font-medium font-body">
        <button onClick={scrollToProducts} className="hover:text-accent transition-colors duration-300">
          Shop
        </button>
        <button onClick={scrollToContact} className="hover:text-accent transition-colors duration-300">
          Wholesale
        </button>
      </nav>

      <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="font-display text-2xl md:text-4xl font-normal tracking-tight flex-1 text-center md:flex-none">
        House of Nuts
      </div>

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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-4 md:hidden">
          <button onClick={scrollToProducts} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">
            Shop
          </button>
          <button onClick={scrollToContact} className="text-sm uppercase tracking-[0.15em] font-medium text-left py-2">
            Wholesale Enquiry
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
