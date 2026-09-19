import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GUIDES_AND_RECIPES, GuideArticle, LinkedProduct } from "@/data/guidesData";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { toast } from "sonner";

interface GuidesAndRecipesProps {
  maxItems?: number;
  showSearchAndFilters?: boolean;
}

export const GuidesAndRecipes: React.FC<GuidesAndRecipesProps> = ({
  maxItems,
  showSearchAndFilters = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const categories = [
    "All",
    "Recipes",
    "Buying Guides",
    "Almonds & Nuts",
    "Spices & Saffron",
    "Honey & Wellness",
    "Gift Hampers & Festive"
  ];

  const filteredArticles = GUIDES_AND_RECIPES.filter((art) => {
    const matchesCategory =
      activeCategory === "All"
        ? true
        : activeCategory === "Recipes"
        ? art.type === "Recipe"
        : activeCategory === "Buying Guides"
        ? art.type === "Buying Guide"
        : art.category === activeCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const displayedArticles = maxItems ? filteredArticles.slice(0, maxItems) : filteredArticles;

  const handleAddToCart = (item: LinkedProduct) => {
    const fullProduct = products.find((p) => p.id === item.id);
    if (fullProduct) {
      const defaultVariant = fullProduct.variants[0];
      addToCart(fullProduct, defaultVariant);
      toast.success(`Added ${fullProduct.name} to cart`);
    } else {
      navigate(`/product/${item.id}`);
    }
  };

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-background via-card/40 to-background border-t border-border/50">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="inline-block rounded-full bg-accent/15 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] font-body text-accent mb-3">
              Culinary Journal & Guides
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight text-foreground">
              SEO Recipe & Buying Guides
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground font-body max-w-2xl">
              Learn authentic festive recipes, dry fruit buying secrets, and health benefits of 100% natural Mamra almonds, Kashmiri saffron, & raw forest honey.
            </p>
          </div>

          {maxItems && (
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent hover:text-accent-foreground transition-colors font-body self-start md:self-auto"
            >
              Explore All Guides ({GUIDES_AND_RECIPES.length}) →
            </Link>
          )}
        </div>

        {/* Filters and Search Bar */}
        {showSearchAndFilters && (
          <div className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium font-body transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[240px] sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search recipes, benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-border bg-card text-xs font-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <svg
                  className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedArticles.map((art) => (
            <article
              key={art.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft hover:shadow-card transition-all duration-300"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ${
                      art.type === "Recipe" ? "bg-amber-600/90" : "bg-emerald-700/90"
                    }`}
                  >
                    {art.type}
                  </span>
                  <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-medium text-white/90">
                    {art.readTime}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-accent font-body mb-2">
                    <span>{art.category}</span>
                    <span>{art.publishedDate}</span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl leading-tight text-foreground group-hover:text-accent transition-colors mb-3">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground font-body line-clamp-3 leading-relaxed mb-4">
                    {art.summary}
                  </p>
                </div>

                <div>
                  {/* Linked Products Tags */}
                  <div className="pt-4 border-t border-border/60 flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground self-center font-body">
                      Featured Ingredients:
                    </span>
                    {art.linkedProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[11px] font-medium text-accent hover:bg-accent hover:text-white transition-colors font-body"
                      >
                        🏷️ {p.name}
                      </Link>
                    ))}
                  </div>

                  {/* Read Article Button */}
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="w-full text-center rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors font-body"
                  >
                    Read Full {art.type} & Details →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {displayedArticles.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl">
            <p className="text-base text-muted-foreground font-body">
              No recipes or buying guides found matching your filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="mt-4 rounded-full bg-accent px-6 py-2 text-xs font-semibold uppercase text-accent-foreground font-body"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
};

interface ModalProps {
  article: GuideArticle;
  onClose: () => void;
  onAddToCart: (item: LinkedProduct) => void;
}

const ArticleReaderModal: React.FC<ModalProps> = ({ article, onClose, onAddToCart }) => {
  const navigate = useNavigate();

  // Generate dynamic Schema.org JSON-LD object for Google Structured Data
  const jsonLdSchema =
    article.type === "Recipe" && article.recipeData
      ? {
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: article.title,
          image: [article.image],
          author: {
            "@type": "Organization",
            name: article.author
          },
          datePublished: article.publishedDate,
          description: article.summary,
          prepTime: "PT10M",
          cookTime: "PT15M",
          totalTime: "PT25M",
          recipeYield: article.recipeData.yield,
          recipeCategory: article.category,
          recipeIngredient: article.recipeData.ingredients,
          recipeInstructions: article.recipeData.steps.map((step, idx) => ({
            "@type": "HowToStep",
            text: step,
            position: idx + 1
          }))
        }
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          image: [article.image],
          author: {
            "@type": "Organization",
            name: article.author
          },
          publisher: {
            "@type": "Organization",
            name: "House of Nuts Proddatur",
            logo: {
              "@type": "ImageObject",
              url: "https://houseofnuts.store/images/branding/house-of-nuts-logo-hd.png"
            }
          },
          datePublished: article.publishedDate,
          description: article.summary
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Inject Dynamic Recipe/Article Schema into DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl border border-border shadow-2xl p-6 sm:p-10 my-8 font-body">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-white transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
            <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">{article.category}</span>
            <span>•</span>
            <span>{article.readTime}</span>
            <span>•</span>
            <span>{article.publishedDate}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl text-foreground leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Banner Image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-border">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Recipe Content View */}
        {article.type === "Recipe" && article.recipeData && (
          <div className="space-y-8">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/60 border border-border text-center">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prep Time</span>
                <span className="font-display text-lg text-foreground">{article.recipeData.prepTime}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cook Time</span>
                <span className="font-display text-lg text-foreground">{article.recipeData.cookTime}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Yield</span>
                <span className="font-display text-lg text-foreground">{article.recipeData.yield}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Calories</span>
                <span className="font-display text-lg text-foreground">{article.recipeData.calories}</span>
              </div>
            </div>

            {/* Ingredients Section */}
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-foreground mb-4">
                📋 Required Ingredients
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {article.recipeData.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/70 text-sm text-foreground">
                    <span className="text-accent font-bold">✓</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-foreground mb-4">
                🍳 Preparation Steps
              </h2>
              <ol className="space-y-4">
                {article.recipeData.steps.map((step, i) => (
                  <li key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border">
                    <span className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center shrink-0 font-display">
                      {i + 1}
                    </span>
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed self-center">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Buying Guide Content View */}
        {article.type === "Buying Guide" && article.guideData && (
          <div className="space-y-8">
            {/* Key Takeaways Box */}
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <h2 className="font-display text-lg text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                💡 Key Buyer Takeaways
              </h2>
              <ul className="space-y-2">
                {article.guideData.keyTakeaways.map((take, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{take}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Guide Sections */}
            <div className="space-y-6">
              {article.guideData.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="font-display text-xl text-foreground">{sec.heading}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shop Featured Ingredients (Internal Product Links & Direct Add to Cart) */}
        <div className="mt-10 pt-8 border-t border-border">
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center justify-between">
            <span>🛒 Shop Featured Ingredients Direct</span>
            <span className="text-xs font-body font-normal text-muted-foreground">100% Pure Harvest</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {article.linkedProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <img src={prod.image} alt={prod.name} className="w-14 h-14 object-cover rounded-xl border border-border" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm text-foreground truncate">{prod.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-accent font-body">₹{prod.price}</span>
                    <span>•</span>
                    <span>{prod.weight}</span>
                  </div>
                </div>
                <button
                  onClick={() => onAddToCart(prod)}
                  className="rounded-full bg-accent/15 hover:bg-accent hover:text-white text-accent px-3 py-1.5 text-xs font-semibold font-body transition-colors shrink-0"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Category Links */}
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground self-center">Explore Category:</span>
            {article.linkedCategories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.url}
                onClick={onClose}
                className="rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground px-3 py-1 text-xs font-medium font-body transition-colors"
              >
                {cat.label} →
              </Link>
            ))}
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-accent text-accent-foreground font-semibold font-body text-xs px-6 py-2 uppercase tracking-wider hover:bg-accent/90 transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
