// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { products, categories } from "../src/data/products";

const BASE_URL = "https://houseofnuts.store";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Internal/testing categories that must stay out of search results.
const EXCLUDED_CATEGORIES = new Set([
  "all",
  "stock-inventory-test",
  "orders-qa-test",
  "dev-sandbox",
]);

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/gifting", changefreq: "weekly", priority: "0.8" },
  { path: "/journal", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/shipping", changefreq: "monthly", priority: "0.6" },
  { path: "/returns", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const categoryEntries: SitemapEntry[] = categories
  .filter((c) => !EXCLUDED_CATEGORIES.has(c.id))
  .map((c) => ({ path: `/category/${c.id}`, changefreq: "weekly", priority: "0.8" }));

const productEntries: SitemapEntry[] = products
  .filter((p) => !EXCLUDED_CATEGORIES.has(p.category))
  .map((p) => ({ path: `/product/${p.id}`, changefreq: "weekly", priority: "0.7" }));

const entries: SitemapEntry[] = [...staticEntries, ...categoryEntries, ...productEntries];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
