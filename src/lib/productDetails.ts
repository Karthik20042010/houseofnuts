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
    zinc?: string;
    selenium?: string;
  };
  healthBenefits: string[];
}

// In-memory dynamic override cache populated from Google Sheets ProductSpecs tab
let DYNAMIC_SPECS_CACHE: Record<string, ProductSpecification> = {};

export function setDynamicProductSpecs(specsMap: Record<string, ProductSpecification>) {
  if (specsMap && typeof specsMap === "object") {
    DYNAMIC_SPECS_CACHE = specsMap;
  }
}

export const DEFAULT_PRODUCT_SPECS: Record<string, ProductSpecification> = {
  /* ------------------------------- NUTS ------------------------------- */
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

  "gurbandi-almonds": {
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
      "Traditional Ayurvedic tonic for neurological energy",
      "Unrefined oil retention for cellular vitality",
    ],
  },

  "cashews-w320": {
    grade: "Grade W320 Whole Kernels (~320 nuts/lb)",
    origin: "Kollam & Goa, India",
    processing: "Steam peeled & sun dried",
    ingredients: "100% Whole Cashew Kernels",
    shelfLife: "9 Months",
    storage: "Store in an airtight jar in a cool, dark pantry.",
    flavorProfile: "Mildly sweet, creamy and delicate texture",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "43.8g",
      fiber: "3.3g",
      iron: "6.7mg",
    },
    healthBenefits: [
      "Sustained energy release with high plant protein",
      "Promotes healthy vascular and bone function",
      "Abundant in antioxidants, Copper and Magnesium",
      "Zero cholesterol and zero trans fats",
    ],
  },

  "jumbo-cashews": {
    grade: "W240 Jumbo Kernels (~240 nuts/lb)",
    origin: "Kollam, Kerala, India",
    processing: "Steam peeled & hand sorted",
    ingredients: "100% Whole Cashew Kernels",
    shelfLife: "9 Months",
    storage: "Store in an airtight container.",
    flavorProfile: "Rich, buttery, naturally sweet with dense crunch",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "44.0g",
      fiber: "3.3g",
      iron: "6.7mg",
    },
    healthBenefits: [
      "Hand-picked extra large kernels for luxury snacking",
      "Supports heart health via monounsaturated oleic acid",
      "Essential minerals for immune and bone wellness",
    ],
  },

  "super-jumbo-cashews-w180": {
    grade: "W180 Super Jumbo (King of Cashews — ~180 nuts/lb)",
    origin: "Mangalore & Goa, India",
    processing: "100% Raw, Sun-Dried & Hand-Sorted",
    ingredients: "100% Whole Raw Cashew Kernels",
    shelfLife: "9 Months from packing date",
    storage: "Store in a cool, dry place away from direct sunlight.",
    flavorProfile: "Rich, buttery, naturally sweet with a dense crunch",
    nutritionalPer100g: {
      energy: "553 kcal",
      protein: "18.2g",
      carbs: "30.1g",
      healthyFats: "43.8g",
      fiber: "3.3g",
      iron: "6.7mg",
      zinc: "5.8mg",
    },
    healthBenefits: [
      "Rich in heart-healthy monounsaturated oleic acid",
      "High concentration of Copper & Zinc for immune defense",
      "Magnesium-dense for muscle recovery and nerve health",
      "Zero cholesterol and zero trans fats",
    ],
  },

  "split-cashews-tukda": {
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
      "Quick cooking incorporation with zero processing waste",
    ],
  },

  "walnuts": {
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
      "Potent polyphenols combat oxidative stress",
    ],
  },

  "pistachios": {
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
      potassium: "1025mg",
    },
    healthBenefits: [
      "Healthy guilt-free snack rich in protein and fiber",
      "Helps satiety and weight management",
      "High Potassium content supports muscle recovery",
      "Lutein & Zeaxanthin protect ocular health",
    ],
  },

  "raw-pista-giri": {
    grade: "Whole Kernel without Shell (Grade A++)",
    origin: "Herat, Afghanistan",
    processing: "Raw shelled green pistachios",
    ingredients: "100% Green Pistachio Kernels (Pista Giri)",
    shelfLife: "9 Months",
    storage: "Refrigerate after opening to maintain emerald green color.",
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
      "Zero added salt or oil processing",
    ],
  },

  "brazil-nuts": {
    grade: "Whole Shelled Jumbo Amazonian Kernels",
    origin: "Wild Rainforest, Bolivia & Brazil",
    processing: "Wild harvested, cold shelled",
    ingredients: "100% Raw Brazil Nuts",
    shelfLife: "9 Months",
    storage: "Keep in an airtight jar in a cool pantry.",
    flavorProfile: "Rich, dense, earthy and creamy texture",
    nutritionalPer100g: {
      energy: "659 kcal",
      protein: "14.3g",
      carbs: "12.3g",
      healthyFats: "67.1g",
      fiber: "7.5g",
      selenium: "1917mcg",
    },
    healthBenefits: [
      "Single nut provides 100%+ Daily Value of natural Selenium",
      "Supports thyroid gland function and metabolic regulation",
      "Potent antioxidant properties defend against cellular damage",
      "Rich in healthy monounsaturated and polyunsaturated fats",
    ],
  },

  "pecan-nuts": {
    grade: "Mammoth Whole Halves",
    origin: "Georgia, USA",
    processing: "Raw shelled pecan halves",
    ingredients: "100% Raw Pecan Kernels",
    shelfLife: "9 Months",
    storage: "Refrigerate for long-lasting crispness.",
    flavorProfile: "Naturally sweet, buttery, caramel-like note",
    nutritionalPer100g: {
      energy: "691 kcal",
      protein: "9.2g",
      carbs: "13.9g",
      healthyFats: "72.0g",
      fiber: "9.6g",
      potassium: "410mg",
    },
    healthBenefits: [
      "Ranked among top antioxidant-dense tree nuts",
      "Rich in oleic acid for cholesterol balance",
      "High fiber content supports digestive regularity",
      "Abundant in Zinc and Manganese for immunity",
    ],
  },

  /* ---------------------------- DRY FRUITS ---------------------------- */
  "blueberries": {
    grade: "Cultivated Highbush Plump Dried Blueberries",
    origin: "Oregon & Washington, USA",
    processing: "Infused & low-temperature dehydrated",
    ingredients: "Blueberries, Apple Juice Concentrate, Sunflower Oil",
    shelfLife: "12 Months",
    storage: "Store in a cool dry place.",
    flavorProfile: "Plump, sweet-tart berry explosion",
    nutritionalPer100g: {
      energy: "317 kcal",
      protein: "2.5g",
      carbs: "80.0g",
      healthyFats: "1.1g",
      fiber: "7.7g",
    },
    healthBenefits: [
      "Concentrated Anthocyanin antioxidants support brain & memory",
      "Promotes vascular elasticity and cardiac health",
      "Natural boost for skin radiance and eye stamina",
      "Delicious zero-fat snack for all ages",
    ],
  },

  "blackberries": {
    grade: "Wild Sun-Dried Blackberries",
    origin: "Pacific Northwest, USA",
    processing: "Sun-dried natural fruit",
    ingredients: "100% Whole Dried Blackberries",
    shelfLife: "9 Months",
    storage: "Keep in sealed packaging in a cool pantry.",
    flavorProfile: "Deep tangy-sweet berry richness",
    nutritionalPer100g: {
      energy: "298 kcal",
      protein: "4.0g",
      carbs: "71.2g",
      healthyFats: "1.5g",
      fiber: "13.5g",
    },
    healthBenefits: [
      "High dietary fiber content for optimal gut digestion",
      "Rich in Vitamin C and Vitamin K for bone strength",
      "Bioflavonoids combat free radical cellular stress",
    ],
  },

  "plum-standard": {
    grade: "Sun-Dried D'Ente Prunes",
    origin: "Agen, France / California",
    processing: "Natural pit-in solar dehydration",
    ingredients: "100% Sun-Dried Plums (Prunes)",
    shelfLife: "12 Months",
    storage: "Store in a cool dry pantry.",
    flavorProfile: "Deep caramel sweetness with chewy texture",
    nutritionalPer100g: {
      energy: "240 kcal",
      protein: "2.2g",
      carbs: "63.9g",
      healthyFats: "0.4g",
      fiber: "7.1g",
      potassium: "732mg",
    },
    healthBenefits: [
      "Sorbitol and high dietary fiber naturally support gut motility",
      "Boron mineral content strengthens bone density",
      "High Potassium aids healthy blood pressure levels",
    ],
  },

  "plum-premium": {
    grade: "Jumbo Pitted French Prunes",
    origin: "California, USA",
    processing: "Pitted jumbo dehydration",
    ingredients: "100% Pitted Dried Plums",
    shelfLife: "12 Months",
    storage: "Refrigerate after opening.",
    flavorProfile: "Luscious, soft, succulent caramel notes",
    nutritionalPer100g: {
      energy: "245 kcal",
      protein: "2.3g",
      carbs: "64.2g",
      healthyFats: "0.4g",
      fiber: "7.3g",
      potassium: "745mg",
    },
    healthBenefits: [
      "Pitted for effortless gourmet snacking and baking",
      "Rich in Vitamin K for blood clotting & bone health",
      "Antioxidant phenolic compounds protect cell integrity",
    ],
  },

  "figs": {
    grade: "Grade A++ Anjeer (Garland Size)",
    origin: "Izmir, Turkey & Kandahar",
    processing: "Sun-dried wild figs",
    ingredients: "100% Natural Dried Figs (Anjeer)",
    shelfLife: "9 Months",
    storage: "Store in a cool dry place. Soak in warm water overnight.",
    flavorProfile: "Naturally sweet with crunchy internal seeds",
    nutritionalPer100g: {
      energy: "249 kcal",
      protein: "3.3g",
      carbs: "63.9g",
      healthyFats: "0.9g",
      fiber: "9.8g",
      calcium: "162mg",
    },
    healthBenefits: [
      "Exceptional plant Calcium and Fiber source",
      "Traditional remedy for digestive regularity and stamina",
      "Iron content helps improve blood hemoglobin",
    ],
  },

  "raisins": {
    grade: "Seedless Green Kishmish",
    origin: "Sangli, Maharashtra, India",
    processing: "Shade-dried sweet green grapes",
    ingredients: "100% Pure Green Raisins",
    shelfLife: "9 Months",
    storage: "Keep in an airtight container.",
    flavorProfile: "Sweet, tangy and juicy chewiness",
    nutritionalPer100g: {
      energy: "299 kcal",
      protein: "3.1g",
      carbs: "79.2g",
      healthyFats: "0.5g",
      fiber: "3.7g",
      iron: "1.9mg",
    },
    healthBenefits: [
      "Natural fruit glucose for fast healthy energy",
      "Iron and B-complex vitamins support red blood cells",
      "Tartaric acid promotes gut digestive health",
    ],
  },

  /* --------------------------- SOLAR DRIED --------------------------- */
  "solar-mango": {
    grade: "Solar Dried Alphonso Strips",
    origin: "Ratnagiri, Maharashtra, India",
    processing: "100% Solar Dehydrated, Zero Sugar Added",
    ingredients: "100% Pure Alphonso Mango",
    shelfLife: "9 Months",
    storage: "Store sealed in a cool, dry place.",
    flavorProfile: "Intense tropical Alphonso flavor with chewy texture",
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

  "solar-pineapple": {
    grade: "Solar Dehydrated Queen Pineapple Rings",
    origin: "Meghalaya & Tripura, India",
    processing: "Solar dried slices, zero added sugar",
    ingredients: "100% Pure Solar Dried Pineapple",
    shelfLife: "9 Months",
    storage: "Store in a cool dry place.",
    flavorProfile: "Tangy sweet tropical chew with vibrant aroma",
    nutritionalPer100g: {
      energy: "285 kcal",
      protein: "2.8g",
      carbs: "73.5g",
      healthyFats: "0.5g",
      fiber: "5.5g",
    },
    healthBenefits: [
      "Contains natural Bromelain enzyme to aid protein digestion",
      "High Vitamin C boosts natural defense mechanisms",
      "Manganese rich for tissue and joint vitality",
    ],
  },

  "dried-kiwi-slices": {
    grade: "Solar Dehydrated Green Kiwi Coins",
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

  "sweet-dried-kiwi": {
    grade: "Lightly Glazed Kiwi Slices",
    origin: "Arunachal Pradesh, India",
    processing: "Dehydrated kiwi fruit slices",
    ingredients: "Kiwi Fruit, Cane Sugar",
    shelfLife: "9 Months",
    storage: "Store in sealed pouch.",
    flavorProfile: "Sweet, tangy candy-like chew",
    nutritionalPer100g: {
      energy: "310 kcal",
      protein: "1.8g",
      carbs: "74.0g",
      healthyFats: "0.5g",
      fiber: "6.2g",
    },
    healthBenefits: [
      "Refreshing sweet & sour fruit treat",
      "Rich in Vitamin C and natural fruit minerals",
      "Delicious alternative to synthetic gummy candies",
    ],
  },

  "honey-amla": {
    grade: "Wild Forest Honey Glazed Amla",
    origin: "Pratapgarh, Uttar Pradesh, India",
    processing: "Honey steeped & solar cured",
    ingredients: "Indian Gooseberry (Amla), Wild Forest Honey",
    shelfLife: "12 Months",
    storage: "Keep in a cool dry pantry.",
    flavorProfile: "Sweet, soothing with mild herbal tang",
    nutritionalPer100g: {
      energy: "260 kcal",
      protein: "1.2g",
      carbs: "64.0g",
      healthyFats: "0.2g",
      fiber: "5.2g",
    },
    healthBenefits: [
      "Highest natural Vitamin C fruit combined with raw honey",
      "Potent Rasayana Ayurvedic tonic for immunity & longevity",
      "Promotes hair root strength and digestive fire",
    ],
  },

  "jeera-amla": {
    grade: "Cumin-Spiced Solar Dried Amla Candy",
    origin: "Pratapgarh, UP, India",
    processing: "Solar dried with Cumin & Rock Salt",
    ingredients: "Amla, Roasted Cumin (Jeera), Himalayan Pink Salt, Black Salt",
    shelfLife: "9 Months",
    storage: "Keep in an airtight jar.",
    flavorProfile: "Zesty, salty, digestive spice note",
    nutritionalPer100g: {
      energy: "230 kcal",
      protein: "1.4g",
      carbs: "57.0g",
      healthyFats: "0.3g",
      fiber: "6.0g",
    },
    healthBenefits: [
      "Jeera (Cumin) stimulates digestive enzymes and relieves acidity",
      "Amla Vitamin C supports immune defense",
      "Great post-meal mouth cleanser and digestive aid",
    ],
  },

  "salt-amla": {
    grade: "Himalayan Pink Salt Cured Amla",
    origin: "Pratapgarh, UP, India",
    processing: "Sun cured with Pink Rock Salt",
    ingredients: "Amla Fruit, Himalayan Pink Salt",
    shelfLife: "9 Months",
    storage: "Store in a dry place.",
    flavorProfile: "Tangy, tart and salty crunch",
    nutritionalPer100g: {
      energy: "210 kcal",
      protein: "1.1g",
      carbs: "51.5g",
      healthyFats: "0.2g",
      fiber: "6.5g",
    },
    healthBenefits: [
      "Zero added white sugar — 100% natural fruit & mineral salt",
      "Supports liver detox and digestive metabolism",
      "Rich in ascorbic acid and trace minerals",
    ],
  },

  /* ------------------------------ SEEDS ------------------------------ */
  "seeds-chia": {
    grade: "Organic Black Salvia Hispanica Seeds",
    origin: "Madhya Pradesh, India / Mexico",
    processing: "Raw unheated mechanical triple-sifted",
    ingredients: "100% Organic Raw Chia Seeds",
    shelfLife: "12 Months",
    storage: "Store in a cool dry container. Soak in water for 15 minutes before consuming.",
    flavorProfile: "Mild, nutty, forms soft gel when soaked",
    nutritionalPer100g: {
      energy: "486 kcal",
      protein: "16.5g",
      carbs: "42.1g",
      healthyFats: "30.7g",
      fiber: "34.4g",
      calcium: "631mg",
      iron: "7.7mg",
    },
    healthBenefits: [
      "Over 34% dietary fiber expands to promote prolonged fullness",
      "Exceptional plant-based Omega-3 ALA fat content",
      "Calcium content exceeds milk by 5x per 100g",
      "Stabilizes blood sugar and aids weight management",
    ],
  },

  "seeds-flax": {
    grade: "Raw Golden Brown Linseeds",
    origin: "Madhya Pradesh, India",
    processing: "Raw cleaned seeds",
    ingredients: "100% Whole Flaxseed (Alsi)",
    shelfLife: "12 Months",
    storage: "Store in a cool dark container. Grind fresh for maximum absorption.",
    flavorProfile: "Earthy, nutty flavor",
    nutritionalPer100g: {
      energy: "534 kcal",
      protein: "18.3g",
      carbs: "28.9g",
      healthyFats: "42.2g",
      fiber: "27.3g",
    },
    healthBenefits: [
      "Highest plant source of Lignans for hormone balance",
      "Abundant in ALA Omega-3 fatty acids for arterial health",
      "Soluble mucilage fiber supports cholesterol reduction",
    ],
  },

  "seeds-haleem": {
    grade: "Pure Garden Cress Seeds (Chandrasur)",
    origin: "Rajasthan, India",
    processing: "Sun-dried natural seeds",
    ingredients: "100% Pure Garden Cress Seeds",
    shelfLife: "12 Months",
    storage: "Store sealed in a glass container.",
    flavorProfile: "Peppery, pungent, warming herbal note",
    nutritionalPer100g: {
      energy: "454 kcal",
      protein: "25.3g",
      carbs: "33.0g",
      healthyFats: "24.5g",
      fiber: "8.0g",
      iron: "100mg",
    },
    healthBenefits: [
      "Powerhouse Iron content (100mg/100g) naturally reverses anemia",
      "Promotes lactation in nursing mothers and hormonal balance",
      "25% plant protein supports muscle repair and stamina",
    ],
  },

  "seeds-sunflower": {
    grade: "Raw De-Hulled Sunflower Kernels",
    origin: "Karnataka, India",
    processing: "Air cleaned & machine hulled",
    ingredients: "100% Sunflower Seed Kernels",
    shelfLife: "9 Months",
    storage: "Store in an airtight container.",
    flavorProfile: "Mild, nutty, crisp chew",
    nutritionalPer100g: {
      energy: "584 kcal",
      protein: "20.8g",
      carbs: "20.0g",
      healthyFats: "51.5g",
      fiber: "8.6g",
      iron: "5.3mg",
    },
    healthBenefits: [
      "High Vitamin E and Selenium protect cell membranes",
      "Magnesium reduces fatigue and supports muscle relaxation",
      "Great additions to salads, breads, and trail mixes",
    ],
  },

  "seeds-pumpkin": {
    grade: "Raw AAA Grade Green Styrian Kernels",
    origin: "Madhya Pradesh, India / Austria",
    processing: "De-hulled raw green seeds",
    ingredients: "100% Raw Pumpkin Seeds (Kaddu Beej)",
    shelfLife: "9 Months",
    storage: "Keep in a cool dry pantry.",
    flavorProfile: "Nutty, earthy, crisp kernel crunch",
    nutritionalPer100g: {
      energy: "559 kcal",
      protein: "30.2g",
      carbs: "10.7g",
      healthyFats: "49.0g",
      fiber: "6.0g",
      iron: "8.8mg",
      zinc: "7.8mg",
    },
    healthBenefits: [
      "Over 30% plant protein for muscle growth and repair",
      "Abundant in Zinc for prostate, thyroid & immune strength",
      "Rich in Tryptophan amino acid for restful sleep",
    ],
  },

  "seeds-watermelon": {
    grade: "Raw White Magaz Kernels",
    origin: "Rajasthan, India",
    processing: "Hand-shelled raw seed kernels",
    ingredients: "100% Watermelon Seed Kernels (Tarbooz Magaz)",
    shelfLife: "9 Months",
    storage: "Store in a cool dry place.",
    flavorProfile: "Mild, sweet, buttery nutty note",
    nutritionalPer100g: {
      energy: "557 kcal",
      protein: "28.3g",
      carbs: "15.3g",
      healthyFats: "47.4g",
      fiber: "5.0g",
      iron: "7.3mg",
    },
    healthBenefits: [
      "High Micronutrients including Magnesium, Iron & Copper",
      "Citrulline content supports vascular blood flow",
      "Pure clean protein source for healthy snacking",
    ],
  },

  /* --------------------------- MIXES & MAKHANA --------------------------- */
  "phool-makhana": {
    grade: "Grade 6+ Extra Large Popped Foxnut",
    origin: "Darbhanga, Bihar, India",
    processing: "Hand-harvested & traditional wok popped",
    ingredients: "100% Raw Popped Foxnuts (Makhana)",
    shelfLife: "9 Months",
    storage: "Store in an airtight jar. Roast lightly in ghee for extra crispness.",
    flavorProfile: "Light, airy, crisp puff with neutral nutty note",
    nutritionalPer100g: {
      energy: "347 kcal",
      protein: "9.7g",
      carbs: "76.9g",
      healthyFats: "0.1g",
      fiber: "14.5g",
      calcium: "60mg",
    },
    healthBenefits: [
      "Virtually zero fat superfood with low glycemic index",
      "Astringent properties support kidney and heart health",
      "Kaempferol flavonoids slow cellular aging",
    ],
  },

  "power-trail-mix": {
    grade: "7-in-1 Superfood Trail Mix",
    origin: "Artisanal Blend, House of Nuts",
    processing: "Slow-roasted seeds & nuts with berries",
    ingredients: "Almonds, Cashews, Pumpkin Seeds, Sunflower Seeds, Chia, Cranberries, Blueberries",
    shelfLife: "6 Months",
    storage: "Keep in airtight pouch in a cool place.",
    flavorProfile: "Crunchy, sweet, savory & fruity balance",
    nutritionalPer100g: {
      energy: "512 kcal",
      protein: "19.5g",
      carbs: "32.0g",
      healthyFats: "38.5g",
      fiber: "12.8g",
    },
    healthBenefits: [
      "Balanced ratio of plant protein, healthy fats & antioxidants",
      "Perfect fuel for gym workouts, office energy & travel",
      "Zero refined sugar or artificial additives",
    ],
  },

  /* --------------------------- SPICES & HONEY --------------------------- */
  "saffron": {
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

  "wild-honey": {
    grade: "Raw Unfiltered Wild Forest Honey",
    origin: "Sundarbans & Western Ghats, India",
    processing: "Cold strained tribal forest harvest",
    ingredients: "100% Pure Wild Multi-Flora Honey",
    shelfLife: "24 Months",
    storage: "Store at room temperature. Do not refrigerate or microwave.",
    flavorProfile: "Complex floral aroma with deep amber sweetness",
    nutritionalPer100g: {
      energy: "304 kcal",
      protein: "0.3g",
      carbs: "82.4g",
      healthyFats: "0.0g",
      fiber: "0.0g",
    },
    healthBenefits: [
      "Contains live enzymes, wild pollen and propolis",
      "Natural antibacterial and throat-soothing elixir",
      "Clean natural energy source with lower GI than refined sugar",
    ],
  },

  /* --------------------------- GOURMET FLAVORS --------------------------- */
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

  /* --------------------------- STUFFED DATES --------------------------- */
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

  /* ------------------------- SIGNATURE SOLAR DRIED ------------------------- */
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

  /* --------------------------- CHOCOLATES & GIFTING --------------------------- */
  "dark-chocolate-almond-rocks": {
    grade: "70% Single-Origin Dark Chocolate Covered Almonds",
    origin: "Ghanaian Cocoa & California Almonds",
    processing: "Roasted almonds tumbled in dark chocolate",
    ingredients: "Roasted Almonds, Cocoa Mass, Cocoa Butter, Raw Cane Sugar, Sea Salt",
    shelfLife: "6 Months",
    storage: "Store in a cool dry place below 22°C.",
    flavorProfile: "Deep bitter-sweet cocoa shell with crunchy toasted almond core",
    nutritionalPer100g: {
      energy: "545 kcal",
      protein: "14.2g",
      carbs: "46.5g",
      healthyFats: "36.8g",
      fiber: "9.2g",
    },
    healthBenefits: [
      "Rich in Cocoa Flavonoids for arterial vasodilation & heart health",
      "Combines brain-boosting Vitamin E with mood-elevating cacao",
      "Satisfying decadent treat with lower sugar than milk chocolate",
    ],
  },

  "royal-gifting-box": {
    grade: "Heritage Handcrafted Keepsake Gift Box",
    origin: "Artisanal House of Nuts Collection",
    processing: "Hand-assembled gourmet jars",
    ingredients: "California Almonds, Jumbo Cashews, Roasted Pistachios, Medjool Dates",
    shelfLife: "9 Months",
    storage: "Keep in a cool dark dry place.",
    flavorProfile: "Luxurious variety of rich nuttiness and fruit caramel sweetness",
    nutritionalPer100g: {
      energy: "520 kcal",
      protein: "16.5g",
      carbs: "35.0g",
      healthyFats: "39.0g",
      fiber: "9.5g",
    },
    healthBenefits: [
      "100% premium quality hand-selected dry fruits & nuts",
      "Hygienically vacuum sealed jars retain peak orchard freshness",
      "Thoughtful healthy gift choice for festivities, weddings & corporate events",
    ],
  },
};

/**
 * Get detailed specifications for any product with intelligent fallbacks.
 */
export function getProductSpecification(productId: string, category: string, name: string): ProductSpecification {
  // 1. First priority: Dynamic override specs fetched from Google Sheets ProductSpecs tab
  if (DYNAMIC_SPECS_CACHE[productId]) {
    return DYNAMIC_SPECS_CACHE[productId];
  }

  // 2. Second priority: Pre-populated static Wikipedia/USDA authentic product dictionary
  if (DEFAULT_PRODUCT_SPECS[productId]) {
    return DEFAULT_PRODUCT_SPECS[productId];
  }

  // 3. Fallback for dynamically added custom admin items
  const isNuts = category === "nuts" || category === "flavored-nuts";
  const isDryFruits = category === "dry-fruits" || category === "stuffed-dates";
  const isSeeds = category === "seeds";
  const isSpices = category === "spices";
  const isHoney = category === "honey";
  const isSolar = category === "solar-dried";

  return {
    grade: "Grade A Premium Quality",
    origin: isNuts ? "Hand-selected from top orchards" : isSpices ? "Pampore / Western Ghats, India" : "Verified Sustainable Farm",
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
      `100% pure and authentic ${name} with zero artificial additives`,
      "Packed with essential vitamins, minerals and dietary fiber",
      "Sourced directly from verified growers and farm cooperations",
      "Hygienically sorted and sealed for peak orchard freshness",
    ],
  };
}
