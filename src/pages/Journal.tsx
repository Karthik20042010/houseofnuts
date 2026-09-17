import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import {
  Play,
  Sparkles,
  ShieldCheck,
  Award,
  Sun,
  Leaf,
  Heart,
  Flame,
  Search,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  X,
  Upload,
  Video,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  category: "sourcing" | "organic" | "health" | "recipes" | "buying-guide";
  categoryLabel: string;
  readTime: string;
  author: string;
  date: string;
  image: string;
  summary: string;
  content: string[];
  featuredProduct?: { name: string; link: string };
}

interface SourcingVideo {
  id: string;
  title: string;
  location: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
  farmer: string;
}

const SOURCING_VIDEOS: SourcingVideo[] = [
  {
    id: "kashmir-almonds",
    title: "Harvesting Mamra & Gurbandi Almonds in Kashmir",
    location: "Pulwama Orchards, Kashmir",
    duration: "1:45",
    thumbnail: "/images/journal/kashmir-almond-harvest.png",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "Watch our local Kashmir farming partners harvest raw Mamra almonds from pesticide-free organic trees nestled under snow-capped Himalayan peaks.",
    farmer: "Farooq Ahmad & Family (Kashmir Valley Organic Cooperative)",
  },
  {
    id: "farm-roasting",
    title: "Micro-Batch Slow Roasting & Quality Sorting",
    location: "House of Nuts Kitchen, Proddatur",
    duration: "2:10",
    thumbnail: "/images/journal/farm-to-store-nuts.png",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "Discover how we micro-roast handpicked cashews and pistachios at precise temperatures without oil, locking in natural crunch and rich essential oils.",
    farmer: "Master Roaster Master Crew at House of Nuts",
  },
  {
    id: "kerala-cashews",
    title: "Handpicked Jumbo W180 Cashews from Kerala",
    location: "Kollam Organic Estates, Kerala",
    duration: "1:30",
    thumbnail: "/images/nuts/cashew-whole.jpeg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "Step into Kerala's coastal cashew groves where only W180 grade king cashews are hand-harvested and naturally sun-cured for maximum sweetness.",
    farmer: "Kollam Farmers Collective",
  },
  {
    id: "afghan-anjeer",
    title: "Sun-Drying Organic Figs (Anjeer) in Kandahar",
    location: "Kandahar Sun Valleys",
    duration: "1:55",
    thumbnail: "/images/dry-fruits/anjeer.jpg",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: "See how naturally sweet Anjeer figs are hand-threaded and slow sun-dried on wooden racks without sulphur dioxide or chemical bleaches.",
    farmer: "Traditional Afghan Sun-Dryers",
  },
];

