import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const articles = [
  ["Almond benefits & everyday ways to enjoy them", "Nutritious snacking", "/images/reference-site/journal/badam-almond-benefits.jpg"],
  ["How to store dry fruits and nuts for longer freshness", "Storage guide", "/images/reference-site/journal/how-to-store-dry-fruits-fresh.jpg"],
  ["A practical guide to choosing dry fruits online", "Buying guide", "/images/reference-site/journal/best-dry-fruits-to-buy-online-india.jpg"],
  ["High-protein dry fruits for your daily snack bowl", "Nutrition", "/images/reference-site/journal/high-protein-dry-fruits.jpg"],
  ["Kaju katli: a simple festive recipe", "Recipe", "/images/reference-site/journal/kaju-katli-recipe.jpg"],
  ["Gurbandi, Mamra or California almonds?", "Buying guide", "/images/reference-site/journal/types-of-almonds-gurbandi-mamra-california.jpg"],
] as const;

const Journal = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <CartDrawer />
    <main>
      <section className="border-b border-border px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">Beyond the bowl</p>
          <h1 className="mt-4 max-w-[12ch] font-display text-5xl leading-[0.92] md:text-7xl">Ideas for better snacking.</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">Recipes, storage advice and simple product guides to help you enjoy every handful. Health information is general and not medical advice.</p>
        </div>
      </section>
      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(([title, category, image]) => (
            <article key={title} className="group overflow-hidden border border-border bg-card">
              <img src={image} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="p-6">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent font-body">{category}</p>
                <h2 className="mt-3 font-display text-2xl leading-tight">{title}</h2>
                <Link to="/shop" className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.14em] hover:text-accent font-body">Shop the ingredients →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  </div>
);

export default Journal;
