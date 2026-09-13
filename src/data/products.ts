export interface ProductVariant {
  size: string;
  price: number;
  /** Compare-at / MRP price shown struck through. Optional. */
  mrp?: number;
  id: string;
}

export interface Product {
  id: string;
  name: string;
  /** Local / Hindi name shown as a small chip on the card, e.g. "Badam". */
  localName?: string;
  category: "nuts" | "dry-fruits" | "spices" | "honey" | "solar-dried" | "seeds" | "chocolates" | "mixes" | "gifting" | (string & {});
  subcategory?: string;
  description: string;
  image: string;
  images?: string[];
  variants: ProductVariant[];
  badge?: string;
}

export const categories = [
  { id: "all", label: "All" },
  { id: "nuts", label: "Nuts" },
  { id: "dry-fruits", label: "Dry Fruits" },
  { id: "solar-dried", label: "Solar Dried" },
  { id: "seeds", label: "Seeds" },
  { id: "mixes", label: "Trail Mixes" },
  { id: "chocolates", label: "Chocolates" },
  { id: "spices", label: "Spices" },
  { id: "honey", label: "Honey" },
  { id: "gifting", label: "Gift Boxes" },
] as const;

const IMG = "/images/catalog";

export const products: Product[] = [
  /* ------------------------------- NUTS ------------------------------- */
  {
    id: "california-almonds",
    name: "California Almonds",
    localName: "Badam",
    category: "nuts",
    description: "Crunchy, hand-sorted California almonds — everyday health staple",
    image: `${IMG}/almonds.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "cal-almond-250", size: "250g", price: 299, mrp: 390 },
      { id: "cal-almond-500", size: "500g", price: 579, mrp: 750 },
      { id: "cal-almond-1kg", size: "1 Kg", price: 1100, mrp: 1450 },
    ],
  },
  {
    id: "mamra-almonds",
    name: "Mamra Almonds",
    localName: "Mamra Badam",
    category: "nuts",
    description: "Premium oil-rich Mamra almonds from high-altitude valleys",
    image: `${IMG}/mamra-almonds.jpg`,
    badge: "Premium",
    variants: [
      { id: "mamra-250", size: "250g", price: 349, mrp: 460 },
      { id: "mamra-500", size: "500g", price: 679, mrp: 890 },
      { id: "mamra-1kg", size: "1 Kg", price: 1300, mrp: 1699 },
    ],
  },
  {
    id: "cashews-w320",
    name: "Whole Cashews W320",
    localName: "Kaju",
    category: "nuts",
    description: "Whole premium grade W320 cashews, rich, creamy and buttery",
    image: `${IMG}/cashews.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "cashew-250", size: "250g", price: 259, mrp: 340 },
      { id: "cashew-500", size: "500g", price: 499, mrp: 650 },
      { id: "cashew-1kg", size: "1 Kg", price: 950, mrp: 1250 },
    ],
  },
  {
    id: "jumbo-cashews",
    name: "Jumbo Premium Cashews",
    localName: "Jumbo Kaju",
    category: "nuts",
    description: "Hand-picked jumbo cashews with exceptionally rich crunch",
    image: `${IMG}/cashews.jpg`,
    badge: "Premium",
    variants: [
      { id: "jumbo-cashew-250", size: "250g", price: 279, mrp: 360 },
      { id: "jumbo-cashew-500", size: "500g", price: 529, mrp: 690 },
      { id: "jumbo-cashew-1kg", size: "1 Kg", price: 1000, mrp: 1299 },
    ],
  },
  {
    id: "walnuts",
    name: "Walnut Kernels",
    localName: "Akhrot",
    category: "nuts",
    description: "Light Chilean & Kashmiri walnut halves, rich in omega-3",
    image: `${IMG}/walnuts.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "walnut-250", size: "250g", price: 449, mrp: 580 },
      { id: "walnut-500", size: "500g", price: 879, mrp: 1150 },
      { id: "walnut-1kg", size: "1 Kg", price: 1700, mrp: 2199 },
    ],
  },
  {
    id: "pistachios",
    name: "Roasted & Salted Pistachios",
    localName: "Pista",
    category: "nuts",
    description: "Naturally opened pistachios, dry-roasted and lightly salted",
    image: `${IMG}/pistachios.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "pista-250", size: "250g", price: 479, mrp: 620 },
      { id: "pista-500", size: "500g", price: 929, mrp: 1200 },
      { id: "pista-1kg", size: "1 Kg", price: 1800, mrp: 2350 },
    ],
  },
  {
    id: "brazil-nuts",
    name: "Brazil Nuts",
    localName: "Brazil Nuts",
    category: "nuts",
    description: "Selenium-rich Amazonian kernels, raw, whole, and crisp",
    image: `${IMG}/brazil-nuts.jpg`,
    badge: "Exotic",
    variants: [
      { id: "brazil-250", size: "250g", price: 899, mrp: 1150 },
      { id: "brazil-500", size: "500g", price: 1749, mrp: 2250 },
      { id: "brazil-1kg", size: "1 Kg", price: 3400, mrp: 4200 },
    ],
  },
  {
    id: "pecan-nuts",
    name: "Pecan Nuts",
    localName: "Pecan",
    category: "nuts",
    description: "Buttery raw pecan halves, rich in antioxidants and healthy fats",
    image: `${IMG}/pecan-nuts.png`,
    badge: "Gourmet",
    variants: [
      { id: "pecan-250", size: "250g", price: 399, mrp: 520 },
      { id: "pecan-500", size: "500g", price: 779, mrp: 999 },
      { id: "pecan-1kg", size: "1 Kg", price: 1500, mrp: 1899 },
    ],
  },

  /* ---------------------------- DRY FRUITS ---------------------------- */
  {
    id: "blueberries",
    name: "Dried Blueberries",
    localName: "Blueberry",
    category: "dry-fruits",
    description: "Plump wild blueberries dried to sweet perfection — packed with antioxidants",
    image: `${IMG}/blueberry.png`,
    badge: "Superfood",
    variants: [
      { id: "blueberry-250", size: "250g", price: 419, mrp: 520 },
      { id: "blueberry-500", size: "500g", price: 799, mrp: 999 },
      { id: "blueberry-1kg", size: "1 Kg", price: 1500, mrp: 1899 },
    ],
  },
  {
    id: "blackberries",
    name: "Dried Blackberries",
    localName: "Blackberry",
    category: "dry-fruits",
    description: "Juicy sun-dried blackberries with rich berry flavor",
    image: `${IMG}/blackberry.png`,
    badge: "Exotic",
    variants: [
      { id: "blackberry-250", size: "250g", price: 299, mrp: 390 },
      { id: "blackberry-500", size: "500g", price: 579, mrp: 750 },
      { id: "blackberry-1kg", size: "1 Kg", price: 1100, mrp: 1450 },
    ],
  },
  {
    id: "plum-standard",
    name: "Sun-Dried Plum",
    localName: "Plum",
    category: "dry-fruits",
    description: "Naturally sweet and chewy sun-dried plums (prunes), high in dietary fiber",
    image: `${IMG}/plum.png`,
    variants: [
      { id: "plum-std-250", size: "250g", price: 139, mrp: 180 },
      { id: "plum-std-500", size: "500g", price: 269, mrp: 350 },
      { id: "plum-std-1kg", size: "1 Kg", price: 500, mrp: 650 },
    ],
  },
  {
    id: "plum-premium",
    name: "Jumbo Premium Dried Plum",
    localName: "Jumbo Plum",
    category: "dry-fruits",
    description: "Hand-selected large moist dried plums, rich and succulent",
    image: `${IMG}/plum.png`,
    badge: "Premium",
    variants: [
      { id: "plum-prem-250", size: "250g", price: 219, mrp: 290 },
      { id: "plum-prem-500", size: "500g", price: 419, mrp: 550 },
      { id: "plum-prem-1kg", size: "1 Kg", price: 800, mrp: 1050 },
    ],
  },
  {
    id: "figs",
    name: "Premium Dried Figs",
    localName: "Anjeer",
    category: "dry-fruits",
    description: "Plump, seed-rich Afghan figs — high fiber and natural sweetness",
    image: `${IMG}/anjeer.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "figs-250", size: "250g", price: 279, mrp: 360 },
      { id: "figs-500", size: "500g", price: 529, mrp: 690 },
      { id: "figs-1kg", size: "1 Kg", price: 1000, mrp: 1299 },
    ],
  },
  {
    id: "raisins",
    name: "Green Seedless Raisins",
    localName: "Kishmish",
    category: "dry-fruits",
    description: "Long golden green seedless raisins, sweet and juicy",
    image: `${IMG}/raisins.jpg`,
    variants: [
      { id: "raisins-250", size: "250g", price: 169, mrp: 220 },
      { id: "raisins-500", size: "500g", price: 319, mrp: 420 },
      { id: "raisins-1kg", size: "1 Kg", price: 600, mrp: 800 },
    ],
  },

  /* ----------------------------- SOLAR DRIED ---------------------------- */
  {
    id: "solar-mango",
    name: "Solar Dried Mango",
    localName: "Aam",
    category: "solar-dried",
    description: "Sun-kissed dried mango slices, 100% natural fruit energy",
    image: `${IMG}/dried-mango.png`,
    badge: "Solar Dried",
    variants: [
      { id: "smango-250", size: "250g", price: 179, mrp: 230 },
      { id: "smango-500", size: "500g", price: 349, mrp: 450 },
      { id: "smango-1kg", size: "1 Kg", price: 660, mrp: 850 },
    ],
  },
  {
    id: "solar-pineapple",
    name: "Solar Dried Pineapple",
    localName: "Ananas",
    category: "solar-dried",
    description: "Chewy tropical pineapple rings dried under open sun",
    image: `${IMG}/dried-pineapple.png`,
    badge: "Solar Dried",
    variants: [
      { id: "spine-250", size: "250g", price: 169, mrp: 220 },
      { id: "spine-500", size: "500g", price: 319, mrp: 420 },
      { id: "spine-1kg", size: "1 Kg", price: 600, mrp: 800 },
    ],
  },
  {
    id: "dried-kiwi-slices",
    name: "Dried Kiwi",
    localName: "Kiwi",
    category: "solar-dried",
    description: "Tangy dried kiwi wheels preserving natural green goodness",
    image: `${IMG}/dried-kiwi.jpg`,
    variants: [
      { id: "kiwi-250", size: "250g", price: 169, mrp: 220 },
      { id: "kiwi-500", size: "500g", price: 319, mrp: 420 },
      { id: "kiwi-1kg", size: "1 Kg", price: 600, mrp: 800 },
    ],
  },
  {
    id: "sweet-dried-kiwi",
    name: "Sweet Dried Kiwi",
    localName: "Sweet Kiwi",
    category: "solar-dried",
    description: "Sweetened kiwi slices with a delicious chewy bite",
    image: `${IMG}/sweet-kiwi.png`,
    badge: "Popular",
    variants: [
      { id: "sweet-kiwi-250", size: "250g", price: 159, mrp: 200 },
      { id: "sweet-kiwi-500", size: "500g", price: 299, mrp: 390 },
      { id: "sweet-kiwi-1kg", size: "1 Kg", price: 560, mrp: 750 },
    ],
  },
  {
    id: "honey-amla",
    name: "Honey Amla",
    localName: "Honey Amla",
    category: "solar-dried",
    description: "Wild honey dipped Indian gooseberry (Amla) candy — immunity booster",
    image: `${IMG}/honey-amla.png`,
    badge: "Health Special",
    variants: [
      { id: "amla-hny-250", size: "250g", price: 119, mrp: 150 },
      { id: "amla-hny-500", size: "500g", price: 219, mrp: 280 },
      { id: "amla-hny-1kg", size: "1 Kg", price: 400, mrp: 520 },
    ],
  },
  {
    id: "jeera-amla",
    name: "Jeera Amla",
    localName: "Jeera Amla",
    category: "solar-dried",
    description: "Cumin and herbal spice infused digestive Amla mouth freshener",
    image: `${IMG}/jeera-amla.png`,
    variants: [
      { id: "amla-jr-250", size: "250g", price: 119, mrp: 150 },
      { id: "amla-jr-500", size: "500g", price: 219, mrp: 280 },
      { id: "amla-jr-1kg", size: "1 Kg", price: 400, mrp: 520 },
    ],
  },
  {
    id: "salt-amla",
    name: "Salt Amla",
    localName: "Namkeen Amla",
    category: "solar-dried",
    description: "Rock salt seasoned sun-dried Amla pieces, tangy & refreshing",
    image: `${IMG}/salt-amla.png`,
    variants: [
      { id: "amla-slt-250", size: "250g", price: 129, mrp: 170 },
      { id: "amla-slt-500", size: "500g", price: 239, mrp: 310 },
      { id: "amla-slt-1kg", size: "1 Kg", price: 450, mrp: 590 },
    ],
  },

  /* ------------------------------- SEEDS ------------------------------- */
  {
    id: "seeds-chia",
    name: "Organic Chia Seeds",
    localName: "Chia",
    category: "seeds",
    description: "Omega-3 rich raw black chia seeds for smoothies and wellness",
    image: `${IMG}/chia.jpg`,
    badge: "Superfood",
    variants: [
      { id: "schia-250", size: "250g", price: 99, mrp: 130 },
      { id: "schia-500", size: "500g", price: 189, mrp: 250 },
      { id: "schia-1kg", size: "1 Kg", price: 360, mrp: 480 },
    ],
  },
  {
    id: "seeds-flax",
    name: "Organic Flax Seeds",
    localName: "Alsi",
    category: "seeds",
    description: "Nutritious brown flax seeds (Alsi), packed with fiber & lignans",
    image: `${IMG}/flax-seeds.png`,
    variants: [
      { id: "sflax-250", size: "250g", price: 79, mrp: 100 },
      { id: "sflax-500", size: "500g", price: 139, mrp: 180 },
      { id: "sflax-1kg", size: "1 Kg", price: 250, mrp: 340 },
    ],
  },
  {
    id: "seeds-haleem",
    name: "Haleem Seeds",
    localName: "Garden Cress",
    category: "seeds",
    description: "Iron-rich Garden Cress (Haleem / Chandrasur) seeds for vitality",
    image: `${IMG}/haleem-seeds.png`,
    variants: [
      { id: "shaleem-250", size: "250g", price: 89, mrp: 120 },
      { id: "shaleem-500", size: "500g", price: 169, mrp: 220 },
      { id: "shaleem-1kg", size: "1 Kg", price: 320, mrp: 420 },
    ],
  },
  {
    id: "seeds-sunflower",
    name: "Sunflower Seeds",
    localName: "Sunflower",
    category: "seeds",
    description: "Hulled raw sunflower seed kernels for snacking and baking",
    image: `${IMG}/sunflower-seeds.png`,
    variants: [
      { id: "ssun-250", size: "250g", price: 79, mrp: 100 },
      { id: "ssun-500", size: "500g", price: 139, mrp: 180 },
      { id: "ssun-1kg", size: "1 Kg", price: 250, mrp: 340 },
    ],
  },
  {
    id: "seeds-pumpkin",
    name: "Pumpkin Seeds",
    localName: "Kaddu",
    category: "seeds",
    description: "Shelled green pepita pumpkin seeds, rich in zinc and magnesium",
    image: `${IMG}/pumpkin-seeds.jpg`,
    variants: [
      { id: "spumpkin-250", size: "250g", price: 179, mrp: 230 },
      { id: "spumpkin-500", size: "500g", price: 339, mrp: 440 },
      { id: "spumpkin-1kg", size: "1 Kg", price: 650, mrp: 850 },
    ],
  },
  {
    id: "seeds-watermelon",
    name: "Watermelon Seeds",
    localName: "Tarbooza / Magaz",
    category: "seeds",
    description: "Hand-peeled white magaz watermelon seed kernels",
    image: `${IMG}/chia.jpg`,
    variants: [
      { id: "swater-250", size: "250g", price: 189, mrp: 250 },
      { id: "swater-500", size: "500g", price: 369, mrp: 480 },
      { id: "swater-1kg", size: "1 Kg", price: 700, mrp: 900 },
    ],
  },

  /* ---------------------------- TRAIL MIXES & MAKHANA ---------------------------- */
  {
    id: "phool-makhana",
    name: "Phool Makhana",
    localName: "Makhana",
    category: "mixes",
    description: "Crisp raw puffed lotus seeds — low calorie, high protein snack",
    image: `${IMG}/makhana.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "mak-raw-250", size: "250g", price: 279, mrp: 360 },
      { id: "mak-raw-500", size: "500g", price: 529, mrp: 690 },
      { id: "mak-raw-1kg", size: "1 Kg", price: 1000, mrp: 1299 },
    ],
  },
  {
    id: "power-trail-mix",
    name: "Power Trail Mix",
    category: "mixes",
    description: "Mamra almonds, pistachios, cashews, cranberries & pumpkin seeds",
    image: `${IMG}/trail-mix.jpg`,
    variants: [
      { id: "mix-power-250", size: "250g", price: 329, mrp: 420 },
      { id: "mix-power-500", size: "500g", price: 629, mrp: 810 },
      { id: "mix-power-1kg", size: "1 Kg", price: 1199, mrp: 1550 },
    ],
  },

  /* ------------------------------ SPICES ------------------------------ */
  {
    id: "saffron",
    name: "Kashmiri Mongra Saffron",
    localName: "Kesar",
    category: "spices",
    description: "Deep-red Mongra threads, high crocin, hand-picked",
    image: "/images/spices/spices-hero.png",
    badge: "Rare",
    variants: [
      { id: "saffron-1g", size: "1g", price: 499, mrp: 649 },
      { id: "saffron-2g", size: "2g", price: 949, mrp: 1250 },
      { id: "saffron-5g", size: "5g", price: 2199, mrp: 2899 },
    ],
  },

  /* ------------------------------- HONEY ------------------------------- */
  {
    id: "wild-honey",
    name: "Wild Forest Honey",
    localName: "Shahad",
    category: "honey",
    description: "Raw, unheated multi-floral honey from forest hives",
    image: "/images/honey/wild-honey-hero.png",
    badge: "Organic",
    variants: [
      { id: "honey-250", size: "250ml", price: 349, mrp: 450 },
      { id: "honey-500", size: "500ml", price: 649, mrp: 850 },
      { id: "honey-1l", size: "1 Litre", price: 1199, mrp: 1550 },
    ],
  },

  /* ----------------------------- CHOCOLATES ---------------------------- */
  {
    id: "dark-chocolate-almond-rocks",
    name: "Dark Chocolate Almond Rocks",
    category: "chocolates",
    description: "70% dark Belgian chocolate loaded with roasted almonds",
    image: "/images/chocolates/godiva-dark-truffe.png",
    badge: "Bestseller",
    variants: [
      { id: "choco-alm-200", size: "200g", price: 399, mrp: 520 },
      { id: "choco-alm-400", size: "400g", price: 749, mrp: 970 },
    ],
  },

  /* ------------------------------ GIFTING ------------------------------ */
  {
    id: "royal-gifting-box",
    name: "Royal Celebration Gift Box",
    category: "gifting",
    description: "Wooden keepsake box with tins of almonds, cashews, pista & saffron",
    image: "/images/gifting/gift-box-classic.jpg",
    badge: "Gift Special",
    variants: [
      { id: "gift-royal-small", size: "4 x 200g", price: 1499, mrp: 1899 },
      { id: "gift-royal-large", size: "4 x 400g", price: 2799, mrp: 3599 },
    ],
  },
];
