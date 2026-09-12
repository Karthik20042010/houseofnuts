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
  { id: "chocolates", label: "Chocolates" },
  { id: "mixes", label: "Trail Mixes" },
  { id: "gifting", label: "Gift Boxes" },
  { id: "spices", label: "Spices" },
  { id: "honey", label: "Honey" },
  { id: "seeds", label: "Seeds" },
  { id: "solar-dried", label: "Solar Dried" },
] as const;

const IMG = "/images/catalog";

export const products: Product[] = [
  /* ------------------------------- NUTS ------------------------------- */
  {
    id: "california-almonds",
    name: "California Almonds",
    localName: "Badam",
    category: "nuts",
    description: "Crunchy, hand-sorted California almonds — the everyday health staple",
    image: `${IMG}/almonds.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "cal-almond-250", size: "250g", price: 349, mrp: 450 },
      { id: "cal-almond-500", size: "500g", price: 649, mrp: 850 },
      { id: "cal-almond-1kg", size: "1 Kg", price: 1199, mrp: 1550 },
    ],
  },
  {
    id: "mamra-almonds",
    name: "Mamra Almonds",
    localName: "Mamra Badam",
    category: "nuts",
    description: "Premium oil-rich almonds from high-altitude valleys",
    image: `${IMG}/mamra-almonds.jpg`,
    badge: "Premium",
    variants: [
      { id: "mamra-250", size: "250g", price: 499, mrp: 649 },
      { id: "mamra-500", size: "500g", price: 899, mrp: 1199 },
      { id: "mamra-1kg", size: "1 Kg", price: 1699, mrp: 2199 },
    ],
  },
  {
    id: "roasted-almonds",
    name: "Roasted Almonds",
    localName: "Badam",
    category: "nuts",
    description: "Dry-roasted almonds, no oil — deep nutty crunch",
    image: `${IMG}/roasted-almonds.jpg`,
    variants: [
      { id: "rst-almond-250", size: "250g", price: 369, mrp: 475 },
      { id: "rst-almond-500", size: "500g", price: 689, mrp: 890 },
    ],
  },
  {
    id: "salted-almonds",
    name: "Roasted & Salted Almonds",
    localName: "Badam",
    category: "nuts",
    description: "Roasted almonds finished with a whisper of pink salt",
    image: `${IMG}/salted-almonds.jpg`,
    variants: [
      { id: "slt-almond-250", size: "250g", price: 374, mrp: 480 },
      { id: "slt-almond-500", size: "500g", price: 699, mrp: 899 },
    ],
  },
  {
    id: "cashews-w320",
    name: "Whole Cashews W320",
    localName: "Kaju",
    category: "nuts",
    description: "Whole premium grade W320 cashews, creamy and buttery",
    image: `${IMG}/cashews.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "cashew-250", size: "250g", price: 399, mrp: 520 },
      { id: "cashew-500", size: "500g", price: 749, mrp: 980 },
      { id: "cashew-1kg", size: "1 Kg", price: 1399, mrp: 1820 },
    ],
  },
  {
    id: "roasted-cashews",
    name: "Roasted Cashews",
    localName: "Kaju",
    category: "nuts",
    description: "Slow-roasted W320 cashews with a golden crunch",
    image: `${IMG}/roasted-cashews.jpg`,
    variants: [
      { id: "rst-cashew-250", size: "250g", price: 419, mrp: 545 },
      { id: "rst-cashew-500", size: "500g", price: 789, mrp: 1025 },
    ],
  },
  {
    id: "salted-cashews",
    name: "Roasted & Salted Cashews",
    localName: "Kaju",
    category: "nuts",
    description: "Roasted cashews tossed in fine sea salt",
    image: `${IMG}/salted-cashews.jpg`,
    variants: [
      { id: "slt-cashew-250", size: "250g", price: 419, mrp: 545 },
      { id: "slt-cashew-500", size: "500g", price: 789, mrp: 1025 },
    ],
  },
  {
    id: "fried-cashews",
    name: "Fried & Salted Cashews",
    localName: "Kaju",
    category: "nuts",
    description: "Kettle-fried cashews, salted while warm — snack-shop classic",
    image: `${IMG}/fried-cashews.jpg`,
    variants: [
      { id: "fry-cashew-250", size: "250g", price: 429, mrp: 559 },
      { id: "fry-cashew-500", size: "500g", price: 809, mrp: 1050 },
    ],
  },
  {
    id: "masala-cashews",
    name: "Masala Cashews",
    localName: "Kaju",
    category: "nuts",
    description: "Jumbo cashews wok-tossed with garam masala & pink salt",
    image: `${IMG}/masala-cashews.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "cashew-masala-250", size: "250g", price: 439, mrp: 570 },
      { id: "cashew-masala-500", size: "500g", price: 829, mrp: 1075 },
    ],
  },
  {
    id: "pistachios",
    name: "Roasted & Salted Pistachios",
    localName: "Pista",
    category: "nuts",
    description: "Naturally opened pistachios, roasted and lightly salted",
    image: `${IMG}/pistachios.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "pista-250", size: "250g", price: 549, mrp: 699 },
      { id: "pista-500", size: "500g", price: 1049, mrp: 1349 },
      { id: "pista-1kg", size: "1 Kg", price: 1999, mrp: 2599 },
    ],
  },
  {
    id: "plain-pistachios",
    name: "Plain Pistachios",
    localName: "Pista",
    category: "nuts",
    description: "Unsalted, unroasted pistachio kernels in shell",
    image: `${IMG}/plain-pistachios.jpg`,
    variants: [
      { id: "plain-pista-250", size: "250g", price: 519, mrp: 659 },
      { id: "plain-pista-500", size: "500g", price: 989, mrp: 1259 },
    ],
  },
  {
    id: "roasted-pistachios",
    name: "Roasted Pistachios",
    localName: "Pista",
    category: "nuts",
    description: "Dry-roasted pistachios without added salt",
    image: `${IMG}/roasted-pistachios.jpg`,
    variants: [
      { id: "rst-pista-250", size: "250g", price: 539, mrp: 685 },
      { id: "rst-pista-500", size: "500g", price: 1029, mrp: 1309 },
    ],
  },
  {
    id: "walnuts",
    name: "Kashmiri Walnut Kernels",
    localName: "Akhrot",
    category: "nuts",
    description: "Light halves from Himalayan orchards, freshly shelled",
    image: `${IMG}/walnuts.jpg`,
    variants: [
      { id: "walnut-250", size: "250g", price: 599, mrp: 750 },
      { id: "walnut-500", size: "500g", price: 1149, mrp: 1450 },
      { id: "walnut-1kg", size: "1 Kg", price: 2199, mrp: 2799 },
    ],
  },
  {
    id: "roasted-walnuts",
    name: "Roasted Walnuts",
    localName: "Akhrot",
    category: "nuts",
    description: "Oven-roasted walnut halves — less bitter, more aroma",
    image: `${IMG}/roasted-walnuts.jpg`,
    variants: [
      { id: "rst-walnut-250", size: "250g", price: 624, mrp: 780 },
      { id: "rst-walnut-500", size: "500g", price: 1199, mrp: 1499 },
    ],
  },
  {
    id: "honey-walnuts",
    name: "Honey-Glazed Walnuts",
    localName: "Akhrot",
    category: "nuts",
    description: "Walnut halves coated in wild honey & toasted sesame",
    image: `${IMG}/honey-walnuts.jpg`,
    badge: "Gourmet",
    variants: [
      { id: "walnut-honey-250", size: "250g", price: 644, mrp: 800 },
      { id: "walnut-honey-500", size: "500g", price: 1239, mrp: 1550 },
    ],
  },
  {
    id: "brazil-nuts",
    name: "Brazil Nuts",
    category: "nuts",
    description: "Selenium-rich Amazonian kernels, raw and whole",
    image: `${IMG}/brazil-nuts.jpg`,
    variants: [
      { id: "brazil-250", size: "250g", price: 699, mrp: 899 },
      { id: "brazil-500", size: "500g", price: 1349, mrp: 1749 },
    ],
  },
  {
    id: "chilgoza-pine-nuts",
    name: "Chilgoza (Pine Nuts)",
    localName: "Chilgoza",
    category: "nuts",
    description: "Rare Himalayan pine nuts, hand-collected and shelled",
    image: `${IMG}/chilgoza.jpg`,
    badge: "Rare",
    variants: [
      { id: "chilgoza-100", size: "100g", price: 899, mrp: 1150 },
      { id: "chilgoza-250", size: "250g", price: 2149, mrp: 2799 },
    ],
  },
  {
    id: "roasted-makhana",
    name: "Roasted Foxnuts",
    localName: "Makhana",
    category: "nuts",
    description: "Crisp slow-roasted lotus seeds — guilt-free munching",
    image: `${IMG}/makhana.jpg`,
    variants: [
      { id: "mak-plain-100", size: "100g", price: 229, mrp: 300 },
      { id: "mak-plain-250", size: "250g", price: 429, mrp: 560 },
    ],
  },
  {
    id: "salted-makhana",
    name: "Salted Makhana",
    localName: "Makhana",
    category: "nuts",
    description: "Roasted foxnuts with ghee and rock salt",
    image: `${IMG}/salted-makhana.jpg`,
    variants: [
      { id: "mak-salt-100", size: "100g", price: 244, mrp: 320 },
      { id: "mak-salt-250", size: "250g", price: 459, mrp: 599 },
    ],
  },
  {
    id: "peri-peri-makhana",
    name: "Peri-Peri Makhana",
    localName: "Makhana",
    category: "nuts",
    description: "Slow-roasted lotus seeds tossed in tangy peri-peri",
    image: `${IMG}/peri-peri-makhana.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "mak-peri-100", size: "100g", price: 254, mrp: 330 },
      { id: "mak-peri-250", size: "250g", price: 479, mrp: 620 },
    ],
  },
  {
    id: "cheese-makhana",
    name: "Cheese Makhana",
    localName: "Makhana",
    category: "nuts",
    description: "Foxnuts dusted with tangy cheddar cheese seasoning",
    image: `${IMG}/cheese-makhana.jpg`,
    variants: [
      { id: "mak-cheese-100", size: "100g", price: 254, mrp: 330 },
      { id: "mak-cheese-250", size: "250g", price: 479, mrp: 620 },
    ],
  },

  /* ---------------------------- DRY FRUITS ---------------------------- */
  {
    id: "dates-medjool",
    name: "Medjool Dates",
    localName: "Khajoor",
    category: "dry-fruits",
    description: "Large, caramel-soft Medjool dates — nature's toffee",
    image: `${IMG}/dates.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "dates-250", size: "250g", price: 449, mrp: 580 },
      { id: "dates-500", size: "500g", price: 849, mrp: 1099 },
      { id: "dates-1kg", size: "1 Kg", price: 1599, mrp: 2050 },
    ],
  },
  {
    id: "figs",
    name: "Premium Dried Figs",
    localName: "Anjeer",
    category: "dry-fruits",
    description: "Plump, seed-rich Afghan figs — high fibre and iron",
    image: `${IMG}/anjeer.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "figs-250", size: "250g", price: 549, mrp: 699 },
      { id: "figs-500", size: "500g", price: 1049, mrp: 1349 },
    ],
  },
  {
    id: "raisins",
    name: "Golden Seedless Raisins",
    localName: "Kishmish",
    category: "dry-fruits",
    description: "Long golden seedless raisins, naturally sweet",
    image: `${IMG}/raisins.jpg`,
    variants: [
      { id: "raisins-250", size: "250g", price: 199, mrp: 260 },
      { id: "raisins-500", size: "500g", price: 369, mrp: 480 },
      { id: "raisins-1kg", size: "1 Kg", price: 689, mrp: 899 },
    ],
  },
  {
    id: "black-raisins",
    name: "Black Seedless Raisins",
    localName: "Kali Kishmish",
    category: "dry-fruits",
    description: "Sun-dried seedless black raisins, packed with iron",
    image: `${IMG}/black-raisins.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "raisins-blk-250", size: "250g", price: 199, mrp: 260 },
      { id: "raisins-blk-500", size: "500g", price: 369, mrp: 480 },
    ],
  },
  {
    id: "apricots",
    name: "Turkish Dried Apricots",
    localName: "Khubani",
    category: "dry-fruits",
    description: "Whole pitted Turkish apricots, tangy and chewy",
    image: `${IMG}/apricots.jpg`,
    variants: [
      { id: "apricot-250", size: "250g", price: 379, mrp: 480 },
      { id: "apricot-500", size: "500g", price: 719, mrp: 920 },
    ],
  },
  {
    id: "dried-kiwi-slices",
    name: "Dried Kiwi Slices",
    localName: "Kiwi",
    category: "dry-fruits",
    description: "Tangy kiwi wheels, dried to keep the colour and bite",
    image: `${IMG}/dried-kiwi.jpg`,
    variants: [
      { id: "kiwi-200", size: "200g", price: 299, mrp: 380 },
      { id: "kiwi-400", size: "400g", price: 569, mrp: 730 },
    ],
  },

  /* ------------------------------- SEEDS ------------------------------- */
  {
    id: "seeds-chia",
    name: "Raw Chia Seeds",
    category: "seeds",
    description: "Omega-3 rich black chia — for smoothies and puddings",
    image: `${IMG}/chia.jpg`,
    badge: "Superfood",
    variants: [
      { id: "schia-250", size: "250g", price: 249, mrp: 320 },
      { id: "schia-500", size: "500g", price: 469, mrp: 610 },
    ],
  },
  {
    id: "seeds-pumpkin",
    name: "Roasted Pumpkin Seeds",
    category: "seeds",
    description: "Shelled pepitas, roasted for a nutty magnesium boost",
    image: `${IMG}/pumpkin-seeds.jpg`,
    variants: [
      { id: "spumpkin-250", size: "250g", price: 279, mrp: 350 },
      { id: "spumpkin-500", size: "500g", price: 529, mrp: 670 },
    ],
  },
  {
    id: "seeds-sunflower",
    name: "Raw Sunflower Seeds",
    category: "seeds",
    description: "Hulled sunflower kernels — salads, breads and trail mixes",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=800&fit=crop",
    variants: [
      { id: "ssun-250", size: "250g", price: 189, mrp: 250 },
      { id: "ssun-500", size: "500g", price: 349, mrp: 460 },
    ],
  },
  {
    id: "seeds-watermelon",
    name: "Watermelon Seeds",
    localName: "Magaz",
    category: "seeds",
    description: "Hand-peeled white magaz seeds for sweets and shakes",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop",
    variants: [
      { id: "swater-250", size: "250g", price: 349, mrp: 450 },
      { id: "swater-500", size: "500g", price: 659, mrp: 850 },
    ],
  },

  /* ---------------------------- TRAIL MIXES ---------------------------- */
  {
    id: "power-trail-mix",
    name: "Power Trail Mix",
    category: "mixes",
    description: "Mamra almonds, pistachios, cashews, cranberries, raisins & pumpkin seeds",
    image: `${IMG}/trail-mix.jpg`,
    badge: "Bestseller",
    variants: [
      { id: "mix-power-250", size: "250g", price: 329, mrp: 420 },
      { id: "mix-power-500", size: "500g", price: 629, mrp: 810 },
      { id: "mix-power-1kg", size: "1 Kg", price: 1199, mrp: 1550 },
    ],
  },
  {
    id: "berry-nut-crunch",
    name: "Antioxidant Berry Mix",
    category: "mixes",
    description: "Wild blueberries, cranberries, walnuts, almonds & chia",
    image: `${IMG}/berry-mix.jpg`,
    badge: "Superfood",
    variants: [
      { id: "mix-berry-250", size: "250g", price: 399, mrp: 499 },
      { id: "mix-berry-500", size: "500g", price: 759, mrp: 960 },
    ],
  },

  /* ----------------------------- SOLAR DRIED ---------------------------- */
  {
    id: "solar-mango",
    name: "Solar Dried Mango Slices",
    category: "solar-dried",
    description: "Sun-kissed Alphonso slices, no sugar added",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&h=800&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "smango-200", size: "200g", price: 279, mrp: 360 },
      { id: "smango-400", size: "400g", price: 499, mrp: 650 },
    ],
  },
  {
    id: "solar-pineapple",
    name: "Solar Dried Pineapple Rings",
    category: "solar-dried",
    description: "Chewy pineapple rings dried under open sun",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&h=800&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "spine-200", size: "200g", price: 259, mrp: 340 },
      { id: "spine-400", size: "400g", price: 469, mrp: 610 },
    ],
  },
  {
    id: "solar-strawberry",
    name: "Solar Dried Strawberry",
    category: "solar-dried",
    description: "Whole strawberries, solar dried to keep the tang",
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=800&h=800&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "sstraw-200", size: "200g", price: 359, mrp: 460 },
      { id: "sstraw-400", size: "400g", price: 679, mrp: 880 },
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
  {
    id: "cardamom",
    name: "Green Cardamom",
    localName: "Elaichi",
    category: "spices",
    description: "Bold 8mm Idukki pods, intensely aromatic",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop",
    variants: [
      { id: "cardamom-50", size: "50g", price: 249, mrp: 320 },
      { id: "cardamom-100", size: "100g", price: 449, mrp: 580 },
      { id: "cardamom-250", size: "250g", price: 999, mrp: 1299 },
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
  {
    id: "hazelnut-cocoa-clusters",
    name: "Hazelnut Cocoa Clusters",
    category: "chocolates",
    description: "Roasted hazelnuts in smooth cocoa cream & sea salt",
    image: "/images/chocolates/lindt-family-assortment.png",
    variants: [
      { id: "choco-haz-200", size: "200g", price: 449, mrp: 580 },
      { id: "choco-haz-400", size: "400g", price: 849, mrp: 1100 },
    ],
  },
  {
    id: "cashew-milk-chocolate",
    name: "Cashew Milk Chocolate Bark",
    category: "chocolates",
    description: "Swiss milk chocolate slab studded with salted cashews",
    image: "/images/chocolates/godiva-milk-chocolate.jpg",
    variants: [
      { id: "choco-cas-200", size: "200g", price: 349, mrp: 450 },
      { id: "choco-cas-400", size: "400g", price: 649, mrp: 840 },
    ],
  },
  {
    id: "pistachio-saffron-chocolate",
    name: "Pistachio Saffron Truffles",
    category: "chocolates",
    description: "White chocolate truffles with pistachio & Kashmiri saffron",
    image: "/images/chocolates/godiva-luxury-box.jpg",
    badge: "Luxury",
    variants: [
      { id: "choco-pst-200", size: "200g", price: 499, mrp: 650 },
      { id: "choco-pst-400", size: "400g", price: 949, mrp: 1250 },
    ],
  },

  /* ------------------------------ GIFTING ------------------------------ */
  {
    id: "royal-gifting-box",
    name: "Royal Celebration Gift Box",
    category: "gifting",
    description: "Wooden keepsake box with 4 tins of almonds, cashews, pista & saffron",
    image: "/images/gifting/gift-box-classic.jpg",
    badge: "Gift Special",
    variants: [
      { id: "gift-royal-small", size: "4 x 200g", price: 1499, mrp: 1899 },
      { id: "gift-royal-large", size: "4 x 400g", price: 2799, mrp: 3599 },
    ],
  },
  {
    id: "diwali-luxury-hamper",
    name: "Festive Dry Fruit Hamper",
    category: "gifting",
    description: "Gourmet hamper of dry fruits, dark chocolates & a honey jar",
    image: "/images/gifting/gift-hamper-luxury.jpg",
    badge: "Festive Exclusive",
    variants: [
      { id: "gift-festive-standard", size: "Gourmet Pack", price: 1999, mrp: 2599 },
      { id: "gift-festive-deluxe", size: "Grand Hamper", price: 3499, mrp: 4499 },
    ],
  },
];
