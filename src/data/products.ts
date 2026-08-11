export interface ProductVariant {
  size: string;
  price: number;
  id: string;
}

export interface Product {
  id: string;
  name: string;
  category: "nuts" | "dry-fruits" | "spices" | "honey" | "solar-dried" | "seeds" | "chocolates" | "mixes" | "gifting";
  description: string;
  image: string;
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

export const products: Product[] = [
  {
    id: "mamra-almonds",
    name: "Mamra Almonds",
    category: "nuts",
    description: "Premium oil-rich almonds from high-altitude valleys",
    image: "/images/nuts/mamra-almonds.jpg",
    badge: "Bestseller",
    variants: [
      { id: "mamra-250", size: "250g", price: 499 },
      { id: "mamra-500", size: "500g", price: 899 },
      { id: "mamra-1kg", size: "1 Kg", price: 1699 },
    ],
  },
  {
    id: "cashews-w320",
    name: "Jumbo Cashews W320",
    category: "nuts",
    description: "Whole premium cashews, lightly roasted & salted",
    image: "/images/nuts/cashews.jpg",
    variants: [
      { id: "cashew-250", size: "250g", price: 349 },
      { id: "cashew-500", size: "500g", price: 649 },
      { id: "cashew-1kg", size: "1 Kg", price: 1199 },
    ],
  },
  {
    id: "pistachios",
    name: "Iranian Pistachios",
    category: "nuts",
    description: "Naturally opened, roasted with a hint of saffron",
    image: "/images/nuts/pistachios.jpg",
    badge: "Premium",
    variants: [
      { id: "pista-250", size: "250g", price: 449 },
      { id: "pista-500", size: "500g", price: 849 },
      { id: "pista-1kg", size: "1 Kg", price: 1599 },
    ],
  },
  {
    id: "walnuts",
    name: "Kashmir Walnuts",
    category: "nuts",
    description: "Light halves from Himalayan orchards",
    image: "/images/nuts/walnuts.jpg",
    variants: [
      { id: "walnut-250", size: "250g", price: 299 },
      { id: "walnut-500", size: "500g", price: 549 },
      { id: "walnut-1kg", size: "1 Kg", price: 999 },
    ],
  },
  {
    id: "dates-medjool",
    name: "Medjool Dates",
    category: "dry-fruits",
    description: "Large, soft & caramel-like premium dates",
    image: "/images/dry-fruits/dates.jpg",
    badge: "Imported",
    variants: [
      { id: "dates-250", size: "250g", price: 399 },
      { id: "dates-500", size: "500g", price: 749 },
      { id: "dates-1kg", size: "1 Kg", price: 1399 },
    ],
  },
  {
    id: "figs",
    name: "Anjeer (Dried Figs)",
    category: "dry-fruits",
    description: "Sun-dried Turkish figs, naturally sweet",
    image: "/images/dry-fruits/anjeer.jpg",
    variants: [
      { id: "figs-250", size: "250g", price: 349 },
      { id: "figs-500", size: "500g", price: 649 },
    ],
  },
  {
    id: "raisins",
    name: "Afghan Green Raisins",
    category: "dry-fruits",
    description: "Seedless, naturally dried, rich in iron",
    image: "/images/dry-fruits/raisins.jpg",
    variants: [
      { id: "raisins-250", size: "250g", price: 149 },
      { id: "raisins-500", size: "500g", price: 269 },
      { id: "raisins-1kg", size: "1 Kg", price: 499 },
    ],
  },
  {
    id: "apricots",
    name: "Turkish Apricots",
    category: "dry-fruits",
    description: "Plump, tangy & vitamin-rich dried apricots",
    image: "/images/dry-fruits/apricots.jpg",
    variants: [
      { id: "apricot-250", size: "250g", price: 299 },
      { id: "apricot-500", size: "500g", price: 549 },
    ],
  },
  {
    id: "saffron",
    name: "Kashmiri Mongra Saffron",
    category: "spices",
    description: "Grade A saffron threads, intense aroma & color",
    image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=600&h=600&fit=crop",
    badge: "Rare",
    variants: [
      { id: "saffron-1g", size: "1g", price: 499 },
      { id: "saffron-2g", size: "2g", price: 949 },
      { id: "saffron-5g", size: "5g", price: 2199 },
    ],
  },
  {
    id: "cardamom",
    name: "Green Cardamom",
    category: "spices",
    description: "Bold 8mm pods from Kerala hills",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop",
    variants: [
      { id: "cardamom-50", size: "50g", price: 249 },
      { id: "cardamom-100", size: "100g", price: 449 },
      { id: "cardamom-250", size: "250g", price: 999 },
    ],
  },
  {
    id: "cinnamon",
    name: "Ceylon Cinnamon Sticks",
    category: "spices",
    description: "True cinnamon, delicate & fragrant",
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&h=600&fit=crop",
    variants: [
      { id: "cinnamon-50", size: "50g", price: 149 },
      { id: "cinnamon-100", size: "100g", price: 269 },
    ],
  },
  {
    id: "wild-honey",
    name: "Wild Forest Honey",
    category: "honey",
    description: "Raw, unprocessed honey from deep forest hives",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=600&fit=crop",
    badge: "Organic",
    variants: [
      { id: "honey-250", size: "250ml", price: 349 },
      { id: "honey-500", size: "500ml", price: 649 },
      { id: "honey-1l", size: "1 Litre", price: 1199 },
    ],
  },
  {
    id: "manuka-honey",
    name: "Manuka-Style Honey",
    category: "honey",
    description: "Premium dark honey with medicinal properties",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop",
    badge: "Premium",
    variants: [
      { id: "manuka-250", size: "250ml", price: 799 },
      { id: "manuka-500", size: "500ml", price: 1499 },
    ],
  },
  {
    id: "solar-kiwi",
    name: "Solar Dried Kiwi",
    category: "solar-dried",
    description: "Tangy sun-dried kiwi slices, naturally sweet",
    image: "/images/dry-fruits/dried-kiwi.jpg",
    badge: "Solar Dried",
    variants: [
      { id: "skiwi-200", size: "200g", price: 299 },
      { id: "skiwi-400", size: "400g", price: 549 },
    ],
  },
  {
    id: "solar-mango",
    name: "Solar Dried Mango Slices",
    category: "solar-dried",
    description: "Pure Alphonso mango strips dried naturally without added sugar",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "smango-200", size: "200g", price: 279 },
      { id: "smango-400", size: "400g", price: 499 },
    ],
  },
  {
    id: "solar-pineapple",
    name: "Solar Dried Pineapple Rings",
    category: "solar-dried",
    description: "Chewy tropical pineapple rings dried under clean solar collectors",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=600&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "spine-200", size: "200g", price: 259 },
      { id: "spine-400", size: "400g", price: 469 },
    ],
  },
  {
    id: "seeds-pumpkin",
    name: "Raw Pumpkin Seeds",
    category: "seeds",
    description: "Zinc-rich raw AAA-grade pumpkin seeds",
    image: "/images/seeds/pumpkin-seeds.jpg",
    variants: [
      { id: "spumpkin-250", size: "250g", price: 229 },
      { id: "spumpkin-500", size: "500g", price: 419 },
    ],
  },
  {
    id: "seeds-sunflower",
    name: "Raw Sunflower Seeds",
    category: "seeds",
    description: "Vitamin E packed sunflower seeds for snacking and baking",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=600&fit=crop",
    variants: [
      { id: "ssun-250", size: "250g", price: 189 },
      { id: "ssun-500", size: "500g", price: 349 },
    ],
  },
  {
    id: "seeds-chia",
    name: "Organic Chia Seeds",
    category: "seeds",
    description: "Omega-3 rich black chia seeds, great for smoothies and puddings",
    image: "/images/seeds/chia.jpg",
    badge: "Superfood",
    variants: [
      { id: "schia-250", size: "250g", price: 199 },
      { id: "schia-500", size: "500g", price: 369 },
    ],
  },
  {
    id: "dark-chocolate-almond-rocks",
    name: "Dark Chocolate Almond Rocks",
    category: "chocolates",
    description: "Artisanal 70% dark Belgian chocolate loaded with roasted California almonds",
    image: "/images/chocolates/godiva-dark-truffe.png",
    badge: "Bestseller",
    variants: [
      { id: "choco-alm-200", size: "200g", price: 399 },
      { id: "choco-alm-400", size: "400g", price: 749 },
    ],
  },
  {
    id: "hazelnut-cocoa-clusters",
    name: "Hazelnut Cocoa Clusters",
    category: "chocolates",
    description: "Roasted hazelnuts enrobed in smooth cocoa cream & sea salt",
    image: "/images/chocolates/lindt-family-assortment.png",
    variants: [
      { id: "choco-haz-200", size: "200g", price: 449 },
      { id: "choco-haz-400", size: "400g", price: 849 },
    ],
  },
  {
    id: "cashew-milk-chocolate",
    name: "Cashew Milk Chocolate Bark",
    category: "chocolates",
    description: "Creamy Swiss milk chocolate slab studded with jumbo salted cashews",
    image: "/images/chocolates/godiva-milk-chocolate.jpg",
    variants: [
      { id: "choco-cas-200", size: "200g", price: 349 },
      { id: "choco-cas-400", size: "400g", price: 649 },
    ],
  },
  {
    id: "pistachio-saffron-chocolate",
    name: "Pistachio Saffron Truffles",
    category: "chocolates",
    description: "Luxury white chocolate truffles infused with Iranian pistachios & Kashmiri saffron",
    image: "/images/chocolates/godiva-luxury-box.jpg",
    badge: "Luxury",
    variants: [
      { id: "choco-pst-200", size: "200g", price: 499 },
      { id: "choco-pst-400", size: "400g", price: 949 },
    ],
  },
  {
    id: "power-trail-mix",
    name: "Signature Power Trail Mix",
    category: "mixes",
    description: "Six hero ingredients: Mamra almonds, pistachios, cashews, cranberries, raisins & toasted pumpkin seeds",
    image: "/images/mixes/trail-mix.jpg",
    badge: "Bestseller",
    variants: [
      { id: "mix-power-250", size: "250g", price: 399 },
      { id: "mix-power-500", size: "500g", price: 749 },
      { id: "mix-power-1kg", size: "1 Kg", price: 1399 },
    ],
  },
  {
    id: "berry-nut-crunch",
    name: "Berry Nut Energy Crunch",
    category: "mixes",
    description: "Anti-oxidant rich blend of wild blueberries, cranberries, walnuts, almonds & chia seeds",
    image: "/images/mixes/berry-mix.jpg",
    badge: "Superfood",
    variants: [
      { id: "mix-berry-250", size: "250g", price: 429 },
      { id: "mix-berry-500", size: "500g", price: 799 },
    ],
  },
  {
    id: "royal-gifting-box",
    name: "Royal Celebration Gift Box",
    category: "gifting",
    description: "Handcrafted wooden keepsake box with 4 premium brass tins of Mamra almonds, cashews, pistachios & saffron",
    image: "/images/gifting/gift-box-classic.jpg",
    badge: "Gift Special",
    variants: [
      { id: "gift-royal-small", size: "4 x 200g", price: 1499 },
      { id: "gift-royal-large", size: "4 x 400g", price: 2799 },
    ],
  },
  {
    id: "diwali-luxury-hamper",
    name: "Festive Dry Fruit Hamper",
    category: "gifting",
    description: "Gourmet hamper set featuring dry fruits, artisanal dark chocolates & wild forest honey jar",
    image: "/images/gifting/gift-hamper-luxury.jpg",
    badge: "Festive Exclusive",
    variants: [
      { id: "gift-festive-standard", size: "Gourmet Pack", price: 1999 },
      { id: "gift-festive-deluxe", size: "Grand Hamper", price: 3499 },
    ],
  },
  {
    id: "peri-peri-makhana",
    name: "Peri-Peri Roasted Makhana (Foxnuts)",
    category: "nuts",
    description: "Slow-roasted lotus seeds tossed in tangy Peri-Peri seasoning",
    image: "/images/nuts/peri-peri-makhana.jpg",
    badge: "Bestseller",
    variants: [
      { id: "mak-peri-100", size: "100g", price: 179 },
      { id: "mak-peri-250", size: "250g", price: 399 },
    ],
  },
  {
    id: "masala-cashews",
    name: "Spiced Masala Cashews (Kaju)",
    category: "nuts",
    description: "Jumbo W320 cashews wok-tossed with Indian garam masala & pink salt",
    image: "/images/nuts/masala-cashews.jpg",
    variants: [
      { id: "cashew-masala-250", size: "250g", price: 379 },
      { id: "cashew-masala-500", size: "500g", price: 699 },
    ],
  },
  {
    id: "honey-walnuts",
    name: "Honey-Glazed Himalayan Walnuts",
    category: "nuts",
    description: "Kashmiri walnut halves coated in organic wild honey & toasted sesame",
    image: "/images/nuts/honey-walnuts.jpg",
    badge: "Gourmet",
    variants: [
      { id: "walnut-honey-250", size: "250g", price: 399 },
      { id: "walnut-honey-500", size: "500g", price: 749 },
    ],
  },
  {
    id: "black-raisins",
    name: "Black Seedless Raisins (Kali Kishmish)",
    category: "dry-fruits",
    description: "Sun-dried seedless black raisins, packed with iron & natural sweetness",
    image: "/images/dry-fruits/black-raisins.jpg",
    variants: [
      { id: "raisins-blk-250", size: "250g", price: 169 },
      { id: "raisins-blk-500", size: "500g", price: 319 },
    ],
  },
];
