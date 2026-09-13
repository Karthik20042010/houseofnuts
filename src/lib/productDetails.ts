export interface ProductSpecification {
  grade?: string;
  origin?: string;
  processing?: string;
  ingredients?: string;
  shelfLife?: string;
  storage?: string;
  flavorProfile?: string;
  nutritionalPer100g: {
    energy: string;
    protein: string;
    carbs: string;
    healthyFats: string;
    fiber: string;
    iron?: string;
    calcium?: string;
    potassium?: string;
  };
  healthBenefits: string[];
}

export const DEFAULT_PRODUCT_SPECS: Record<string, ProductSpecification> = {
  "super-jumbo-cashews-w180": {
    grade: "W180 Super Jumbo (King of Cashews — ~180 nuts/lb)",
    origin: "Mangalore & Goa, India",
    processing: "100% Raw, Sun-Dried & Hand-Sorted",
    ingredients: "100% Whole Whole Raw Cashew Kernels",
    shelfLife: "9 Months from packing date",
    storage: "Store in a cool, dry place away from direct sunlight. Refrigerate in an airtight container for extra freshness.",
    flavorProfile: "Rich, buttery, naturally sweet with a dense crunch",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "43.8g",
      fiber: "3.3g",
      iron: "6.7mg",
      zinc: "5.8mg" as any,
    },
    healthBenefits: [
      "Rich in heart-healthy monounsaturated oleic acid",
      "High concentration of Copper & Zinc for immune defense",
      "Magnesium-dense for muscle recovery and nerve health",
      "Zero cholesterol and zero trans fats",
    ],
  },

  "king-cashews-w240": {
    grade: "W240 Jumbo Kernels (~240 nuts/lb)",
    origin: "Kollam, Kerala, India",
    processing: "Steam peeled & naturally dried",
    ingredients: "100% Whole Cashew Kernels",
    shelfLife: "9 Months",
    storage: "Store in an airtight jar in a cool, dark pantry.",
    flavorProfile: "Mildly sweet, creamy and delicate texture",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "44.0g",
      fiber: "3.3g",
      iron: "6.7mg",
    },
    healthBenefits: [
      "Sustained energy release with high plant protein",
      "Promotes healthy vascular and bone function",
      "Abundant in antioxidants and essential minerals",
    ],
  },

  "split-tukda-cashews": {
    grade: "LWP / SWP 2-Piece Split Tukda",
    origin: "Mangalore, India",
    processing: "Cleaned & split for cooking excellence",
    ingredients: "100% Natural Broken Cashew Kernels",
    shelfLife: "6 Months",
    storage: "Keep sealed in airtight packaging.",
    flavorProfile: "Creamy nuttiness ideal for rich gravies and sweets",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "43.8g",
      fiber: "3.3g",
    },
    healthBenefits: [
      "Adds rich natural thickness & creaminess to kheer & curries",
      "Packed with healthy fats and essential plant proteins",
    ],
  },

  "california-almonds": {
    grade: "Nonpareil Supreme (23/25 Size)",
    origin: "California, USA",
    processing: "Raw, pasteurized & unroasted",
    ingredients: "100% Whole California Almond Kernels",
    shelfLife: "12 Months",
    storage: "Store in a cool dry place. Soak overnight in water for optimal nutrient absorption.",
    flavorProfile: "Sweet, nutty crunch with a clean finish",
    nutritionalPer100g: {
      energy: "579 kcal",
      protein: "21.2g",
      carbs: "21.6g",
      healthyFats: "49.9g",
      fiber: "12.5g",
      iron: "3.7mg",
      calcium: "269mg",
    },
    healthBenefits: [
      "Exceptionally high in Vitamin E (170% Daily Value)",
      "Helps regulate blood sugar and cholesterol levels",
      "High dietary fiber promotes gut digestive wellness",
      "Rich in Magnesium for heart & bone strength",
    ],
  },

  "mamra-almonds": {
    grade: "Royal High-Altitude Mamra (100% Oil-Rich)",
    origin: "High Valleys of Iran & Afghanistan",
    processing: "100% Natural, Unrefined Mountain Harvest",
    ingredients: "100% Pure Mamra Badam Giri",
    shelfLife: "12 Months",
    storage: "Keep in a glass jar in a cool place to preserve natural almond oils.",
    flavorProfile: "Intense deep nuttiness with rich natural oil aroma",
    nutritionalPer100g: {
      energy: "605 kcal",
      protein: "22.5g",
      carbs: "19.5g",
      healthyFats: "54.0g",
      fiber: "11.0g",
      calcium: "280mg",
    },
    healthBenefits: [
      "Superior natural almond oil content for maximum brain nutrition",
      "Enhances memory retention, focus and cognitive power",
      "Supports skin nourishment and hair vitality from within",
      "Low glycemic index superfood for diabetic wellness",
    ],
  },

  "afghan-gurbandi-badam": {
    grade: "Wild Mountain Small-Kernel Gurbandi",
    origin: "Giri Valleys, Afghanistan",
    processing: "Sun-dried wild harvest",
    ingredients: "100% Afghan Gurbandi Almond Kernels",
    shelfLife: "12 Months",
    storage: "Store in airtight containers.",
    flavorProfile: "Distinct wild nutty flavor with potent natural oils",
    nutritionalPer100g: {
      energy: "590 kcal",
      protein: "21.8g",
      carbs: "20.2g",
      healthyFats: "52.0g",
      fiber: "12.0g",
    },
    healthBenefits: [
      "Concentrated nutritional potency from wild mountain soil",
      "Rich in natural antioxidants and plant proteins",
    ],
  },

  "afghan-green-pista-giri": {
    grade: "Whole Kernel without Shell (Grade A++)",
    origin: "Herat, Afghanistan",
    processing: "Raw shelled green pistachios",
    ingredients: "100% Green Pistachio Kernels (Pista Giri)",
    shelfLife: "9 Months",
    storage: "Refrigerate after opening to maintain emerald green color and freshness.",
    flavorProfile: "Earthy, rich sweet pistachio note",
    nutritionalPer100g: {
      energy: "562 kcal",
      protein: "20.2g",
      carbs: "27.2g",
      healthyFats: "45.3g",
      fiber: "10.3g",
      potassium: "1025mg",
    },
    healthBenefits: [
      "Abundant in Lutein & Zeaxanthin for eye health",
      "High Potassium content supports muscle recovery",
      "Ready-to-use for gourmet garnishing, desserts & sweets",
    ],
  },

  "roasted-salted-pistachios": {
    grade: "Jumbo In-Shell (20/22 Kerman Grade)",
    origin: "California, USA / Iran",
    processing: "Dry roasted with sea salt",
    ingredients: "Pistachios, Sea Salt",
    shelfLife: "6 Months",
    storage: "Store in a cool dry place in sealed zip pouch.",
    flavorProfile: "Savory salted crunch with easy shell pop",
    nutritionalPer100g: {
      energy: "560 kcal",
      protein: "20.0g",
      carbs: "28.0g",
      healthyFats: "45.0g",
      fiber: "10.0g",
    },
    healthBenefits: [
      "Healthy guilt-free snack rich in protein and fiber",
      "Helps satiety and weight management",
    ],
  },

  "chilean-walnuts": {
    grade: "Extra Light 100% Halves",
    origin: "Central Valley, Chile",
    processing: "Cold shell-cracked & hand sorted",
    ingredients: "100% Chilean Walnut Halves (Akhrot)",
    shelfLife: "9 Months",
    storage: "Store in refrigerator or freezer to prevent nut oil oxidation.",
    flavorProfile: "Crisp, buttery mild flavor without bitterness",
    nutritionalPer100g: {
      energy: "654 kcal",
      protein: "15.2g",
      carbs: "13.7g",
      healthyFats: "65.2g",
      fiber: "6.7g",
      potassium: "441mg",
    },
    healthBenefits: [
      "Highest plant-based ALA Omega-3 fatty acids (2.5g per serving)",
      "Supports brain cell health, memory and mood balance",
      "Promotes cardiovascular arterial flexibility",
    ],
  },

  "kashmiri-saffron": {
    grade: "A++ Grade Lacha / Mogra (GI Tagged)",
    origin: "Pampore, Kashmir, India",
    processing: "100% Pure Hand-Harvested Stigmas",
    ingredients: "100% Pure Kashmiri Saffron (Kesar)",
    shelfLife: "24 Months",
    storage: "Store in an airtight dark glass container away from moisture & light.",
    flavorProfile: "Intensely floral, warm honey aroma with deep golden crimson hue",
    nutritionalPer100g: {
      energy: "310 kcal",
      protein: "11.4g",
      carbs: "65.4g",
      healthyFats: "5.8g",
      fiber: "3.9g",
    },
    healthBenefits: [
      "Crocin content >220 for maximum color, aroma and potency",
      "Improves skin radiance, mood elevation and sleep quality",
      "Traditional wellness tonic for expectant mothers and vitality",
    ],
  },

  "ajwa-dates": {
    grade: "Jumbo Madinah Al-Munawwarah",
    origin: "Madinah, Saudi Arabia",
    processing: "Sun-dried natural dates",
    ingredients: "100% Natural Ajwa Dates",
    shelfLife: "12 Months",
    storage: "Store in a cool dry pantry or refrigerate.",
    flavorProfile: "Rich caramel notes with soft chewy texture",
    nutritionalPer100g: {
      energy: "277 kcal",
      protein: "1.8g",
      carbs: "75.0g",
      healthyFats: "0.2g",
      fiber: "6.7g",
      potassium: "696mg",
      iron: "1.02mg",
    },
    healthBenefits: [
      "Blessed Madinah superfood rich in essential minerals",
      "High Potassium and Iron support heart rhythm & blood health",
      "Instant natural energy boost without refined sugars",
    ],
  },

  "deccan-chilli-cashews": {
    grade: "W240 Jumbo Seasoned Kernels",
    origin: "Guntur & Kollam, India",
    processing: "Wok-Roasted in Rock Salt & Spice Infusion",
    ingredients: "Cashews, Guntur Chilli Powder, Kaffir Lime Extract, Pink Rock Salt",
    shelfLife: "6 Months",
    storage: "Keep in an airtight jar. Protect from moisture & heat.",
    flavorProfile: "Fiery, tangy and savory crunch with a buttery cashew finish",
    nutritionalPer100g: {
      energy: "542 kcal",
      protein: "17.5g",
      carbs: "29.8g",
      healthyFats: "42.5g",
      fiber: "3.2g",
    },
    healthBenefits: [
      "Capsaicin from Guntur chilli aids metabolism & digestion",
      "Magnesium-rich cashews support nerve and muscle health",
      "No artificial colors or synthetic preservatives",
    ],
  },

  "smoky-garlic-almonds": {
    grade: "Nonpareil Supreme Seasoned Almonds",
    origin: "California, USA & Kashmir, India",
    processing: "Slow Roasted in Garlic Butter & Rosemary",
    ingredients: "Almonds, Garlic Powder, Clarified Butter (Ghee), Rosemary, Smoked Salt",
    shelfLife: "6 Months",
    storage: "Store in a cool dry place. Keep sealed.",
    flavorProfile: "Rich savory garlic butter aroma with deep smoky toasted crunch",
    nutritionalPer100g: {
      energy: "580 kcal",
      protein: "20.8g",
      carbs: "20.5g",
      healthyFats: "48.2g",
      fiber: "11.8g",
    },
    healthBenefits: [
      "High Vitamin E content supports radiant skin & hair health",
      "Garlic compounds provide natural antibacterial benefits",
      "Rich in dietary fiber and monounsaturated healthy fats",
    ],
  },

  "honey-sesame-cashews": {
    grade: "W240 Honey-Glazed Cashews",
    origin: "Western Ghats & Mangalore, India",
    processing: "Honey Wok-Tossed & Sesame Coated",
    ingredients: "Cashews, Raw Wild Forest Honey, White Sesame Seeds, Rock Salt",
    shelfLife: "6 Months",
    storage: "Refrigerate after opening for maximum crispness.",
    flavorProfile: "Sweet, nutty glaze with aromatic sesame aroma",
    nutritionalPer100g: {
      energy: "535 kcal",
      protein: "16.8g",
      carbs: "34.5g",
      healthyFats: "39.8g",
      fiber: "3.8g",
    },
    healthBenefits: [
      "Sesame seeds provide high bioavailable Calcium & Zinc",
      "Raw wild honey acts as an antioxidant-rich sweetener",
      "Instant energy booster for active lifestyles",
    ],
  },

  "tangy-masala-pista": {
    grade: "Jumbo Iranian Seasoned Pistachios",
    origin: "Kerman, Iran & Amritsar, India",
    processing: "Roast-Glazed with Dry Mango & Chatpata Spices",
    ingredients: "Pistachios, Amchur (Dry Mango), Black Salt, Cumin, Black Pepper",
    shelfLife: "9 Months",
    storage: "Store in an airtight container in a dry pantry.",
    flavorProfile: "Zesty chatpata masala coating with crispy pistachio crunch",
    nutritionalPer100g: {
      energy: "560 kcal",
      protein: "20.2g",
      carbs: "27.2g",
      healthyFats: "45.3g",
      fiber: "10.3g",
    },
    healthBenefits: [
      "High Lutein and Zeaxanthin content for eye health protection",
      "Rich in Vitamin B6 to regulate blood sugar & hemoglobin",
      "Low calorie-to-protein ratio ideal for healthy snacking",
    ],
  },

  "pepper-salt-walnuts": {
    grade: "Extra Light Half Kernels",
    origin: "Chile & Kerala, India",
    processing: "Dry Toasted with Malabar Pepper",
    ingredients: "Walnut Kernels, Cracked Malabar Black Pepper, Himalayan Pink Salt",
    shelfLife: "6 Months",
    storage: "Keep in a cool place or refrigerator once opened.",
    flavorProfile: "Earthy walnut richness with sharp, warming black pepper heat",
    nutritionalPer100g: {
      energy: "654 kcal",
      protein: "15.2g",
      carbs: "13.7g",
      healthyFats: "65.2g",
      fiber: "6.7g",
    },
    healthBenefits: [
      "Highest plant-based Omega-3 ALA content among all nuts",
      "Piperine from Malabar pepper enhances nutrient absorption",
      "Supports cognitive performance & brain function",
    ],
  },

  "royal-saffron-stuffed-dates": {
    grade: "Handcrafted Luxury Stuffed Medjool",
    origin: "Jordan & Kashmir, India",
    processing: "Hand-Stuffed & Saffron Honey Glazed",
    ingredients: "Medjool Dates, Iranian Pistachios, Green Cardamom, Kashmiri Saffron, Honey",
    shelfLife: "6 Months",
    storage: "Store in a cool dry pantry or refrigerate.",
    flavorProfile: "Luscious caramel sweetness balanced by crunchy saffron pistachios",
    nutritionalPer100g: {
      energy: "320 kcal",
      protein: "4.8g",
      carbs: "68.5g",
      healthyFats: "5.2g",
      fiber: "7.1g",
    },
    healthBenefits: [
      "Kashmiri Saffron aids mood enhancement and relaxation",
      "Natural fruit sugars provide clean, sustained stamina",
      "Potassium and Magnesium promote cardiac wellness",
    ],
  },

  "cardamom-almond-stuffed-dates": {
    grade: "Premium Stuffed Date Delicacies",
    origin: "Jordan & California, USA",
    processing: "Roasted Almond Filled & Honey Glazed",
    ingredients: "Dates, Roasted Almonds, Green Cardamom Powder, Forest Honey",
    shelfLife: "6 Months",
    storage: "Keep in an airtight tin in a cool pantry.",
    flavorProfile: "Rich dates with crunchy cardamom almond core",
    nutritionalPer100g: {
      energy: "335 kcal",
      protein: "5.4g",
      carbs: "65.2g",
      healthyFats: "7.8g",
      fiber: "7.9g",
    },
    healthBenefits: [
      "Cardamom aids digestion and neutralizes acidity",
      "High fiber content supports smooth intestinal health",
      "Ideal healthy alternative to processed confectionery",
    ],
  },

  "cocoa-dipped-stuffed-dates": {
    grade: "Artisanal Dark Chocolate Stuffed Dates",
    origin: "Jordan & Ghana Cocoa",
    processing: "Cashew Filled & 70% Dark Cocoa Dipped",
    ingredients: "Medjool Dates, Cashew Butter, 70% Dark Chocolate, Sea Salt Flakes",
    shelfLife: "6 Months",
    storage: "Refrigerate below 20°C for smooth chocolate snap.",
    flavorProfile: "Decadent dark chocolate shell with creamy cashew & chewy date center",
    nutritionalPer100g: {
      energy: "385 kcal",
      protein: "5.1g",
      carbs: "62.0g",
      healthyFats: "14.2g",
      fiber: "6.8g",
    },
    healthBenefits: [
      "70% Dark Cocoa is packed with powerful flavonoid antioxidants",
      "Rich in Copper and Iron to combat fatigue",
      "Indulgent sweet treat with zero refined white sugar",
    ],
  },

  "sunkissed-mango-strips": {
    grade: "Solar Dried Alphonso Strips",
    origin: "Ratnagiri, Maharashtra, India",
    processing: "100% Solar Dehydrated, No Added Sugar",
    ingredients: "100% Pure Alphonso Mango",
    shelfLife: "9 Months",
    storage: "Store sealed in a cool, dry place.",
    flavorProfile: "Intense tropical Alphonso mango flavor with chewy texture",
    nutritionalPer100g: {
      energy: "310 kcal",
      protein: "1.5g",
      carbs: "74.0g",
      healthyFats: "0.4g",
      fiber: "4.8g",
    },
    healthBenefits: [
      "Rich in Vitamin A and Beta-Carotene for vision health",
      "Concentrated natural fruit sugars with zero preservatives",
      "Sulfur-free solar drying retains maximum natural aroma",
    ],
  },

  "golden-apricot-kernels": {
    grade: "Jumbo Turkish Sun-Dried Apricots",
    origin: "Malatya, Turkey",
    processing: "Sun-Dried Whole Seedless Fruit",
    ingredients: "100% Whole Sun-Dried Apricots",
    shelfLife: "12 Months",
    storage: "Keep in a cool dry place.",
    flavorProfile: "Soft, golden, mildly tangy and naturally sweet",
    nutritionalPer100g: {
      energy: "241 kcal",
      protein: "3.4g",
      carbs: "62.6g",
      healthyFats: "0.5g",
      fiber: "7.3g",
    },
    healthBenefits: [
      "High Potassium content helps regulate blood pressure",
      "Abundant in dietary fiber for optimal digestive health",
      "Natural Iron source to combat anemia",
    ],
  },

  "solar-kiwi-coins": {
    grade: "Solar Dehydrated Kiwi Slices",
    origin: "Arunachal Pradesh, India",
    processing: "Solar Dehydrated, Low Moisture",
    ingredients: "100% Solar Dried Kiwi Fruit",
    shelfLife: "9 Months",
    storage: "Store in an airtight jar in a cool place.",
    flavorProfile: "Vibrant zesty tang with sweet fruity finish",
    nutritionalPer100g: {
      energy: "295 kcal",
      protein: "2.1g",
      carbs: "67.0g",
      healthyFats: "0.6g",
      fiber: "8.5g",
    },
    healthBenefits: [
      "Exceptional Vitamin C content bolsters immune defense",
      "Actinidin enzyme aids in protein digestion",
      "High fiber and low glycemic index for healthy energy",
    ],
  },
};

