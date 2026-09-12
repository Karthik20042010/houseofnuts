import { Link } from "react-router-dom";
import { Building2, Gift, Heart, PackageCheck, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const giftingProducts = products.filter((product) => product.category === "gifting");

const occasions = [
  { icon: Building2, title: "Corporate gifting", description: "Bulk boxes for clients and teams, with custom notes and straightforward invoicing." },
  { icon: Sparkles, title: "Festive celebrations", description: "Thoughtful dry-fruit hampers for Diwali, celebrations and family gatherings." },
  { icon: Heart, title: "Weddings & events", description: "Premium favours and welcome gifts that are easy to send straight to every guest." },
];

const Gifting = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <CartDrawer />

    <main>
      <section className="grid min-h-[520px] bg-primary text-primary-foreground lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-20">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">Gifts that get remembered</p>
          <h1 className="max-w-[11ch] font-display text-5xl leading-[0.92] md:text-7xl">Dry fruit gifts, packed with care.</h1>
          <p className="mt-7 max-w-xl leading-relaxed text-primary-foreground/75 font-body">
            Choose a polished hamper for any occasion. Every box is assembled with premium nuts and dry fruits, ready to send directly to the recipient.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#gift-boxes" className="bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent-foreground font-body">Explore gift boxes</a>
            <a href="#bulk-enquiry" className="border border-primary-foreground/30 px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground font-body">Bulk enquiry</a>
          </div>
        </div>
        <img src="/images/gifting/gift-hamper-luxury.jpg" alt="A premium dry fruit gifting assortment" className="h-full min-h-[360px] w-full object-cover" />
      </section>

      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">One gift, many occasions</p>
          <div className="grid gap-5 md:grid-cols-3">
            {occasions.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border border-border bg-card p-6">
                <Icon size={24} className="mb-8 text-accent" />
                <h2 className="font-display text-2xl">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-body">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gift-boxes" className="bg-clay-light/50 px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">Ready to send</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Gift boxes & hampers</h2>
            </div>
            <Link to="/shop" className="text-xs font-medium uppercase tracking-[0.15em] hover:text-accent font-body">Shop all products →</Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {giftingProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section id="bulk-enquiry" className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-8 border border-border bg-card p-7 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <div className="mb-5 flex size-11 items-center justify-center bg-accent/10 text-accent"><PackageCheck size={22} /></div>
            <h2 className="font-display text-3xl md:text-4xl">Planning for a group?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground font-body">For corporate orders, wedding favours or event hampers, tell us your quantity, budget and delivery date. We’ll help you choose a memorable box.</p>
          </div>
          <a href="https://wa.me/919652526920?text=Hi%2C%20I%27m%20interested%20in%20bulk%20gifting." target="_blank" rel="noreferrer" className="bg-primary px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground font-body hover:bg-accent">Start a WhatsApp enquiry</a>
        </div>
      </section>
    </main>
  </div>
);

export default Gifting;
