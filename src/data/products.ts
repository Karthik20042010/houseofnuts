export interface ProductVariant {
  size: string;
  price: number;
  id: string;
}

export interface Product {
  id: string;
  name: string;
  category: "nuts" | "dry-fruits" | "spices" | "honey" | "solar-dried" | "seeds" | "chocolates";
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
    image: "/images/nuts/mamra-almonds.png",
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
    image: "/images/nuts/jumbo-cashews.png",
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
    image: "/images/nuts/pistachios-iranian.png",
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
    image: "https://images.unsplash.com/photo-1563412885-139e4045a8c0?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1593725930571-0d7d33ed340d?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1596273501048-d267d4e0cf6f?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1595743825637-cdca4b7e4f45?w=600&h=600&fit=crop",
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
  // ============ SOLAR DRIED FRUITS ============
  {
    id: "solar-kiwi",
    name: "Solar Dried Kiwi",
    category: "solar-dried",
    description: "Tangy sun-dried kiwi slices, naturally sweet",
    image: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600&h=600&fit=crop",
    badge: "Solar Dried",
    variants: [
      { id: "sd-kiwi-250", size: "250g", price: 120 },
      { id: "sd-kiwi-500", size: "500g", price: 230 },
      { id: "sd-kiwi-1kg", size: "1 Kg", price: 450 },
    ],
  },
  {
    id: "solar-cherries",
    name: "Solar Dried Cherries",
    category: "solar-dried",
    description: "Plump, chewy dried cherries with rich flavor",
    image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-cherry-250", size: "250g", price: 190 },
      { id: "sd-cherry-500", size: "500g", price: 370 },
      { id: "sd-cherry-1kg", size: "1 Kg", price: 720 },
    ],
  },
  {
    id: "solar-black-plum",
    name: "Solar Dried Black Plum",
    category: "solar-dried",
    description: "Sweet-tart black plums, dried under the sun",
    image: "https://images.unsplash.com/photo-1601379329542-31c59ac0d1cf?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-bplum-250", size: "250g", price: 120 },
      { id: "sd-bplum-500", size: "500g", price: 230 },
      { id: "sd-bplum-1kg", size: "1 Kg", price: 450 },
    ],
  },
  {
    id: "solar-rose-plum",
    name: "Solar Dried Rose Plum",
    category: "solar-dried",
    description: "Delicate rose-hued plums with a mellow finish",
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-rplum-250", size: "250g", price: 130 },
      { id: "sd-rplum-500", size: "500g", price: 240 },
      { id: "sd-rplum-1kg", size: "1 Kg", price: 480 },
    ],
  },
  {
    id: "solar-mango",
    name: "Solar Dried Mango",
    category: "solar-dried",
    description: "Ripe Alphonso-style mango, sun-dried to perfection",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop",
    badge: "Bestseller",
    variants: [
      { id: "sd-mango-250", size: "250g", price: 160 },
      { id: "sd-mango-500", size: "500g", price: 320 },
      { id: "sd-mango-1kg", size: "1 Kg", price: 620 },
    ],
  },
  {
    id: "solar-honey-amla",
    name: "Honey Amla",
    category: "solar-dried",
    description: "Amla candied in honey, sweet & immunity-boosting",
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f3?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-amla-250", size: "250g", price: 80 },
      { id: "sd-amla-500", size: "500g", price: 160 },
      { id: "sd-amla-1kg", size: "1 Kg", price: 300 },
    ],
  },
  {
    id: "solar-strawberry",
    name: "Solar Dried Strawberry",
    category: "solar-dried",
    description: "Vibrant dried strawberries, intensely fruity",
    image: "https://images.unsplash.com/photo-1543528176-61b239494933?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-straw-250", size: "250g", price: 190 },
      { id: "sd-straw-500", size: "500g", price: 370 },
      { id: "sd-straw-1kg", size: "1 Kg", price: 720 },
    ],
  },
  {
    id: "solar-pineapple",
    name: "Solar Dried Pineapple",
    category: "solar-dried",
    description: "Golden pineapple rings, tropical & tangy-sweet",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-pine-250", size: "250g", price: 160 },
      { id: "sd-pine-500", size: "500g", price: 310 },
      { id: "sd-pine-1kg", size: "1 Kg", price: 600 },
    ],
  },
  {
    id: "solar-cranberries",
    name: "Red Cranberries",
    category: "solar-dried",
    description: "Ruby-red cranberries, tart and antioxidant-rich",
    image: "https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-cran-250", size: "250g", price: 210 },
      { id: "sd-cran-500", size: "500g", price: 410 },
      { id: "sd-cran-1kg", size: "1 Kg", price: 800 },
    ],
  },
  {
    id: "solar-blueberries",
    name: "Dried Blueberries",
    category: "solar-dried",
    description: "Premium wild blueberries, packed with antioxidants",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=600&fit=crop",
    badge: "Premium",
    variants: [
      { id: "sd-blue-250", size: "250g", price: 420 },
      { id: "sd-blue-500", size: "500g", price: 830 },
      { id: "sd-blue-1kg", size: "1 Kg", price: 1650 },
    ],
  },
  // ============ SEEDS ============
  {
    id: "seeds-pumpkin",
    name: "Pumpkin Seeds",
    category: "seeds",
    description: "Roasted pepitas, rich in magnesium & zinc",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-pump-250", size: "250g", price: 120 },
      { id: "sd-pump-500", size: "500g", price: 230 },
      { id: "sd-pump-1kg", size: "1 Kg", price: 450 },
    ],
  },
  {
    id: "seeds-sunflower",
    name: "Sunflower Seeds",
    category: "seeds",
    description: "Crunchy hulled sunflower kernels, lightly roasted",
    image: "https://images.unsplash.com/photo-1574570301597-1cfb14bb8bfb?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-sun-250", size: "250g", price: 70 },
      { id: "sd-sun-500", size: "500g", price: 130 },
      { id: "sd-sun-1kg", size: "1 Kg", price: 250 },
    ],
  },
  {
    id: "seeds-watermelon",
    name: "Watermelon Seeds",
    category: "seeds",
    description: "Deshelled watermelon kernels, protein-packed",
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-wmelon-250", size: "250g", price: 170 },
      { id: "sd-wmelon-500", size: "500g", price: 330 },
      { id: "sd-wmelon-1kg", size: "1 Kg", price: 650 },
    ],
  },
  {
    id: "seeds-chia",
    name: "Chia Seeds",
    category: "seeds",
    description: "Omega-3 rich superfood seeds, raw & natural",
    image: "https://images.unsplash.com/photo-1541990206485-e0fa1928db61?w=600&h=600&fit=crop",
    badge: "Superfood",
    variants: [
      { id: "sd-chia-250", size: "250g", price: 130 },
      { id: "sd-chia-500", size: "500g", price: 260 },
      { id: "sd-chia-1kg", size: "1 Kg", price: 500 },
    ],
  },
  {
    id: "seeds-melon",
    name: "Melon Seeds (Magaz)",
    category: "seeds",
    description: "Traditional magaz seeds, perfect for desserts",
    image: "https://images.unsplash.com/photo-1611578631479-4b4d10bbb2ff?w=600&h=600&fit=crop",
    variants: [
      { id: "sd-melon-250", size: "250g", price: 110 },
      { id: "sd-melon-500", size: "500g", price: 210 },
      { id: "sd-melon-1kg", size: "1 Kg", price: 400 },
    ],
  },
  {
    id: "almond-dark-chocolate",
    name: "Almond Dark Chocolate Rocks",
    category: "chocolates",
    description: "Handcrafted 70% dark Belgian chocolate with slow-roasted Mamra almonds",
    image: "/images/chocolates/dark-chocolate-rocks.png",
    badge: "Artisanal",
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
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&h=600&fit=crop",
    badge: "Luxury",
    variants: [
      { id: "choco-pst-200", size: "200g", price: 499 },
      { id: "choco-pst-400", size: "400g", price: 949 },
    ],
  },
];
