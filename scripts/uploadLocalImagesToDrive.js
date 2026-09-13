import fs from "fs";
import path from "path";

// Read API URL from .env if available
let API_URL = "https://script.google.com/macros/s/AKfycby2SAhuk8unb47wnbuowm_7LqQul7SFkj34TnMI1OJVc23b9uKyDQidQjDUkeKgZ5Q/exec";
try {
  const envPath = path.resolve("./.env");
  if (fs.existsSync(envPath)) {
    const envText = fs.readFileSync(envPath, "utf-8");
    const match = envText.match(/VITE_APPS_SCRIPT_URL=(.+)/);
    if (match && match[1]) {
      API_URL = match[1].trim();
    }
  }
} catch (e) {
  // Use fallback
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const CATALOG_DIR = path.resolve("./public/images/catalog");

// Mapping image filenames to productId & category
const PRODUCT_MAP = [
  { file: "almonds.jpg", id: "california-almonds", category: "nuts" },
  { file: "mamra-almonds.jpg", id: "mamra-almonds", category: "nuts" },
  { file: "cashews.jpg", id: "cashews-w320", category: "nuts" },
  { file: "cashews.jpg", id: "jumbo-cashews", category: "nuts" },
  { file: "walnuts.jpg", id: "walnuts", category: "nuts" },
  { file: "pistachios.jpg", id: "pistachios", category: "nuts" },
  { file: "brazil-nuts.jpg", id: "brazil-nuts", category: "nuts" },
  { file: "pecan-nuts.png", id: "pecan-nuts", category: "nuts" },

  { file: "blueberry.png", id: "blueberries", category: "dry-fruits" },
  { file: "blackberry.png", id: "blackberries", category: "dry-fruits" },
  { file: "plum.png", id: "plum-standard", category: "dry-fruits" },
  { file: "plum.png", id: "plum-premium", category: "dry-fruits" },
  { file: "anjeer.jpg", id: "figs", category: "dry-fruits" },
  { file: "raisins.jpg", id: "raisins", category: "dry-fruits" },

  { file: "dried-mango.png", id: "solar-mango", category: "solar-dried" },
  { file: "dried-pineapple.png", id: "solar-pineapple", category: "solar-dried" },
  { file: "dried-kiwi.jpg", id: "dried-kiwi-slices", category: "solar-dried" },
  { file: "sweet-kiwi.png", id: "sweet-dried-kiwi", category: "solar-dried" },
  { file: "honey-amla.png", id: "honey-amla", category: "solar-dried" },
  { file: "jeera-amla.png", id: "jeera-amla", category: "solar-dried" },
  { file: "salt-amla.png", id: "salt-amla", category: "solar-dried" },

  { file: "chia.jpg", id: "seeds-chia", category: "seeds" },
  { file: "flax-seeds.png", id: "seeds-flax", category: "seeds" },
  { file: "haleem-seeds.png", id: "seeds-haleem", category: "seeds" },
  { file: "sunflower-seeds.png", id: "seeds-sunflower", category: "seeds" },
  { file: "pumpkin-seeds.jpg", id: "seeds-pumpkin", category: "seeds" },
  { file: "chia.jpg", id: "seeds-watermelon", category: "seeds" },

  { file: "makhana.jpg", id: "phool-makhana", category: "mixes" },
  { file: "trail-mix.jpg", id: "power-trail-mix", category: "mixes" },
];

async function uploadAll() {
  console.log("-------------------------------------------------------------------");
  console.log("House of Nuts — Automated Google Drive Category Image Uploader");
  console.log("Target API:", API_URL);
  console.log("-------------------------------------------------------------------");

  for (const item of PRODUCT_MAP) {
    const filePath = path.join(CATALOG_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[SKIP] File not found: ${item.file}`);
      continue;
    }

    try {
      console.log(`[UPLOADING] ${item.file} -> Category: ${item.category} (Product: ${item.id})...`);
      const fileBuffer = fs.readFileSync(filePath);
      const dataBase64 = fileBuffer.toString("base64");
      const ext = path.extname(item.file).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "uploadImage",
          password: ADMIN_PASSWORD,
          productId: item.id,
          category: item.category,
          filename: item.file,
          mimeType: mimeType,
          dataBase64: dataBase64
        }),
        redirect: "follow"
      });

      const resText = await response.text();
      try {
        const json = JSON.parse(resText);
        if (json.ok) {
          console.log(`  ✅ Success: ${json.url}`);
        } else {
          console.warn(`  ⚠️ Response: ${json.error || resText}`);
        }
      } catch (e) {
        console.warn(`  ⚠️ Raw response: ${resText.slice(0, 100)}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to upload ${item.file}:`, err.message);
    }
  }

  console.log("\n✅ Google Drive catalog upload process completed.");
}

uploadAll();
