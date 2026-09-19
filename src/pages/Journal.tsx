import React from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import PromoBanner from "@/components/PromoBanner";
import { GuidesAndRecipes } from "@/components/GuidesAndRecipes";
import { GUIDES_AND_RECIPES } from "@/data/guidesData";

const Journal = () => {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "House of Nuts Culinary Recipes & Dry Fruit Buying Guides",
    "url": "https://houseofnuts.store/journal",
    "numberOfItems": GUIDES_AND_RECIPES.length,
    "itemListElement": GUIDES_AND_RECIPES.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://houseofnuts.store${item.seoMetaData.canonicalUrl}`,
      "name": item.title
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Dry Fruits Buying Guides & Traditional Recipes Proddatur"
        description="Discover authentic Kashmiri Kesar Badam Milk recipes, Mamra vs California almond buying guides, raw wild honey health benefits, and luxury dry fruit gifting tips at House of Nuts Proddatur."
        keywords="kesar badam milk recipe, dry fruits buying guide proddatur, mamra badam vs california almonds, raw wild forest honey benefits, luxury dry fruit gift hampers proddatur, house of nuts journal"
        canonicalUrl="/journal"
        jsonLd={collectionJsonLd}
      />
      <PromoBanner />
      <Header />
      <CartDrawer />

      <main>
        {/* Page Header Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-earth text-primary-foreground py-16 sm:py-24 px-6 md:px-12">
          <div className="max-w-[1500px] mx-auto relative z-10">
            <span className="inline-block rounded-full bg-gold/90 text-earth px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] font-body mb-4">
              Knowledge & Culinary Hub
            </span>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight max-w-4xl mb-6">
              Dry Fruit Recipes & <br />
              <span className="italic text-gold">Master Buying Guides</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-lg font-light text-primary-foreground/90 font-body leading-relaxed">
              Explore authentic traditional recipes, storage advice, and comprehensive buyer guides to get maximum nutrition and taste from every handful.
            </p>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </section>

        {/* Guides & Recipes Component with Search and Category Filters */}
        <GuidesAndRecipes showSearchAndFilters={true} />
      </main>
    </div>
  );
};

export default Journal;