/**
 * Get detailed specifications for any product with intelligent fallbacks.
 */
export function getProductSpecification(productId: string, category: string, name: string): ProductSpecification {
  if (DEFAULT_PRODUCT_SPECS[productId]) {
    return DEFAULT_PRODUCT_SPECS[productId];
  }

  // Category based intelligent dynamic fallback
  const isNuts = category === "nuts";
  const isDryFruits = category === "dry-fruits";
  const isSeeds = category === "seeds";
  const isSpices = category === "spices";
  const isHoney = category === "honey";
  const isSolar = category === "solar-dried";

  return {
    grade: "Grade A Premium Export Quality",
    origin: isNuts ? "Hand-selected from top orchards" : isSpices ? "Pampore / Western Ghats, India" : "Farm Fresh Source",
    processing: "100% Natural, Sun-Dried & Hygienically Packed",
    ingredients: `100% Pure ${name}`,
    shelfLife: isHoney ? "24 Months" : "9 Months",
    storage: "Store in a cool, dry place away from direct sunlight. Keep in an airtight container once opened.",
    flavorProfile: "Naturally fresh, rich and wholesome taste",
    nutritionalPer100g: {
      energy: isDryFruits ? "285 kcal" : isHoney ? "304 kcal" : isSeeds ? "520 kcal" : isSolar ? "320 kcal" : "575 kcal",
      protein: isDryFruits ? "3.5g" : isSeeds ? "24.0g" : isHoney ? "0.3g" : "20.5g",
      carbs: isDryFruits ? "68.0g" : isHoney ? "82.4g" : isSeeds ? "28.0g" : "22.0g",
      healthyFats: isDryFruits ? "0.5g" : isHoney ? "0.0g" : isSeeds ? "42.0g" : "48.5g",
      fiber: isDryFruits ? "7.5g" : isSeeds ? "18.0g" : isHoney ? "0.0g" : "11.5g",
    },
    healthBenefits: [
      "100% pure and natural without artificial preservatives or additives",
      "Packed with essential vitamins, minerals and dietary fiber",
      "Sourced directly from verified growers and farm cooperations",
      "Hygienically sorted and nitrogen-flushed for peak freshness",
    ],
  };
}
