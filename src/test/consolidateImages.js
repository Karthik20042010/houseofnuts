import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicImages = path.resolve(__dirname, "../../public/images");
const refProducts = path.join(publicImages, "reference-site", "products");

const targetCategories = {
  nuts: [
    "almonds.jpg", "cashews.jpg", "pistachios.jpg", "walnuts.jpg", "brazil-nuts.jpg",
    "hazelnut.jpg", "hazelnuts.jpg", "macadamia-nuts.jpg", "makhana.jpg", "mamra-almonds.jpg",
    "masala-cashews.jpg", "peri-peri-makhana.jpg", "plain-pistachios.jpg", "roasted-almonds.jpg",
    "roasted-cashews.jpg", "roasted-pistachios.jpg", "roasted-walnuts.jpg", "salted-almonds.jpg",
    "salted-cashews.jpg", "salted-makhana.jpg", "cheese-makhana.jpg", "chilgoza.jpg",
    "fried-cashews.jpg", "gurbandi-almonds.jpg", "honey-walnuts.jpg"
  ],
  "dry-fruits": [
    "anjeer.jpg", "apricots.jpg", "dates.jpg", "raisins.jpg", "black-raisins.jpg",
    "dried-cranberries.jpg", "dried-kiwi.jpg"
  ],
  mixes: [
    "berry-mix.jpg", "mixed-dry-fruit-pack.jpg", "panchmeva.jpg", "trail-mix.jpg"
  ],
  gifting: [
    "corporate-gift-box.jpg", "gift-box-classic.jpg", "gift-hamper-luxury.jpg",
    "gift-pack-premium.jpg", "gift-tray.jpg", "dry-fruits-thali.jpg"
  ],
  seeds: [
    "chia.jpg", "flax-seeds.jpg", "pumpkin-seeds.jpg"
  ]
};

// Ensure directories exist
for (const cat of Object.keys(targetCategories)) {
  const dir = path.join(publicImages, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

if (fs.existsSync(refProducts)) {
  const files = fs.readdirSync(refProducts);
  for (const file of files) {
    const srcFile = path.join(refProducts, file);
    let targetCat = "nuts";

    for (const [cat, list] of Object.entries(targetCategories)) {
      if (list.includes(file)) {
        targetCat = cat;
        break;
      }
    }

    const destFile = path.join(publicImages, targetCat, file);
    try {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied: ${file} -> public/images/${targetCat}/${file}`);
    } catch (e) {
      console.error(`Error copying ${file}:`, e.message);
    }
  }
}

console.log("Image consolidation complete!");
