import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import PromoBanner from "@/components/PromoBanner";
import ProductCard from "@/components/ProductCard";
import { getGuide, guides } from "@/data/guides";
import { products, categories } from "@/data/products";
import NotFound from "./NotFound";

const BASE = "https://houseofnuts.store";

const JournalArticle = () => {
  const { slug } = useParams();
  const guide = getGuide(slug);
  if (!guide) return <NotFound />;

  const url = `${BASE}/journal/${guide.slug}`;
  const shop = guide.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;
  const cats = guide.categories
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is (typeof categories)[number] => Boolean(c));
  const more = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": guide.kind === "recipe" ? "Recipe" : "Article",
      ...(guide.kind === "recipe" ? { name: guide.title } : {}),
      headline: guide.title,
      description: guide.metaDescription,
      image: `${BASE}${guide.image}`,
      dateModified: guide.updated,
      datePublished: guide.updated,
      author: { "@type": "Organization", name: "House of Nuts" },
      publisher: { "@type": "Organization", name: "House of Nuts" },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${BASE}/journal` },
        { "@type": "ListItem", position: 3, name: guide.title, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={guide.metaTitle}
        description={guide.metaDescription}
        keywords={guide.keywords}
        canonicalUrl={`/journal/${guide.slug}`}
        ogImage={`${BASE}${guide.image}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <PromoBanner />
      <Header />
      <CartDrawer />

      <main className="max-w-3xl mx-auto px-5 py-8 sm:py-12 font-body">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link to="/journal" className="hover:text-foreground">Journal</Link> /{" "}
          <span className="text-foreground">{guide.kindLabel}</span>
        </nav>

        <article>
          <span className="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-[10px] uppercase tracking-[0.2em] mb-3">
            {guide.kindLabel} · {guide.readingMinutes} min read
          </span>
          <h1 className="font-display text-3xl sm:text-5xl leading-tight mb-5">{guide.title}</h1>
          <img
            src={guide.image}
            alt={guide.title}
            width={1200}
            height={630}
            className="w-full aspect-[16/9] object-cover rounded-2xl mb-6 bg-muted"
          />
          {guide.intro.map((p, i) => (
            <p key={i} className="text-base sm:text-lg leading-relaxed mb-4 text-foreground/90">{p}</p>
          ))}

          {guide.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="font-display text-2xl sm:text-3xl mb-3">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="leading-relaxed mb-3 text-foreground/90">{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-5 space-y-1 text-foreground/90">
                  {s.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
            </section>
          ))}

          {guide.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl sm:text-3xl mb-4">Questions people ask</h2>
              <div className="space-y-3">
                {guide.faq.map((f) => (
                  <details key={f.q} className="rounded-xl border border-border bg-card p-4">
                    <summary className="cursor-pointer font-medium">{f.q}</summary>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        {cats.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl mb-3">Browse the shop</h2>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
                  {c.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {shop.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pb-10">
          <h2 className="font-display text-2xl sm:text-3xl mb-5">Shop the ingredients</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {shop.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-5 pb-16">
        <h2 className="font-display text-2xl mb-4">Keep reading</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {more.map((g) => (
            <Link key={g.slug} to={`/journal/${g.slug}`} className="rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{g.kindLabel}</p>
              <p className="font-display text-lg leading-snug">{g.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JournalArticle;
