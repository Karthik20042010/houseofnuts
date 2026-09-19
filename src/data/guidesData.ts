export interface LinkedProduct {
  id: string;
  name: string;
  price: number;
  weight: string;
  image: string;
}

export interface LinkedCategory {
  label: string;
  url: string;
}

export interface GuideArticle {
  id: string;
  slug: string;
  type: "Recipe" | "Buying Guide";
  title: string;
  category: "Almonds & Nuts" | "Spices & Saffron" | "Honey & Wellness" | "Gift Hampers & Festive";
  categorySlug: string;
  readTime: string;
  image: string;
  summary: string;
  keywords: string[];
  publishedDate: string;
  author: string;
  linkedProducts: LinkedProduct[];
  linkedCategories: LinkedCategory[];
  seoMetaData: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  };
  recipeData?: {
    prepTime: string;
    cookTime: string;
    totalTime: string;
    yield: string;
    calories: string;
    ingredients: string[];
    steps: string[];
  };
  guideData?: {
    keyTakeaways: string[];
    sections: { heading: string; content: string }[];
  };
}

export const GUIDES_AND_RECIPES: GuideArticle[] = [
  {
    id: "guide-kesar-badam-milk",
    slug: "kesar-badam-milk-recipe",
    type: "Recipe",
    title: "Authentic Kashmiri Kesar Badam Milk — Royal Festive Recipe",
    category: "Spices & Saffron",
    categorySlug: "spices",
    readTime: "8 min read",
    image: "/images/spices/saffron.jpg",
    summary: "Brew traditional, aromatic Saffron Almond Milk using authentic Kashmiri Mongra Saffron, crushed Mamra Almonds, and green Elaichi. Rich in antioxidants and perfect for festive celebrations.",
    keywords: [
      "kesar badam milk recipe",
      "kashmiri saffron badam milk",
      "how to use kashmiri kesar",
      "mamra almonds drink recipe",
      "festive dry fruit milk proddatur"
    ],
    publishedDate: "2026-09-18",
    author: "House of Nuts Culinary Team",
    linkedProducts: [
      {
        id: "kashmir-saffron",
        name: "Kashmiri Mongra Saffron (Kesar)",
        price: 490,
        weight: "1g",
        image: "/images/spices/saffron.jpg"
      },
      {
        id: "mamra-almonds",
        name: "Kashmiri Mamra Almonds (Badam)",
        price: 780,
        weight: "250g",
        image: "/images/nuts/mamra-almonds.jpg"
      },
      {
        id: "green-cardamom",
        name: "Kerala Green Cardamom (Elaichi)",
        price: 360,
        weight: "100g",
        image: "/images/spices/cardamom.jpg"
      }
    ],
    linkedCategories: [
      { label: "Organic Spices & Saffron", url: "/category/spices" },
      { label: "Premium Almonds & Nuts", url: "/category/nuts" }
    ],
    seoMetaData: {
      metaTitle: "Royal Kesar Badam Milk Recipe — Kashmiri Saffron & Mamra Almonds",
      metaDescription: "Learn how to make authentic Kashmiri Kesar Badam Milk with pure Mongra saffron & crisp Mamra badam. Easy 20-minute recipe from House of Nuts Proddatur.",
      canonicalUrl: "/journal/kesar-badam-milk-recipe"
    },
    recipeData: {
      prepTime: "10 mins",
      cookTime: "15 mins",
      totalTime: "25 mins",
      yield: "4 Servings",
      calories: "240 kcal per glass",
      ingredients: [
        "15–20 strands of Kashmiri Mongra Saffron (Kesar)",
        "25 Kashmiri Mamra Almonds (blanched and peeled)",
        "4 cups whole farm-fresh milk (or almond milk)",
        "4 crushed pods of Kerala Green Cardamom (Elaichi)",
        "2 tbsp Raw Wild Forest Honey or organic sugar",
        "2 tbsp slivered Iranian Jumbo Pistachios (for garnish)"
      ],
      steps: [
        "Soak 15–20 strands of Kashmiri Mongra Saffron in 3 tbsp of warm milk for 15 minutes until it releases a deep golden amber color.",
        "Soak Mamra Almonds in warm water for 20 minutes, peel the skins, and blend into a coarse, creamy paste with 3 tbsp of milk.",
        "In a heavy-bottomed brass or steel pan, bring 4 cups of milk to a gentle boil.",
        "Lower heat, add the coarse almond paste, crushed cardamom, and saffron-infused milk. Stir continuously for 10–12 minutes until thickened.",
        "Remove from heat, stir in Raw Wild Forest Honey to sweeten, and pour into traditional clay cups (kulhad) or glasses.",
        "Garnish generously with slivered pistachios and extra saffron strands. Serve warm or chilled!"
      ]
    }
  },
  {
    id: "guide-mamra-vs-california-almonds",
    slug: "mamra-vs-california-almonds-guide",
    type: "Buying Guide",
    title: "Mamra Almonds vs. California Almonds: The Ultimate Nutrition & Buyer's Guide",
    category: "Almonds & Nuts",
    categorySlug: "nuts",
    readTime: "6 min read",
    image: "/images/nuts/mamra-almonds.jpg",
    summary: "Discover why Kashmiri Mamra Badam contains up to 50% more natural oils than California almonds. Learn how to identify 100% authentic Mamra almonds and choose the right variety for your daily health routine.",
    keywords: [
      "mamra badam vs california almonds",
      "best almonds buying guide",
      "kashmiri mamra almonds benefits",
      "how to identify real mamra badam",
      "dry fruit buying guide proddatur"
    ],
    publishedDate: "2026-09-15",
    author: "House of Nuts Quality Lab",
    linkedProducts: [
      {
        id: "mamra-almonds",
        name: "Kashmiri Mamra Almonds (Badam)",
        price: 780,
        weight: "250g",
        image: "/images/nuts/mamra-almonds.jpg"
      },
      {
        id: "california-almonds",
        name: "California Almonds (Badam)",
        price: 240,
        weight: "250g",
        image: "/images/nuts/almonds.jpg"
      }
    ],
    linkedCategories: [
      { label: "Shop All Almonds & Nuts", url: "/category/nuts" },
      { label: "Dry Fruit Gift Boxes", url: "/category/gifting" }
    ],
    seoMetaData: {
      metaTitle: "Mamra Badam vs California Almonds: Buying & Nutrition Guide",
      metaDescription: "Understand the oil content, origin, and health benefits of Mamra vs California almonds. Buy 100% genuine Kashmiri Mamra Badam online at House of Nuts Proddatur.",
      canonicalUrl: "/journal/mamra-vs-california-almonds-guide"
    },
    guideData: {
      keyTakeaways: [
        "Kashmiri Mamra almonds contain up to 50% natural almond oil compared to ~25% in mass-produced California almonds.",
        "Mamra almonds have a unique concave shape with deep furrows, harvested manually without chemical pasteurization.",
        "Soaking 5–7 Mamra almonds overnight provides optimal brain booster nutrients, Vitamin E, and healthy monounsaturated fats."
      ],
      sections: [
        {
          heading: "1. Origin & Cultivation Differences",
          content: "California almonds are mass-produced through commercial orchards using automated pasteurization. In contrast, Kashmiri and Iranian Mamra almonds grow in organic mountain valleys, irrigated naturally by snowmelt and sun-cured traditional orchards."
        },
        {
          heading: "2. Natural Oil & Nutrient Density",
          content: "The signature characteristic of Mamra Badam is its rich oil concentration (up to 50%). When chewed raw, it offers a distinct sweet, buttery taste. California almonds undergo commercial processing which strips a portion of these volatile natural oils."
        },
        {
          heading: "3. How to Identify Authentic Mamra Almonds",
          content: "Authentic Mamra almonds feature a curved, boat-like shape with distinct ridges and a darker golden-tan skin. They are slightly smaller than California kernels but significantly heavier due to high oil density."
        }
      ]
    }
  },
  {
    id: "guide-raw-wild-honey-benefits",
    slug: "raw-wild-forest-honey-health-guide",
    type: "Buying Guide",
    title: "7 Science-Backed Benefits of Unprocessed Raw Wild Forest Honey",
    category: "Honey & Wellness",
    categorySlug: "honey",
    readTime: "5 min read",
    image: "/images/honey/honey-jar.jpg",
    summary: "Unpasteurized raw forest honey is packed with active enzymes, wild flower pollen, and natural antioxidants. Explore how pure honey boosts immunity, aids digestion, and naturally sweetens daily beverages.",
    keywords: [
      "raw wild forest honey benefits",
      "pure unpasteurized honey proddatur",
      "organic wild honey vs commercial honey",
      "how to test pure honey at home",
      "buy wild forest honey online"
    ],
    publishedDate: "2026-09-12",
    author: "House of Nuts Wellness Team",
    linkedProducts: [
      {
        id: "wild-forest-honey",
        name: "Raw Wild Forest Honey",
        price: 340,
        weight: "500g",
        image: "/images/honey/honey-jar.jpg"
      }
    ],
    linkedCategories: [
      { label: "Raw Honey & Wellness", url: "/category/honey" },
      { label: "Organic Spices & Saffron", url: "/category/spices" }
    ],
    seoMetaData: {
      metaTitle: "Raw Wild Forest Honey Benefits & Purity Buying Guide",
      metaDescription: "Discover the health benefits of 100% raw, unpasteurized wild forest honey. Sourced directly from natural forest hives. Buy online at House of Nuts Proddatur.",
      canonicalUrl: "/journal/raw-wild-forest-honey-health-guide"
    },
    guideData: {
      keyTakeaways: [
        "Raw wild honey is harvested without heat pasteurization, preserving natural enzymes like amylase and invertase.",
        "Contains wild flora pollen which helps build seasonal allergy immunity.",
        "Never spoils — authentic wild honey crystallizes naturally over time, proving zero added sugar syrup."
      ],
      sections: [
        {
          heading: "1. Heat-Free Extraction",
          content: "Commercial supermarket honey is ultra-filtered and heated above 65°C, destroying beneficial phytonutrients. House of Nuts Raw Wild Forest Honey is cold-filtered through fine mesh to retain all natural propolis and bee pollen."
        },
        {
          heading: "2. Purity Test You Can Do At Home",
          content: "Drop one spoon of honey into a clear glass of water. Pure raw honey settles at the bottom as a dense clump without dissolving immediately. Adulterated sugar syrup dissolves rapidly into the water."
        }
      ]
    }
  },
  {
    id: "guide-festive-dry-fruit-gift-hampers",
    slug: "diwali-festive-dry-fruit-gifting-guide",
    type: "Buying Guide",
    title: "Festive Gifting Guide: Customizing Premium Wooden Gift Boxes in Proddatur",
    category: "Gift Hampers & Festive",
    categorySlug: "gifting",
    readTime: "7 min read",
    image: "/images/gifting/gift-hamper-luxury.jpg",
    summary: "Select the perfect luxury dry fruit hamper for Diwali, weddings, corporate events, and housewarming ceremonies. Handcrafted wooden boxes filled with Mamra badam, pistachios, cashews & saffron.",
    keywords: [
      "dry fruit gift boxes proddatur",
      "wedding gift hampers proddatur",
      "diwali dry fruit gift box price",
      "custom corporate gifting proddatur",
      "royal wooden dry fruit hampers"
    ],
    publishedDate: "2026-09-10",
    author: "House of Nuts Gifting Concierge",
    linkedProducts: [
      {
        id: "diwali-hamper",
        name: "Festive Diwali Dry Fruit Hampers",
        price: 1850,
        weight: "1.2kg",
        image: "/images/gifting/gift-hamper-luxury.jpg"
      },
      {
        id: "wedding-gift-box",
        name: "Wedding Gift Boxes Proddatur",
        price: 2400,
        weight: "1.5kg",
        image: "/images/gifting/gift-box-wooden.jpg"
      }
    ],
    linkedCategories: [
      { label: "Luxury Gift Boxes & Hampers", url: "/gifting" },
      { label: "Shop All Products", url: "/shop" }
    ],
    seoMetaData: {
      metaTitle: "Luxury Dry Fruit Gift Hampers & Custom Boxes Proddatur",
      metaDescription: "Custom dry fruit gift boxes for weddings, corporate gifting & Diwali in Proddatur. Handcrafted wooden hampers loaded with premium nuts & saffron.",
      canonicalUrl: "/journal/diwali-festive-dry-fruit-gifting-guide"
    },
    guideData: {
      keyTakeaways: [
        "Handcrafted eco-friendly wooden boxes preserve dry fruit aroma and oil freshness.",
        "Customizable configurations: choose 4-compartment, 6-compartment, or luxury velvet jar arrangements.",
        "Doorstep courier delivery across Proddatur, Kadapa District, and all major South Indian cities."
      ],
      sections: [
        {
          heading: "1. Choosing the Right Hamper Configuration",
          content: "For corporate client appreciation, 4-tier wooden boxes featuring W180 King Cashews, Iranian Pistachios, Mamra Almonds, and Chilean Walnuts strike the perfect balance of prestige and utility."
        },
        {
          heading: "2. Wedding & Return Gift Customization",
          content: "Personalize your wedding hampers with custom foil-stamped name labels, silk ribbons, and premium brass jars for saffron and wild forest honey."
        }
      ]
    }
  }
];
