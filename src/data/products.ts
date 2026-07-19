export interface ProductVariant {
  size: string;
  price: number;
  id: string;
}

export interface Product {
  id: string;
  name: string;
  category: "nuts" | "dry-fruits" | "spices" | "honey" | "solar-dried" | "seeds";
  description: string;
  image: string;
  variants: ProductVariant[];
  badge?: string;
}

export const categories = [
  { id: "all", label: "All" },
  { id: "nuts", label: "Nuts" },
  { id: "dry-fruits", label: "Dry Fruits" },
  { id: "solar-dried", label: "Solar Dried" },
  { id: "seeds", label: "Seeds" },
  { id: "spices", label: "Spices" },
  { id: "honey", label: "Honey" },
] as const;

export const products: Product[] = [
  {
    id: "mamra-almonds",
    name: "Mamra Almonds",
    category: "nuts",
    description: "Premium oil-rich almonds from high-altitude valleys",
    image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=600&fit=crop",
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
    image: "https://images.unsplash.com/photo-1525706553905-3b80e5e4e042?w=600&h=600&fit=crop",
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
];
