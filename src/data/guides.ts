/**
 * Recipe & buying guide content for the Journal.
 *
 * Everything below is plain, editable data — change the text here and the
 * page, its Google title/description and the internal links update too.
 *
 * Fields:
 *  - slug: the page address, /journal/<slug>
 *  - metaTitle / metaDescription / keywords: what Google shows and matches
 *  - categories: category pages this guide links to (must match category ids)
 *  - productIds: products shown as "Shop the ingredients" (must match product ids)
 */

export type GuideKind = "recipe" | "buying-guide" | "storage" | "nutrition";

export interface GuideSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  kind: GuideKind;
  kindLabel: string;
  title: string;
  excerpt: string;
  image: string;
  readingMinutes: number;
  updated: string;
  /** Editable search metadata */
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string[];
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  categories: string[];
  productIds: string[];
}

export const guides: Guide[] = [
  {
    slug: "mamra-vs-gurbandi-vs-california-almonds",
    kind: "buying-guide",
    kindLabel: "Buying guide",
    title: "Mamra vs Gurbandi vs California almonds: which badam should you buy?",
    excerpt:
      "Three almonds, three very different price tags. Here is how they differ in size, oil content, taste and everyday value.",
    image: "/images/nuts/mamra-almonds.jpg",
    readingMinutes: 5,
    updated: "2026-09-19",
    metaTitle: "Mamra vs Gurbandi vs California Almonds — Which Badam to Buy",
    metaDescription:
      "Compare Mamra, Gurbandi and California almonds on size, oil content, taste and price, and see which badam suits daily snacking, soaking or gifting.",
    keywords:
      "mamra vs california almonds, gurbandi almonds, which badam is best, mamra badam price, almonds proddatur, buy almonds online india",
    intro: [
      "Almonds are sold under a confusing set of names, and the price gap between them is large. The three you will meet most often in India are California almonds, Gurbandi almonds and Mamra almonds.",
      "The short version: California is the everyday almond, Gurbandi is the small oil-rich one many families prefer for soaking, and Mamra is the premium, naturally oily variety usually kept for gifting or a small daily portion.",
    ],
    sections: [
      {
        heading: "California almonds — the everyday choice",
        body: [
          "Long, flat and uniform, California almonds are the ones you see in most kitchens and sweet shops. They are crunchy, mild in taste and hold up well in baking, milkshakes and masala nut mixes.",
          "Because the kernels are uniform, they are also the easiest to portion for a daily snack box.",
        ],
        bullets: [
          "Best for: daily snacking, baking, kheer and sweets",
          "Taste: mild, clean, crunchy",
          "Value: lowest cost per kilo of the three",
        ],
      },
      {
        heading: "Gurbandi almonds — small kernel, big flavour",
        body: [
          "Gurbandi almonds are shorter and plumper than California almonds, with a deeper brown skin and a stronger almond taste. Many households buy them specifically for overnight soaking, because the skin slips off easily in the morning.",
          "You get more kernels per kilo, so a 250g pack lasts longer than you expect.",
        ],
        bullets: [
          "Best for: soaking overnight, stronger almond flavour",
          "Taste: rich, slightly sweet, more intense than California",
          "Value: mid-range",
        ],
      },
      {
        heading: "Mamra almonds — the premium badam",
        body: [
          "Mamra almonds come from high-altitude valleys and are prized for their naturally high oil content. The kernels are curved and irregular, which is a sign of the variety rather than a defect.",
          "They cost noticeably more, so most people buy a smaller pack and eat a fixed portion each day, or use them in festive gift boxes.",
        ],
        bullets: [
          "Best for: a small daily portion, gifting, festive hampers",
          "Taste: buttery, rich, distinctly oily finish",
          "Value: highest price per kilo",
        ],
      },
      {
        heading: "How to choose in 30 seconds",
        body: [
          "Buying for the whole family and finishing a kilo a month? California almonds. Soaking a handful every night? Gurbandi. Buying a gift, or eating five almonds a day with intent? Mamra.",
          "Whatever you pick, buy a smaller pack first, taste it, and only then move up to a kilo.",
        ],
      },
    ],
    faq: [
      {
        q: "Which almond is best for soaking overnight?",
        a: "Gurbandi almonds are the usual pick because the skin peels off easily after soaking and the flavour is stronger. Mamra also soaks well if you prefer a richer taste.",
      },
      {
        q: "Are Mamra almonds worth the extra price?",
        a: "If you eat a small fixed portion daily, or you are buying a gift, the taste difference is easy to notice. For bulk family use and cooking, California almonds give better value.",
      },
      {
        q: "How can I tell Mamra almonds apart?",
        a: "Mamra kernels are curved, irregular in size and feel slightly oily. Perfectly uniform flat kernels are almost always California almonds.",
      },
    ],
    categories: ["nuts"],
    productIds: ["mamra-almonds", "gurbandi-almonds", "california-almonds", "smoky-garlic-almonds"],
  },
  {
    slug: "how-to-store-dry-fruits-and-nuts",
    kind: "storage",
    kindLabel: "Storage guide",
    title: "How to store dry fruits and nuts so they stay fresh for months",
    excerpt:
      "Nuts go soft and stale because of air, heat and light — not time. A few simple habits keep every pack crunchy.",
    image: "/images/dry-fruits/anjeer.jpg",
    readingMinutes: 4,
    updated: "2026-09-19",
    metaTitle: "How to Store Dry Fruits & Nuts to Keep Them Fresh",
    metaDescription:
      "Simple storage rules for almonds, cashews, walnuts, figs and dried fruit: right container, right place, fridge or freezer, and how to spot nuts that have gone off.",
    keywords:
      "how to store dry fruits, store nuts fresh, keep cashews crunchy, dry fruit storage tips, refrigerate walnuts, dry fruits shelf life",
    intro: [
      "Nuts contain a lot of natural oil, and oil turns stale when it meets air, warmth and sunlight. Dried fruit has the opposite problem — it loses moisture and turns hard.",
      "Both problems have the same answer: airtight containers, kept cool and dark.",
    ],
    sections: [
      {
        heading: "The four rules that matter",
        body: ["Get these right and everything else is detail."],
        bullets: [
          "Airtight, not just closed — glass jars or steel dabbas beat the original plastic pouch once it is opened",
          "Cool and dark — a low shelf away from the stove, never above the hob or near a window",
          "Small jars — refill a small jar for daily use and keep the bulk pack sealed",
          "One nut per jar — walnuts pick up smells from spices and onions very quickly",
        ],
      },
      {
        heading: "Fridge or shelf?",
        body: [
          "Walnuts, pecans and pine nuts have the most delicate oils and are the first to taste bitter, so they belong in the fridge or freezer once opened.",
          "Almonds, cashews and pistachios are happy in a cool cupboard for a couple of months. In peak summer, or if your kitchen gets hot, move them to the fridge too.",
          "Soft dried fruits like figs, dates and raisins keep best in the fridge, where they stay chewy instead of drying out.",
        ],
      },
      {
        heading: "Roasted and flavoured nuts",
        body: [
          "Roasting shortens shelf life, and masala or honey coatings attract moisture. Buy flavoured nuts in the size you will actually finish in two or three weeks, and always reseal them straight after serving.",
        ],
      },
      {
        heading: "How to tell a nut has gone off",
        body: [
          "Smell first: fresh nuts smell faintly sweet and buttery, stale ones smell like old paint or oil. A bitter, sharp aftertaste means the oils have turned, and no amount of roasting will fix it.",
          "Discard anything with visible mould, and never keep nuts in a jar that still has moisture in it after washing.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I freeze nuts?",
        a: "Yes. Walnuts, pecans and almonds freeze well in an airtight box for several months. Let them come to room temperature before serving so they stay crunchy.",
      },
      {
        q: "Why did my cashews go soft?",
        a: "Almost always humidity. Reseal the pack immediately after use, keep a small jar for daily serving, and store the rest sealed in a cool cupboard.",
      },
      {
        q: "Do dried fruits need the fridge?",
        a: "Soft fruits such as figs, dates and raisins stay chewier in the fridge. Firm solar-dried slices keep well in an airtight jar on the shelf.",
      },
    ],
    categories: ["nuts", "dry-fruits", "solar-dried"],
    productIds: ["walnuts", "cashews-w320", "figs", "raisins"],
  },
  {
    slug: "kaju-katli-recipe",
    kind: "recipe",
    kindLabel: "Recipe",
    title: "Kaju katli at home: a simple 4-ingredient festive recipe",
    excerpt:
      "Soft, milky cashew barfi with a glossy finish — made with a bowl of cashews, sugar, water and patience.",
    image: "/images/nuts/cashew-whole.jpeg",
    readingMinutes: 6,
    updated: "2026-09-19",
    metaTitle: "Easy Kaju Katli Recipe — Soft Cashew Barfi in 30 Minutes",
    metaDescription:
      "Step-by-step kaju katli recipe with four ingredients. Which cashews to use, the right sugar syrup stage, kneading tips and how to cut clean diamonds.",
    keywords:
      "kaju katli recipe, cashew barfi recipe, kaju barfi at home, diwali sweets recipe, which cashews for kaju katli",
    intro: [
      "Kaju katli is really just cashews and sugar, which is why the quality of the cashews shows in every bite. Split cashews (tukda) work perfectly here — they grind finer and cost less than whole kernels.",
      "Makes roughly 20 pieces and takes about 30 minutes.",
    ],
    sections: [
      {
        heading: "Ingredients",
        body: [],
        bullets: [
          "250g cashews, preferably split cashews (tukda)",
          "150g sugar",
          "75ml water",
          "2 tsp ghee, plus a little for the rolling surface",
          "Optional: 2 pinches cardamom powder, a few saffron strands",
        ],
      },
      {
        heading: "Method",
        body: [
          "1. Grind the cashews in short pulses to a fine powder. Long continuous grinding warms the nuts and releases oil, which turns the mix into paste — pulse, pause, pulse. Sieve and re-grind any coarse bits.",
          "2. Boil sugar and water together until the syrup turns slightly sticky and forms a single thread when you lift a drop between two fingers — roughly 3 to 4 minutes on a medium flame.",
          "3. Lower the flame and add the cashew powder in one go, stirring constantly so no lumps form.",
          "4. Keep stirring for 4 to 6 minutes until the mixture thickens and starts leaving the sides of the pan as one soft mass. Add ghee and cardamom, mix, then switch off the heat.",
          "5. Transfer to a greased plate. While still warm enough to handle, knead for 2 minutes until smooth and crack-free — this step is what gives katli its shine.",
          "6. Roll to about 4mm thickness between two sheets of greased butter paper, cool for 15 minutes, then cut into diamonds.",
        ],
      },
      {
        heading: "Troubleshooting",
        body: [],
        bullets: [
          "Cracking while rolling: the dough cooled too much — warm it briefly and knead again",
          "Sticky, refuses to set: syrup was undercooked, return the mix to a low flame for 2 minutes",
          "Hard, chewy katli: syrup was overcooked, add a teaspoon of warm milk and knead",
        ],
      },
      {
        heading: "Variations worth trying",
        body: [
          "Press a saffron strand into each diamond before cutting for a festive look, or fold in two tablespoons of finely chopped pistachios for pista-kaju katli. A thin brush of ghee just before serving brings back the gloss on day-old pieces.",
        ],
      },
    ],
    faq: [
      {
        q: "Which cashews are best for kaju katli?",
        a: "Split cashews (tukda) are ideal — they grind finer, behave the same as whole kernels in the recipe and cost less. Whole W320 cashews also work well.",
      },
      {
        q: "How long does kaju katli keep?",
        a: "About a week in an airtight box at room temperature, or two weeks in the fridge. Bring it to room temperature before serving.",
      },
      {
        q: "Can I make it without sugar syrup?",
        a: "Yes, a condensed-milk version is quicker, but the texture is fudgier and it does not keep as long as the syrup method.",
      },
    ],
    categories: ["nuts", "gifting"],
    productIds: ["split-cashews-tukda", "cashews-w320", "saffron", "pistachios"],
  },
  {
    slug: "healthy-trail-mix-recipe",
    kind: "recipe",
    kindLabel: "Recipe",
    title: "Build your own trail mix: a 5-minute recipe you can carry anywhere",
    excerpt:
      "One balanced formula — nuts, dried fruit, seeds and something fun — that you can scale to any jar size.",
    image: "/images/mixes/berry-mix.jpg",
    readingMinutes: 4,
    updated: "2026-09-19",
    metaTitle: "Homemade Trail Mix Recipe — Easy Nut, Seed & Dried Fruit Mix",
    metaDescription:
      "A simple trail mix formula with nuts, seeds and dried fruit, plus portion sizes, office and travel variations and how to keep it fresh.",
    keywords:
      "trail mix recipe, homemade trail mix, healthy office snack, nuts and seeds mix, dry fruit snack box",
    intro: [
      "Shop-bought trail mixes are usually heavy on the cheapest filler. Mixing your own takes five minutes and lets you decide the ratio.",
      "Use this formula and scale it to whatever jar you have.",
    ],
    sections: [
      {
        heading: "The 4-2-1-1 formula",
        body: ["Measure in parts, not grams, so it works with any jar."],
        bullets: [
          "4 parts nuts — almonds, cashews, walnuts, or a mix of all three",
          "2 parts dried fruit — raisins, chopped figs, solar-dried mango or kiwi",
          "1 part seeds — pumpkin, sunflower, or a spoon of chia for texture",
          "1 part 'fun' — dark chocolate almond rocks, roasted makhana or a few pecans",
        ],
      },
      {
        heading: "Three mixes for three moods",
        body: [],
        bullets: [
          "Desk mix: almonds, cashews, raisins, pumpkin seeds — mild and quiet to eat",
          "Travel mix: walnuts, figs, sunflower seeds, dark chocolate rocks — filling, no sticky hands",
          "Tropical mix: cashews, solar-dried mango and pineapple, pumpkin seeds — bright and chewy",
        ],
      },
      {
        heading: "Portioning and freshness",
        body: [
          "A comfortable snack portion is about 30g, roughly a small cupped handful. Portion a week's worth into small jars or reusable pouches so you are not eating straight from the big box.",
          "Mix only what you will finish in two weeks. Dried fruit slowly softens the nuts around it, so fresh small batches always taste better than one giant jar.",
        ],
      },
    ],
    faq: [
      {
        q: "How much trail mix is one serving?",
        a: "Around 30g, which is roughly a small cupped handful. It is calorie-dense, so portioning into small jars helps.",
      },
      {
        q: "Can I roast the nuts first?",
        a: "Yes. Dry-roast them on a low flame for a few minutes and cool completely before mixing, otherwise the residual warmth softens the dried fruit.",
      },
      {
        q: "How long does homemade trail mix last?",
        a: "Two weeks in an airtight jar kept cool and dark. Mixes with chocolate are best kept in the fridge in summer.",
      },
    ],
    categories: ["mixes", "seeds", "nuts", "solar-dried"],
    productIds: ["power-trail-mix", "seeds-pumpkin", "raisins", "dark-chocolate-almond-rocks"],
  },
  {
    slug: "how-to-choose-dry-fruits-online",
    kind: "buying-guide",
    kindLabel: "Buying guide",
    title: "How to buy dry fruits online without getting a bad batch",
    excerpt:
      "Grades, pack sizes, harvest freshness and the small signals that separate a good seller from a cheap one.",
    image: "/images/dry-fruits/dates.jpg",
    readingMinutes: 5,
    updated: "2026-09-19",
    metaTitle: "How to Buy Dry Fruits Online — A Practical Buying Guide",
    metaDescription:
      "Understand cashew grades like W180 and W320, pick the right pack size, judge freshness on arrival and know when bulk buying actually saves money.",
    keywords:
      "buy dry fruits online, cashew grades w180 w320, dry fruits buying guide, best pack size dry fruits, dry fruits proddatur",
    intro: [
      "Online listings all look the same: a bowl of nuts, the word premium, a discount badge. The useful information is in the grade, the pack size and how the seller handles freshness.",
    ],
    sections: [
      {
        heading: "Learn the grades, at least for cashews",
        body: [
          "Cashew grades describe size and shape, not quality of taste. W180 is the largest whole kernel, W320 is the standard whole kernel most families buy, and tukda means split pieces.",
          "Splits taste identical and cost noticeably less, which makes them the smart choice for grinding, sweets and cooking. Save whole W180 kernels for serving and gifting.",
        ],
      },
      {
        heading: "Buy the pack size you will finish",
        body: [
          "A kilo looks cheaper per gram, but nuts lose their crunch once opened, so the last 300g often disappoint. Unless you have a large family or airtight storage sorted, 250g or 500g packs give better eating.",
          "For a first order from any new seller, buy the smallest pack. Taste it, then scale up.",
        ],
      },
      {
        heading: "What to check the moment the parcel arrives",
        body: [],
        bullets: [
          "Smell: sweet and buttery is good, paint-like or sour means stale oils",
          "Snap: a fresh almond or cashew breaks cleanly instead of bending",
          "Colour: uniform, not patchy or dull grey",
          "No dust or broken crumbs at the bottom of a whole-kernel pack",
          "Sealed pouch, intact, with no moisture inside",
        ],
      },
      {
        heading: "Signals of a seller worth reordering from",
        body: [
          "Clear grade and weight on every listing, honest photographs of the actual kernels, a reachable phone number, and a straightforward answer when you ask how recent the stock is.",
          "A local shop that also sells online is often the safest bet — you can call and ask what came in this week.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the difference between W180 and W320 cashews?",
        a: "Both are whole kernels; W180 is larger and pricier, W320 is the standard family size. Taste is the same, so choose W180 for serving and gifting.",
      },
      {
        q: "Are split cashews lower quality?",
        a: "No. Splits are simply broken kernels. They taste identical and are the better value choice for sweets, grinding and everyday cooking.",
      },
      {
        q: "Is buying a kilo cheaper?",
        a: "Per gram, yes — but only if you can store it airtight and finish it in a couple of months. Otherwise two 500g packs eat better.",
      },
    ],
    categories: ["nuts", "dry-fruits", "gifting"],
    productIds: ["super-jumbo-cashews-w180", "cashews-w320", "split-cashews-tukda", "figs"],
  },
  {
    slug: "raw-wild-honey-guide",
    kind: "buying-guide",
    kindLabel: "Buying guide",
    title: "Raw wild honey: why it crystallises, and how to use it well",
    excerpt:
      "Unfiltered honey behaves differently from the clear supermarket bottle. That is the point — here is what to expect.",
    image: "/images/catalog/honey-amla.png",
    readingMinutes: 4,
    updated: "2026-09-19",
    metaTitle: "Raw Wild Honey Guide — Crystallisation, Storage & Everyday Uses",
    metaDescription:
      "What raw unfiltered honey is, why it turns grainy, how to soften it safely, how to store it and simple ways to use it every day.",
    keywords:
      "raw wild honey, why does honey crystallise, unfiltered honey india, natural forest honey, honey storage tips",
    intro: [
      "Raw honey is collected, strained of debris and bottled — not heated to a shine or filtered until it is clear. So it looks cloudy, varies from batch to batch and turns grainy over time.",
      "None of that is a fault. It is what unprocessed honey does.",
    ],
    sections: [
      {
        heading: "Why it crystallises",
        body: [
          "Honey is a very concentrated sugar solution. Over weeks or months the natural glucose in it settles into crystals, which is why the jar turns thick, pale and grainy — faster in cooler weather.",
          "Crystallised honey has not spoiled. Many people prefer the spreadable texture.",
        ],
      },
      {
        heading: "How to soften it safely",
        body: [
          "Stand the closed jar in a bowl of warm — not boiling — water for 10 to 15 minutes and stir. Repeat rather than rushing it with high heat, which dulls both the aroma and the flavour.",
          "Avoid the microwave; it heats unevenly and scorches the honey at the edges.",
        ],
      },
      {
        heading: "Storing it",
        body: [],
        bullets: [
          "Room temperature, lid tight, away from sunlight",
          "Never in the fridge — cold speeds up crystallisation",
          "Always a dry spoon; a single drop of water invites fermentation",
        ],
      },
      {
        heading: "Simple everyday uses",
        body: [
          "Drizzle over curd with chopped walnuts and figs, stir into warm (not hot) milk, whisk with lemon and mustard for a salad dressing, or brush over roasted nuts for a quick honey-glazed snack.",
          "Honey is still sugar, so treat it as a sweetener rather than a health supplement, and keep it away from children under one year.",
        ],
      },
    ],
    faq: [
      {
        q: "Is crystallised honey still good?",
        a: "Yes. Crystallisation is natural in raw honey. Warm the jar gently in water and stir if you prefer it runny.",
      },
      {
        q: "Should honey be refrigerated?",
        a: "No. Cold temperatures speed up crystallisation. Keep it at room temperature, tightly closed and out of direct sunlight.",
      },
      {
        q: "Why does each batch look different?",
        a: "Colour and aroma depend on the flowers the bees visited and the season, so unfiltered honey varies naturally from batch to batch.",
      },
    ],
    categories: ["honey", "nuts"],
    productIds: ["wild-honey", "honey-amla", "honey-sesame-cashews", "walnuts"],
  },
];

export const getGuide = (slug?: string) => guides.find((g) => g.slug === slug);
