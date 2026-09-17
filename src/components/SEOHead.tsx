import React, { useEffect } from "react";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "House of Nuts — Premier Dry Fruit House, Spices & Wild Honey Proddatur";
const DEFAULT_DESCRIPTION =
  "House of Nuts Proddatur (Dry Fruit House) — Buy 100% natural Mamra almonds (Badam), Iranian pistachios (Pista), jumbo cashews, organic spices, raw wild honey & luxury gift boxes online in Proddatur, AP. Best prices, direct farm source.";
const DEFAULT_KEYWORDS =
  "dryfruit house, dry fruit house proddatur, dryfrit proddatur, dryfruit proddatur, dry fruit store near me, dry fruit shop in proddatur, organic spices proddatur, raw forest honey proddatur, wild honey proddatur, dry fruit gift boxes proddatur, luxury hampers, badam, pista, kaju, anjeer, dates, walnuts, House of Nuts Proddatur";
const DEFAULT_OG_IMAGE =
  "https://houseofnuts.store/images/branding/house-of-nuts-banner.png";
const SITE_NAME = "House of Nuts";
const BASE_URL = "https://houseofnuts.store";

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Meta Description & Keywords
    setMetaTag('meta[name="description"]', "name", "description", description || DEFAULT_DESCRIPTION);
    setMetaTag('meta[name="author"]', "name", "author", SITE_NAME);
    setMetaTag('meta[name="keywords"]', "name", "keywords", keywords || DEFAULT_KEYWORDS);

    // 3. Canonical URL
    const cleanPath = canonicalUrl ? canonicalUrl : window.location.pathname;
    const targetCanonical = `${BASE_URL}${cleanPath === "/" ? "" : cleanPath}`;
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute("href", targetCanonical);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:title"]', "property", "og:title", title || DEFAULT_TITLE);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description || DEFAULT_DESCRIPTION);
    setMetaTag('meta[property="og:url"]', "property", "og:url", targetCanonical);
    setMetaTag('meta[property="og:image"]', "property", "og:image", ogImage || DEFAULT_OG_IMAGE);

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:site"]', "name", "twitter:site", "@HouseOfNuts");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title || DEFAULT_TITLE);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description || DEFAULT_DESCRIPTION);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage || DEFAULT_OG_IMAGE);

    // 6. JSON-LD Structured Data
    const JSONLD_SCRIPT_ID = "dynamic-page-jsonld";
    let scriptElement = document.getElementById(JSONLD_SCRIPT_ID) as HTMLScriptElement | null;
    
    const defaultJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["GroceryStore", "LocalBusiness", "Store", "OnlineStore"],
          "@id": `${BASE_URL}/#store`,
          "name": SITE_NAME,
          "alternateName": [
            "Dry Fruit House Proddatur",
            "Dryfruit House",
            "House of Nuts — Premier Dry Fruits, Spices & Honey Shop",
            "Nut House Proddatur"
          ],
          "url": BASE_URL,
          "logo": `${BASE_URL}/images/branding/house-of-nuts-logo-hd.png`,
          "description": DEFAULT_DESCRIPTION,
          "telephone": "+919652526920",
          "hasMap": "https://share.google/MXS8ulw5qZr3b2rEa",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "10-155/2, KK Street, Gandhi Road",
            "addressLocality": "Proddatur",
            "addressRegion": "Andhra Pradesh",
            "postalCode": "516360",
            "addressCountry": "IN"
          },
          "knowsAbout": [
            "Dry Fruits",
            "Dry Fruit House",
            "Mamra Almonds",
            "Cashews",
            "Iranian Pistachios",
            "Organic Spices",
            "Kashmiri Saffron",
            "Raw Wild Forest Honey",
            "Dry Fruit Gift Boxes",
            "Festive Hampers",
            "Corporate Gifting"
          ]
        },
        {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          "url": BASE_URL,
          "name": SITE_NAME,
          "publisher": {
            "@id": `${BASE_URL}/#store`
          }
        }
      ]
    };

    const payloadToRender = jsonLd || defaultJsonLd;

    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.id = JSONLD_SCRIPT_ID;
      scriptElement.type = "application/ld+json";
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(payloadToRender);

    return () => {
      // Clean up dynamic JSON-LD on unmount if needed
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
