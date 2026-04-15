import { useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { Phone, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-nuts.jpg";
import PromoBanner from "@/components/PromoBanner";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header />
      <CartDrawer />

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-[1600px] mx-auto w-full grid md:grid-cols-12 gap-12 md:gap-8 items-center">
        <div className="md:col-span-5 flex flex-col gap-8 order-2 md:order-1">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent" />
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium font-body">
              Premium Quality
            </p>
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Earth's{" "}
            <span className="text-accent italic font-light">richest</span>{" "}
            yield.
          </h1>
          <p className="text-lg leading-relaxed max-w-[42ch] text-muted-foreground font-light font-body">
            Sun-cured pistachios, wild honey from deep forests, and spices
            ground under heavy stone. We bring nature's finest directly to your
            table.
          </p>
          <div className="pt-2">
            <button
              onClick={() =>
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-primary text-primary-foreground px-10 py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-500 font-body"
            >
              Explore Our Collection
            </button>
          </div>
        </div>
        <div className="md:col-span-7 bg-clay p-4 md:p-6 pb-10 md:pb-14 rounded-t-[100px] md:rounded-t-[140px] rounded-b-lg relative group order-1 md:order-2">
          <img
            src={heroImage}
            alt="Premium dry fruits, nuts, spices and honey collection"
            className="w-full h-[40vh] md:h-[65vh] object-cover rounded-t-[90px] md:rounded-t-[130px] rounded-b shadow-[0_24px_48px_-12px_rgba(59,38,29,0.25)] transition-transform duration-1000 group-hover:scale-[1.01] origin-bottom"
            width={1440}
            height={900}
          />
          <div className="absolute -bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 bg-background px-6 py-3 border border-border shadow-lg whitespace-nowrap z-10">
            <span className="font-display italic text-muted-foreground mr-2">Fresh stock:</span>
            <span className="font-medium tracking-wide font-body">Kashmiri Walnuts & Saffron</span>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-clay-light/50 px-6 md:px-12 py-20 border-t border-border">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-border pb-8 gap-6">
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Our Collection</h2>

            {/* Category filters */}
            <div className="flex gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-[11px] uppercase tracking-[0.15em] px-4 py-2 border transition-colors duration-200 font-body font-medium ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale / Contact */}
      <section id="contact" className="bg-primary text-primary-foreground py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6 text-accent">Wholesale Enquiry</h2>
          <p className="font-body font-light text-primary-foreground/70 max-w-lg mx-auto mb-10 leading-relaxed">
            We are distributors as well. For bulk orders and wholesale pricing,
            reach out to us directly. We offer competitive rates for businesses,
            events, and corporate gifting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919652526920"
              className="flex items-center justify-center gap-3 border border-primary-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
            >
              <Phone size={16} />
              Call Us
            </a>
            <a
              href="https://wa.me/919652526920?text=Hi, I'm interested in wholesale pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-primary-foreground hover:text-primary transition-all duration-300"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/50 py-8 px-6 text-center border-t border-primary-foreground/10">
        <p className="text-xs font-body tracking-wide">
          © {new Date().getFullYear()} House of Nuts. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
