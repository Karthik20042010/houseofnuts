# House of Nuts — Search Engine Optimization (SEO) & Ranking Blueprint

> **Goal**: Rank **House of Nuts** in the **Top 10 search results** on Google for core keywords globally, across India, and locally in **Proddatur, Andhra Pradesh** (Google Search Console & Google Maps).

---

## 1. Executive Summary & Objectives

1. **Top Google Search Ranking**: Achieve Top 10 / Page 1 rankings on Google Search Console for queries like:
   - *"dry fruits online"* / *"buy badam online"* / *"mamra almonds price india"*
   - *"dry fruit shop in Proddatur"* / *"best badam pista cashew store Proddatur"*
   - *"wild honey near me Proddatur"* / *"house of nuts proddatur"*
2. **Local SEO Dominance**: Optimize Google Business Profile, Google Maps, and Local Business Schema for **Proddatur, Kadapa District, Andhra Pradesh**.
3. **Full Technical SEO Compliance**: Implement canonical URLs, dynamic Open Graph, Twitter Cards, fast load performance, XML sitemaps, robots.txt, semantic HTML markup, and dynamic JSON-LD structured data on all pages.

---

## 2. Store Identity & Local Business Details

| Parameter | Value |
| :--- | :--- |
| **Brand Name** | House of Nuts |
| **Legal / Store Address** | 10-155/2, KK Street, Gandhi Road, Proddatur, YSR Kadapa District, Andhra Pradesh - 516360 |
| **Contact Phone** | +91 96525 26920 |
| **Google Maps URL** | [House of Nuts on Google Maps](https://maps.app.goo.gl/NhAo8EZtyc77CU119) |
| **Instagram Profile** | [@houseofnuts_proddatur](https://www.instagram.com/houseofnuts_proddatur) |
| **Target Region** | Proddatur, Andhra Pradesh (Local) & All India (E-Commerce Delivery) |
| **Price Range** | ₹120 – ₹2,200 |

---

## 3. High-Priority Keyword Target Strategy

### A. Proddatur Local Keywords (Highest Conversion Intent)
- `house of nuts proddatur`
- `dry fruit store in proddatur`
- `best badam pista shop proddatur`
- `cashew nuts wholesale proddatur`
- `mamra almonds store proddatur`
- `wild honey proddatur`
- `kashmiri saffron proddatur`
- `dry fruits gift boxes proddatur`
- `gandhi road dry fruits shop proddatur`

### B. High-Volume E-Commerce Keywords (Pan-India)
- `buy premium dry fruits online`
- `mamra almonds price per kg`
- `jumbo cashews w320 online`
- `iranian pistachios salted`
- `raw organic wild forest honey`
- `original kashmiri saffron mongra`
- `luxury dry fruit gift hamper online`

---

## 4. Technical SEO Architecture & Implementation

### A. Metadata Standard per Route
Each page dynamic update includes:
- **Title Tag**: Primary Keyword | Secondary Keyword | House of Nuts
- **Meta Description**: 150-160 characters incorporating value proposition, keywords, and CTA (e.g. *Free shipping available* / *Visit store in Proddatur*).
- **Meta Keywords**: Relevant comma-separated high-intent search phrases.
- **Canonical Link**: Standardized absolute URL to prevent duplicate content flags.
- **Open Graph (og:title, og:description, og:image, og:url)**: Optimized for WhatsApp, Facebook & LinkedIn sharing.
- **Twitter Cards**: Summary Large Image format for rich social preview cards.

### B. Schema.org JSON-LD Structured Data
1. **Homepage (`/`)**:
   - `OnlineStore` + `LocalBusiness` / `Store` schema.
   - Includes address, geo-coordinates, map link (`https://maps.app.goo.gl/NhAo8EZtyc77CU119`), Instagram URL, price range, opening hours, and service area (`Proddatur, Andhra Pradesh, India`).
2. **Product Pages (`/product/:id`)**:
   - `Product` schema with name, description, SKU, brand (`House of Nuts`), offer price, availability (`InStock`), currency (`INR`), image URLs, and seller details.
3. **Category / Shop Pages (`/shop`, `/category/:slug`)**:
   - `BreadcrumbList` schema and `CollectionPage` markup.
4. **Store / Contact Info Page (`/contact`, `/faq`, `/shipping`)**:
   - `ContactPage`, `FAQPage`, and `LocalBusiness` schema.

---

## 5. Google Search Console & Indexing Setup Checklist

1. **Domain Verification**:
   - Add domain property (`houseofnuts.in`) to Google Search Console via DNS TXT record or HTML file upload.
2. **Submit XML Sitemap**:
   - Submit URL: `https://houseofnuts.in/sitemap.xml` in GSC.
3. **Google Business Profile Integration**:
   - Connect Google Business Profile with Google Maps URL: `https://maps.app.goo.gl/NhAo8EZtyc77CU119`.
   - Ensure matching Name, Address, and Phone (NAP consistency) across the web.
4. **Mobile Usability & Core Web Vitals**:
   - Monitor LCP (Largest Contentful Paint), FID/INP, and CLS scores.
   - Serve webp/optimized images with explicit `alt` tags on all product listings.
5. **URL Inspection & Live Index Request**:
   - Request indexing for core pages: Home, Shop, Categories (`nuts`, `dry-fruits`, `chocolates`, `spices`, `honey`), and flagship product pages.

---

## 6. Developer SEO Checklist for Code Updates

- [x] Baseline metadata in `index.html` updated with local business details & Google Maps URL.
- [x] Dynamic `<SEOHead />` component implemented in React to inject head metadata & JSON-LD dynamically.
- [x] `SEOHead` integrated into `Index.tsx`, `ProductDetail.tsx`, `Category.tsx`, `StoreInfo.tsx`, `Gifting.tsx`, and `Journal.tsx`.
- [x] `public/sitemap.xml` expanded to cover all categories, pages, and products.
- [x] `public/robots.txt` configured to allow crawlers while protecting `/admin` routes.
- [x] Alt texts on images and semantic HTML markup (`<h1>`, `<section>`, `<article>`, `<address>`) verified.
