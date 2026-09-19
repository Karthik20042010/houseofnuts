// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { products as defaultProducts, categories as defaultCategories } from "../src/data/products";

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

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec";

function getApiUrl(): string {
  if (process.env.VITE_APPS_SCRIPT_URL) {
    return process.env.VITE_APPS_SCRIPT_URL.trim();
  }
  if (process.env.APPS_SCRIPT_URL) {
    return process.env.APPS_SCRIPT_URL.trim();
  }
  const envPath = resolve("./.env");
  if (existsSync(envPath)) {
    try {
      const envText = readFileSync(envPath, "utf-8");
      const match = envText.match(/(?:VITE_)?APPS_SCRIPT_URL=(.+)/);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_APPS_SCRIPT_URL;
}

async function fetchDynamicProductsAndCategories(): Promise<{
  products: { id: string; category?: string }[];
  categories: { id: string }[];
}> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return { products: defaultProducts, categories: defaultCategories };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = new URL(apiUrl);
    url.searchParams.set("action", "getProducts");

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; products?: any[] };
      if (data?.ok && Array.isArray(data.products) && data.products.length > 0) {
        const prodMap = new Map<string, { id: string; category?: string }>();
        for (const p of defaultProducts) {
          if (p?.id) prodMap.set(p.id, { id: p.id, category: p.category });
        }
        for (const p of data.products) {
          if (p?.id && p?.name) {
            prodMap.set(p.id, { id: p.id, category: p.category });
          }
        }
        console.log(`[sitemap] Fetched ${data.products.length} live products from backend`);
        return {
          products: Array.from(prodMap.values()),
          categories: defaultCategories,
        };
      }
    }
  } catch (err: any) {
    console.log(`[sitemap] Could not fetch live products (${err?.message || "timeout"}), using default catalog.`);
  }

  return { products: defaultProducts, categories: defaultCategories };
}

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

async function main() {
  const { products, categories } = await fetchDynamicProductsAndCategories();

  const categoryEntries: SitemapEntry[] = categories
    .filter((c) => !EXCLUDED_CATEGORIES.has(c.id))
    .map((c) => ({ path: `/category/${c.id}`, changefreq: "weekly", priority: "0.8" }));

  const productEntries: SitemapEntry[] = products
    .filter((p) => p.category ? !EXCLUDED_CATEGORIES.has(p.category) : true)
    .map((p) => ({ path: `/product/${p.id}`, changefreq: "weekly", priority: "0.7" }));

  const entries: SitemapEntry[] = [...staticEntries, ...categoryEntries, ...productEntries];

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