const ARTICLES: Article[] = [
  {
    id: "farm-to-store-journey",
    title: "From Farm to Store: How We Sourcing Pure, Chemical-Free Dry Fruits",
    category: "sourcing",
    categoryLabel: "Farm Sourcing",
    readTime: "4 min read",
    author: "House of Nuts Sourcing Team",
    date: "September 2026",
    image: "/images/journal/kashmir-almond-harvest.png",
    summary: "A behind-the-scenes look into our direct-from-farmer fair trade practices, 100% pesticide-free sourcing, and zero-bleach natural processing standards.",
    content: [
      "At House of Nuts, we believe true quality begins at the soil level. Unlike commercial dry fruit brands that purchase mass-market stock treated with sulphur dioxide, synthetic polishers, and chemical glazes, our team works directly with organic farmers in Kashmir, Kerala, Iran, and Afghanistan.",
      "Every harvest undergoes strict non-GMO and pesticide-free testing. Our Mamra almonds come from cold-climate Kashmiri orchards where trees absorb natural mineral-rich mountain water, resulting in higher oil content and superior brain-nourishing properties.",
      "When dry fruits arrive at our processing unit in Proddatur, they undergo 4-layer optical laser and hand sorting. Only top 5% premium size grade nuts are selected, while damaged or under-sized nuts are immediately rejected.",
    ],
    featuredProduct: { name: "Kashmiri Gurbandi Almonds", link: "/category/nuts" },
  },
  {
    id: "micro-batch-roasting",
    title: "The Art of Micro-Batch Oven Roasting — Zero Added Oils",
    category: "organic",
    categoryLabel: "Organic Quality",
    readTime: "3 min read",
    author: "Chief Roaster",
    date: "September 2026",
    image: "/images/journal/farm-to-store-nuts.png",
    summary: "Why oil-free slow roasting at controlled low temperatures preserves 98% of natural omega fatty acids and antioxidants in cashews and pistachios.",
    content: [
      "Most commercial roasted nuts in supermarket aisles are deep-fried in palm oil or hydrogenated fats before being heavily salted with refined table salt. This destroys fragile omega-3 oils and adds unnecessary saturated fats.",
      "At House of Nuts, we use slow hot-air oven micro-roasting in small batches under 15 Kg. This allows natural oils inside the nuts to toast them to golden perfection from the inside out.",
      "We season our gourmet mixes exclusively with pure mineral-rich Himalayan Pink Salt and raw organic wildflower honey, guaranteeing clean, authentic flavor in every bite.",
    ],
    featuredProduct: { name: "Roasted & Salted Pistachios", link: "/category/mixes" },
  },
  {
    id: "almond-benefits-guide",
    title: "Mamra vs Gurbandi vs California Almonds — Complete Health Comparison",
    category: "buying-guide",
    categoryLabel: "Buying Guide",
    readTime: "5 min read",
    author: "Dr. Ananya Sharma (Clinical Nutritionist)",
    date: "August 2026",
    image: "/images/nuts/mamra-almonds.jpg",
    summary: "Understand the vital differences in oil percentage, protein content, and nutritional value across Mamra, Gurbandi, and California almond varieties.",
    content: [
      "California Almonds: Pasteurized and polished for uniform appearance. Lower oil content (approx 18-20%). Excellent for baking and almond milk.",
      "Gurbandi Almonds: Grown naturally in Afghanistan with small concave shape. Packed with 35%+ natural almond oil and vitamin E. Slightly bitter due to raw active antioxidants.",
      "Kashmiri Mamra Almonds: The undisputed king of almonds. Contains up to 50% almond oil, zero cholesterol, and rich riboflavin to boost brain memory and joint health.",
    ],
    featuredProduct: { name: "Kashmiri Mamra Almonds", link: "/category/nuts" },
  },
  {
    id: "diabetes-heart-snacking",
    title: "Top 5 Low-GI Dry Fruits Recommended for Heart Health & Diabetes",
    category: "health",
    categoryLabel: "Health & Wellness",
    readTime: "4 min read",
    author: "Wellness Desk",
    date: "August 2026",
    image: "/images/dry-fruits/anjeer.jpg",
    summary: "How soaked Anjeer figs, raw walnuts, pumpkin seeds, and pistachios regulate blood sugar spikes and improve cardiovascular vascular flexibility.",
    content: [
      "Snacking smartly is key to maintaining stable HbA1c blood sugar levels. Nuts like walnuts and almonds have a low Glycemic Index (GI) under 15.",
      "Walnuts are loaded with plant-based Alpha-Linolenic Acid (ALA) omega-3s, which reduce arterial inflammation and lower bad LDL cholesterol.",
      "Soaking 2 pieces of sun-dried Anjeer figs overnight in water releases soluble fiber that aids digestion and regulates glucose absorption.",
    ],
    featuredProduct: { name: "Premium Sun-Dried Anjeer", link: "/category/dry-fruits" },
  },
  {
    id: "trail-mix-protein-bars",
    title: "Power Up Naturally: Clean Protein & Energy Snack Recipes",
    category: "recipes",
    categoryLabel: "Healthy Recipes",
    readTime: "3 min read",
    author: "Chef Riya Mehta",
    date: "July 2026",
    image: "/images/mixes/berry-mix.jpg",
    summary: "Quick 10-minute homemade energy ball recipe using Medjool dates, chia seeds, crushed cashew nuts, and natural cocoa powder.",
    content: [
      "Commercial protein bars often contain hidden glucose syrups, palm fats, and artificial protein isolates. You can make clean, 100% natural energy bites in 10 minutes at home!",
      "Blend 1 cup pitted Medjool dates with 1/2 cup raw cashews, 2 tbsp pumpkin seeds, 1 tbsp chia seeds, and 1 tbsp dark cocoa. Roll into bite-sized balls and chill.",
      "Each energy ball delivers 6g of plant protein, zero refined sugars, and sustained energy for workouts or office desk snacking.",
    ],
    featuredProduct: { name: "Custom Trail Mix Crafter", link: "/gifting" },
  },
];

