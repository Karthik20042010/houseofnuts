import fs from "fs";
import path from "path";

const API_URL = "https://script.google.com/macros/s/AKfycby2SAhuk8unb47wnbuowm_7LqQul7SFkj34TnMI1OJVc23b9uKyDQidQjDUkeKgZ5Q/exec";
const CATALOG_DIR = path.resolve("./public/images/catalog");

// Mapping image filenames to productId & category
const PRODUCT_MAP = [
  { file: "almonds.jpg", id: "california-almonds", category: "nuts" },
  { file: "mamra-almonds.jpg", id: "mamra-almonds", category: "nuts" },
  { file: "cashews.jpg", id: "jumbo-cashews", category: "nuts" },
  { file: "pistachios.jpg", id: "pistachios-salted", category: "nuts" },
  { file: "walnuts.jpg", id: "chilean-walnuts", category: "nuts" },
  { file: "dates.jpg", id: "medjool-dates", category: "dry-fruits" },
  { file: "berry-mix.jpg", id: "berry-trail-mix", category: "mixes" },
  { file: "anjeer.jpg", id: "anjeer-figs", category: "dry-fruits" },
  { file: "apricots.jpg", id: "turkish-apricots", category: "dry-fruits" },
  { file: "black-raisins.jpg", id: "black-raisins", category: "dry-fruits" },
  { file: "brazil-nuts.jpg", id: "brazil-nuts", category: "nuts" },
  { file: "chia.jpg", id: "chia-seeds", category: "seeds" },
  { file: "pumpkin-seeds.jpg", id: "pumpkin-seeds", category: "seeds" },
  { file: "makhana.jpg", id: "foxnuts-makhana", category: "solar-dried" },
  { file: "cheese-makhana.jpg", id: "cheese-makhana", category: "solar-dried" },
  { file: "peri-peri-makhana.jpg", id: "peri-peri-makhana", category: "solar-dried" },
  { file: "salted-makhana.jpg", id: "salted-makhana", category: "solar-dried" },
  { file: "trail-mix.jpg", id: "daily-trail-mix", category: "mixes" },
  { file: "roasted-almonds.jpg", id: "roasted-almonds", category: "nuts" },
  { file: "roasted-cashews.jpg", id: "roasted-cashews", category: "nuts" },
  { file: "roasted-pistachios.jpg", id: "roasted-pistachios", category: "nuts" },
  { file: "roasted-walnuts.jpg", id: "roasted-walnuts", category: "nuts" },
  { file: "salted-almonds.jpg", id: "salted-almonds", category: "nuts" },
  { file: "salted-cashews.jpg", id: "salted-cashews", category: "nuts" },
  { file: "fried-cashews.jpg", id: "fried-cashews", category: "nuts" },
  { file: "masala-cashews.jpg", id: "masala-cashews", category: "nuts" },
  { file: "honey-walnuts.jpg", id: "honey-walnuts", category: "honey" },
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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "uploadImage",
          productId: item.id,
          category: item.category,
          filename: item.file,
          mimeType: "image/jpeg",
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
          console.warn(`  ⚠️ Error: ${json.error || resText}`);
        }
      } catch (e) {
        console.warn(`  ⚠️ Raw response: ${resText.slice(0, 100)}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to upload ${item.file}:`, err.message);
    }
  }

  console.log("\n✅ Automated Google Drive catalog upload process completed.");
}

uploadAll();