const Journal = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<SourcingVideo | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: "", phone: "", location: "", videoLink: "", note: "" });

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.videoLink) {
      toast.error("Please enter a valid video link or drive URL.");
      return;
    }
    toast.success("Thank you! Your sourcing video reel has been submitted to our editorial team.");
    setIsSubmitModalOpen(false);
    setSubmitForm({ name: "", phone: "", location: "", videoLink: "", note: "" });
  };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <SEOHead
        title="Farm-to-Store Sourcing Journal & Healthy Organic Snacking"
        description="Explore House of Nuts Journal: Direct farm sourcing stories from Kashmir & Kerala, 100% organic handpicked quality guides, oil-free micro-roasting, and health benefits."
        keywords="farm sourcing dry fruits, Kashmir Mamra almonds, organic dry fruits proddatur, healthy dry fruit recipes, house of nuts journal"
        canonicalUrl="/journal"
      />
      <Header />
      <CartDrawer />

      <main className="pb-20">
        {/* HERO SECTION: Farm-to-Store Sourcing Story */}
        <section className="relative bg-gradient-to-b from-primary via-primary/95 to-background text-primary-foreground py-16 sm:py-24 px-4 sm:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-semibold tracking-widest uppercase font-body shadow-xs">
              <Leaf size={14} className="animate-pulse" /> 100% Organic & Farm Handpicked
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-white max-w-4xl mx-auto">
              From Kashmir & Kerala Orchards <br className="hidden sm:inline" />
              <span className="italic text-accent">Direct to Your Doorstep.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-primary-foreground/80 leading-relaxed font-light">
              We partner directly with organic family farms across Kashmir, Kerala, and Afghanistan to bring you unbleached, cold-roasted, hand-sorted dry fruits packed with natural essential oils.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-8 text-left max-w-4xl mx-auto font-body">
              {[
                { icon: Leaf, title: "100% Organic", sub: "Zero chemical bleaches or wax" },
                { icon: ShieldCheck, title: "Direct Fair Trade", sub: "Partnered with organic farmers" },
                { icon: Award, title: "4-Layer Hand Sorted", sub: "Top 5% premium size grade" },
                { icon: Sun, title: "Micro-Batch Roasted", sub: "Oil-free low temp oven toast" },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 hover:bg-white/15 transition-all">
                    <Icon size={20} className="text-accent mb-2" />
                    <p className="text-xs font-semibold text-white">{p.title}</p>
                    <p className="text-[11px] text-primary-foreground/70">{p.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 1: Interactive Farm Sourcing Video Reels */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/70 pb-6">
            <div>
              <div className="flex items-center gap-2 text-accent text-xs uppercase tracking-widest font-semibold font-body mb-1">
                <Video size={16} /> Authentic Sourcing Footage
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">Farm-to-Store Video Stories</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                Watch real footage of our organic harvesting, hand-sorting, and micro-batch roasting processes.
              </p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent/15 hover:bg-accent text-accent hover:text-accent-foreground border border-accent/40 rounded-2xl text-xs font-semibold uppercase tracking-wider font-body transition-all cursor-pointer shadow-xs self-start md:self-auto"
            >
              <Upload size={14} /> Submit Sourcing Video / Photo
            </button>
          </div>

          {/* Sourcing Video Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOURCING_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setActiveVideo(vid)}
                className="group relative bg-card border border-border/80 rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="size-12 rounded-full bg-accent text-accent-foreground grid place-items-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={20} className="ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 font-body">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-accent font-mono">
                      📍 {vid.location}
                    </span>
                    <h3 className="font-display text-lg text-foreground group-hover:text-accent transition-colors leading-snug mt-1">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed font-light">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-body">
                    <span className="truncate max-w-[170px]">👨‍🌾 {vid.farmer}</span>
                    <span className="text-accent font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Watch <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: 5-Step Quality Sourcing Journey Timeline */}
        <section className="bg-clay-light/60 border-y border-border/60 py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <span className="text-accent uppercase tracking-widest text-xs font-semibold font-body">Our Quality Guarantee</span>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">The 5-Step Handpicked Process</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-body">
                From organic soil to nitrogen-flushed eco packaging — how we guarantee crunch, purity, and nutrition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-body">
              {[
                { step: "01", title: "Organic Farm Harvest", desc: "Sourced at peak ripeness from certified pesticide-free family orchards." },
                { step: "02", title: "Natural Sun-Drying", desc: "Slow sun curing on wooden racks under natural sunlight without chemicals." },
                { step: "03", title: "4-Layer Hand Sort", desc: "Triple optical laser & hand grading. Only Top 5% size grade selected." },
                { step: "04", title: "Oil-Free Oven Toast", desc: "Micro-roasted in small batches with Himalayan Pink Salt & Raw Honey." },
                { step: "05", title: "Fresh Eco Pouch", desc: "Nitrogen flushed for maximum crunch and 100% airtight freshness." },
              ].map((st, idx) => (
                <div key={st.step} className="bg-card border border-border p-5 rounded-2xl space-y-2 relative shadow-2xs hover:border-accent/50 transition-colors">
                  <span className="font-mono text-2xl font-bold text-accent/40 block">{st.step}</span>
                  <h3 className="font-display text-base text-foreground leading-tight">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: Articles & Health Guides Hub */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
            <div>
              <span className="text-accent uppercase tracking-widest text-xs font-semibold font-body">Knowledge & Recipes</span>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">Organic Snacking Guides</h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles or benefits..."
                className="w-full pl-9 pr-4 py-2 border border-border bg-card text-xs font-body rounded-2xl focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: "all", label: "All Stories" },
              { id: "sourcing", label: "🌱 Farm Sourcing" },
              { id: "organic", label: "✨ Organic Quality" },
              { id: "buying-guide", label: "📖 Buying Guides" },
              { id: "health", label: "❤️ Health & Wellness" },
              { id: "recipes", label: "🥣 Healthy Recipes" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full border text-xs font-body font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-accent text-accent-foreground border-accent shadow-soft"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                onClick={() => setActiveArticle(art)}
                className="group bg-card border border-border/80 rounded-3xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-border text-foreground px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider font-body shadow-xs">
                    {art.categoryLabel}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 font-body">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} /> {art.readTime}</span>
                      <span>•</span>
                      <span>{art.date}</span>
                    </div>

                    <h3 className="font-display text-2xl text-foreground group-hover:text-accent transition-colors leading-tight">
                      {art.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-light">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <User size={13} className="text-accent" /> {art.author}
                    </span>
                    <span className="text-accent font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* VIDEO PLAYBACK MODAL */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 relative font-body">
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <span className="text-accent text-xs font-mono uppercase font-bold">📍 {activeVideo.location}</span>
                <h3 className="font-display text-2xl text-foreground">{activeVideo.title}</h3>
                <p className="text-xs text-muted-foreground">{activeVideo.farmer}</p>
              </div>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                <video src={activeVideo.videoUrl} controls autoPlay className="w-full h-full object-cover" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{activeVideo.description}</p>
            </div>
          </div>
        )}

        {/* FULL ARTICLE READER MODAL */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-card border border-border max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 relative space-y-6 my-8 font-body max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider font-body bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                  {activeArticle.categoryLabel}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-tight">{activeArticle.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>By {activeArticle.author}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                </div>
              </div>

              <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-64 object-cover rounded-2xl border border-border" />

              <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-light">
                {activeArticle.content.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {activeArticle.featuredProduct && (
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-body">Featured Organic Product:</p>
                    <p className="font-display text-lg text-foreground font-semibold">{activeArticle.featuredProduct.name}</p>
                  </div>
                  <Link
                    to={activeArticle.featuredProduct.link}
                    onClick={() => setActiveArticle(null)}
                    className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors shadow-soft"
                  >
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBMIT SOURCING REEL MODAL */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-5 relative font-body shadow-2xl">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <h3 className="font-display text-2xl text-foreground">Submit Sourcing Reel / Photo</h3>
                <p className="text-xs text-muted-foreground">
                  Share videos or photos from your farm harvest or unboxing to feature on our journal!
                </p>
              </div>

              <form onSubmit={handleSubmitReel} className="space-y-4 text-xs font-body">
                <div>
                  <label className="block text-muted-foreground mb-1 uppercase font-medium">Your Name / Farm Name *</label>
                  <input
                    type="text"
                    required
                    value={submitForm.name}
                    onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full border border-border bg-background px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 uppercase font-medium">Location / Orchard *</label>
                  <input
                    type="text"
                    required
                    value={submitForm.location}
                    onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                    placeholder="e.g. Kashmir / Kerala / Proddatur"
                    className="w-full border border-border bg-background px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 uppercase font-medium">Video Reel / Drive Link *</label>
                  <input
                    type="url"
                    required
                    value={submitForm.videoLink}
                    onChange={(e) => setSubmitForm({ ...submitForm, videoLink: e.target.value })}
                    placeholder="https://drive.google.com/... or Instagram Reel link"
                    className="w-full border border-border bg-background px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 uppercase font-medium">Note / Story Description</label>
                  <textarea
                    rows={2}
                    value={submitForm.note}
                    onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                    placeholder="Tell us brief details about this video..."
                    className="w-full border border-border bg-background px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-2xl font-semibold uppercase tracking-wider text-xs hover:bg-primary hover:text-primary-foreground transition-colors shadow-soft cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Submit Video Reel
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Journal;
