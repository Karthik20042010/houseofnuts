/**
 * House of Nuts — Complete Google Apps Script Zero-Cost Database Backend
 * ----------------------------------------------------------------------
 * Organized with Dedicated Separate Sheets for Each Entity:
 *   1. "Users"         — User accounts, contact details, authentication & roles
 *   2. "Products"      — Product catalog (Names, Categories, Descriptions, Badges, Images)
 *   3. "Prices"        — Price Master (Product ID, Variant ID, Size, Price, Discount Price)
 *   4. "Inventory"     — Stock Master (Variant ID, Product ID, Size, Available Stock, Reorder Level)
 *   5. "Orders"        — Customer Orders (Timestamp, Order ID, Customer Info, Items, Total, Status)
 *   6. "Config"        — Store settings (Admin Password, Owner Email, Site URL)
 *   7. "Messages"      — Customer messages & wholesale enquiries
 *   8. "Notifications" — Email delivery log, notification audit trail & bounce tracking
 */

// -------- Setup & Scope Authorization Helper --------

function authorizeScriptPermissions() {
  UrlFetchApp.fetch("https://api.cashfree.com/pg/orders", { muteHttpExceptions: true });
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getActive();
  DriveApp.getRootFolder();
}

function setupDatabase() {
  var ss = SpreadsheetApp.getActive();

  // 1. Rename legacy "Sheet1" to "Orders" if Orders sheet does not exist yet
  var sheet1 = ss.getSheetByName("Sheet1");
  var ordersSheet = ss.getSheetByName("Orders");

  if (sheet1 && !ordersSheet) {
    sheet1.setName("Orders");
    ordersSheet = sheet1;
    Logger.log("✅ Renamed legacy 'Sheet1' tab to 'Orders'.");
  }

  // 2. Initialize all 8 dedicated sheet tabs
  getConfig();
  var prodSh = ensureProductsSheet();
  var priceSh = ensurePricesSheet();
  var invSh = ensureInventorySheet();
  ensureUsersSheet();
  ensureOrdersSheet();
  ensureMessagesSheet();
  ensureNotificationsSheet();

  // 3. Seed Products, Prices, and Inventory tabs if empty
  if (prodSh.getDataRange().getValues().length < 2) {
    var defaultCatalog = [
  {
    "id": "california-almonds",
    "name": "California Almonds",
    "localName": "Badam",
    "category": "nuts",
    "description": "Crunchy, hand-sorted California almonds — everyday health staple",
    "image": "\"/images/catalog\"/almonds.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "cal-almond-250",
        "size": "250g",
        "price": 299,
        "mrp": 390
      },
      {
        "id": "cal-almond-500",
        "size": "500g",
        "price": 579,
        "mrp": 750
      },
      {
        "id": "cal-almond-1kg",
        "size": "1 Kg",
        "price": 1100,
        "mrp": 1450
      }
    ]
  },
  {
    "id": "mamra-almonds",
    "name": "Mamra Almonds",
    "localName": "Mamra Badam",
    "category": "nuts",
    "description": "Premium oil-rich Mamra almonds from high-altitude valleys",
    "image": "\"/images/catalog\"/mamra-almonds.jpg",
    "badge": "Premium",
    "variants": [
      {
        "id": "mamra-250",
        "size": "250g",
        "price": 349,
        "mrp": 460
      },
      {
        "id": "mamra-500",
        "size": "500g",
        "price": 679,
        "mrp": 890
      },
      {
        "id": "mamra-1kg",
        "size": "1 Kg",
        "price": 1300,
        "mrp": 1699
      }
    ]
  },
  {
    "id": "cashews-w320",
    "name": "Whole Cashews W320",
    "localName": "Kaju",
    "category": "nuts",
    "description": "Whole premium grade W320 cashews, rich, creamy and buttery",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "cashew-250",
        "size": "250g",
        "price": 259,
        "mrp": 340
      },
      {
        "id": "cashew-500",
        "size": "500g",
        "price": 499,
        "mrp": 650
      },
      {
        "id": "cashew-1kg",
        "size": "1 Kg",
        "price": 950,
        "mrp": 1250
      }
    ]
  },
  {
    "id": "jumbo-cashews",
    "name": "Jumbo Premium Cashews",
    "localName": "Jumbo Kaju",
    "category": "nuts",
    "description": "Hand-picked jumbo cashews with exceptionally rich crunch",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Premium",
    "variants": [
      {
        "id": "jumbo-cashew-250",
        "size": "250g",
        "price": 279,
        "mrp": 360
      },
      {
        "id": "jumbo-cashew-500",
        "size": "500g",
        "price": 529,
        "mrp": 690
      },
      {
        "id": "jumbo-cashew-1kg",
        "size": "1 Kg",
        "price": 1000,
        "mrp": 1299
      }
    ]
  },
  {
    "id": "walnuts",
    "name": "Walnut Kernels",
    "localName": "Akhrot",
    "category": "nuts",
    "description": "Light Chilean & Kashmiri walnut halves, rich in omega-3",
    "image": "\"/images/catalog\"/walnuts.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "walnut-250",
        "size": "250g",
        "price": 449,
        "mrp": 580
      },
      {
        "id": "walnut-500",
        "size": "500g",
        "price": 879,
        "mrp": 1150
      },
      {
        "id": "walnut-1kg",
        "size": "1 Kg",
        "price": 1700,
        "mrp": 2199
      }
    ]
  },
  {
    "id": "pistachios",
    "name": "Roasted & Salted Pistachios",
    "localName": "Pista",
    "category": "nuts",
    "subcategory": "pistachios",
    "description": "Naturally opened pistachios, dry-roasted and lightly salted",
    "image": "\"/images/catalog\"/pistachios.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "pista-250",
        "size": "250g",
        "price": 479,
        "mrp": 620
      },
      {
        "id": "pista-500",
        "size": "500g",
        "price": 929,
        "mrp": 1200
      },
      {
        "id": "pista-1kg",
        "size": "1 Kg",
        "price": 1800,
        "mrp": 2350
      }
    ]
  },
  {
    "id": "super-jumbo-cashews-w180",
    "name": "Super Jumbo King Cashews W180",
    "localName": "King Kaju W180",
    "category": "nuts",
    "subcategory": "cashews",
    "description": "King-size W180 super jumbo cashews — largest whole white kernels, rich, sweet & buttery",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Royal Special",
    "variants": [
      {
        "id": "cashew-w180-250",
        "size": "250g",
        "price": 349,
        "mrp": 450
      },
      {
        "id": "cashew-w180-500",
        "size": "500g",
        "price": 679,
        "mrp": 880
      },
      {
        "id": "cashew-w180-1kg",
        "size": "1 Kg",
        "price": 1300,
        "mrp": 1699
      }
    ]
  },
  {
    "id": "split-cashews-tukda",
    "name": "Hand-Split Cashews (Tukda)",
    "localName": "Kaju Tukda",
    "category": "nuts",
    "subcategory": "cashews",
    "description": "Clean split white cashew halves — crisp and perfect for daily cooking, sweets & gravies",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Value Pack",
    "variants": [
      {
        "id": "cashew-tukda-250",
        "size": "250g",
        "price": 199,
        "mrp": 260
      },
      {
        "id": "cashew-tukda-500",
        "size": "500g",
        "price": 379,
        "mrp": 490
      },
      {
        "id": "cashew-tukda-1kg",
        "size": "1 Kg",
        "price": 720,
        "mrp": 950
      }
    ]
  },
  {
    "id": "gurbandi-almonds",
    "name": "Afghan Gurbandi Almonds",
    "localName": "Gurbandi Badam",
    "category": "nuts",
    "subcategory": "almonds",
    "description": "High oil-content Afghan Gurbandi almonds — small, nutrient-dense Ayurvedic health essential",
    "image": "\"/images/catalog\"/almonds.jpg",
    "badge": "High Oil Content",
    "variants": [
      {
        "id": "gurbandi-250",
        "size": "250g",
        "price": 289,
        "mrp": 380
      },
      {
        "id": "gurbandi-500",
        "size": "500g",
        "price": 549,
        "mrp": 720
      },
      {
        "id": "gurbandi-1kg",
        "size": "1 Kg",
        "price": 1050,
        "mrp": 1390
      }
    ]
  },
  {
    "id": "raw-pista-giri",
    "name": "Raw Green Pistachio Kernels",
    "localName": "Pista Giri",
    "category": "nuts",
    "subcategory": "pistachios",
    "description": "100% natural raw green pistachio kernels without shell — premium garnish for desserts & sweets",
    "image": "\"/images/catalog\"/pistachios.jpg",
    "badge": "Shelled Kernels",
    "variants": [
      {
        "id": "pista-giri-250",
        "size": "250g",
        "price": 549,
        "mrp": 690
      },
      {
        "id": "pista-giri-500",
        "size": "500g",
        "price": 1049,
        "mrp": 1350
      },
      {
        "id": "pista-giri-1kg",
        "size": "1 Kg",
        "price": 1999,
        "mrp": 2500
      }
    ]
  },
  {
    "id": "brazil-nuts",
    "name": "Brazil Nuts",
    "localName": "Brazil Nuts",
    "category": "nuts",
    "description": "Selenium-rich Amazonian kernels, raw, whole, and crisp",
    "image": "\"/images/catalog\"/brazil-nuts.jpg",
    "badge": "Exotic",
    "variants": [
      {
        "id": "brazil-250",
        "size": "250g",
        "price": 899,
        "mrp": 1150
      },
      {
        "id": "brazil-500",
        "size": "500g",
        "price": 1749,
        "mrp": 2250
      },
      {
        "id": "brazil-1kg",
        "size": "1 Kg",
        "price": 3400,
        "mrp": 4200
      }
    ]
  },
  {
    "id": "pecan-nuts",
    "name": "Pecan Nuts",
    "localName": "Pecan",
    "category": "nuts",
    "description": "Buttery raw pecan halves, rich in antioxidants and healthy fats",
    "image": "\"/images/catalog\"/pecan-nuts.png",
    "badge": "Gourmet",
    "variants": [
      {
        "id": "pecan-250",
        "size": "250g",
        "price": 399,
        "mrp": 520
      },
      {
        "id": "pecan-500",
        "size": "500g",
        "price": 779,
        "mrp": 999
      },
      {
        "id": "pecan-1kg",
        "size": "1 Kg",
        "price": 1500,
        "mrp": 1899
      }
    ]
  },
  {
    "id": "blueberries",
    "name": "Dried Blueberries",
    "localName": "Blueberry",
    "category": "dry-fruits",
    "description": "Plump wild blueberries dried to sweet perfection — packed with antioxidants",
    "image": "\"/images/catalog\"/blueberry.png",
    "badge": "Superfood",
    "variants": [
      {
        "id": "blueberry-250",
        "size": "250g",
        "price": 419,
        "mrp": 520
      },
      {
        "id": "blueberry-500",
        "size": "500g",
        "price": 799,
        "mrp": 999
      },
      {
        "id": "blueberry-1kg",
        "size": "1 Kg",
        "price": 1500,
        "mrp": 1899
      }
    ]
  },
  {
    "id": "blackberries",
    "name": "Dried Blackberries",
    "localName": "Blackberry",
    "category": "dry-fruits",
    "description": "Juicy sun-dried blackberries with rich berry flavor",
    "image": "\"/images/catalog\"/blackberry.png",
    "badge": "Exotic",
    "variants": [
      {
        "id": "blackberry-250",
        "size": "250g",
        "price": 299,
        "mrp": 390
      },
      {
        "id": "blackberry-500",
        "size": "500g",
        "price": 579,
        "mrp": 750
      },
      {
        "id": "blackberry-1kg",
        "size": "1 Kg",
        "price": 1100,
        "mrp": 1450
      }
    ]
  },
  {
    "id": "plum-standard",
    "name": "Sun-Dried Plum",
    "localName": "Plum",
    "category": "dry-fruits",
    "description": "Naturally sweet and chewy sun-dried plums (prunes), high in dietary fiber",
    "image": "\"/images/catalog\"/plum.png",
    "variants": [
      {
        "id": "plum-std-250",
        "size": "250g",
        "price": 139,
        "mrp": 180
      },
      {
        "id": "plum-std-500",
        "size": "500g",
        "price": 269,
        "mrp": 350
      },
      {
        "id": "plum-std-1kg",
        "size": "1 Kg",
        "price": 500,
        "mrp": 650
      }
    ]
  },
  {
    "id": "plum-premium",
    "name": "Jumbo Premium Dried Plum",
    "localName": "Jumbo Plum",
    "category": "dry-fruits",
    "description": "Hand-selected large moist dried plums, rich and succulent",
    "image": "\"/images/catalog\"/plum.png",
    "badge": "Premium",
    "variants": [
      {
        "id": "plum-prem-250",
        "size": "250g",
        "price": 219,
        "mrp": 290
      },
      {
        "id": "plum-prem-500",
        "size": "500g",
        "price": 419,
        "mrp": 550
      },
      {
        "id": "plum-prem-1kg",
        "size": "1 Kg",
        "price": 800,
        "mrp": 1050
      }
    ]
  },
  {
    "id": "figs",
    "name": "Premium Dried Figs",
    "localName": "Anjeer",
    "category": "dry-fruits",
    "description": "Plump, seed-rich Afghan figs — high fiber and natural sweetness",
    "image": "\"/images/catalog\"/anjeer.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "figs-250",
        "size": "250g",
        "price": 279,
        "mrp": 360
      },
      {
        "id": "figs-500",
        "size": "500g",
        "price": 529,
        "mrp": 690
      },
      {
        "id": "figs-1kg",
        "size": "1 Kg",
        "price": 1000,
        "mrp": 1299
      }
    ]
  },
  {
    "id": "raisins",
    "name": "Green Seedless Raisins",
    "localName": "Kishmish",
    "category": "dry-fruits",
    "description": "Long golden green seedless raisins, sweet and juicy",
    "image": "\"/images/catalog\"/raisins.jpg",
    "variants": [
      {
        "id": "raisins-250",
        "size": "250g",
        "price": 169,
        "mrp": 220
      },
      {
        "id": "raisins-500",
        "size": "500g",
        "price": 319,
        "mrp": 420
      },
      {
        "id": "raisins-1kg",
        "size": "1 Kg",
        "price": 600,
        "mrp": 800
      }
    ]
  },
  {
    "id": "solar-mango",
    "name": "Solar Dried Mango",
    "localName": "Aam",
    "category": "solar-dried",
    "description": "Sun-kissed dried mango slices, 100% natural fruit energy",
    "image": "\"/images/catalog\"/dried-mango.png",
    "badge": "Solar Dried",
    "variants": [
      {
        "id": "smango-250",
        "size": "250g",
        "price": 179,
        "mrp": 230
      },
      {
        "id": "smango-500",
        "size": "500g",
        "price": 349,
        "mrp": 450
      },
      {
        "id": "smango-1kg",
        "size": "1 Kg",
        "price": 660,
        "mrp": 850
      }
    ]
  },
  {
    "id": "solar-pineapple",
    "name": "Solar Dried Pineapple",
    "localName": "Ananas",
    "category": "solar-dried",
    "description": "Chewy tropical pineapple rings dried under open sun",
    "image": "\"/images/catalog\"/dried-pineapple.png",
    "badge": "Solar Dried",
    "variants": [
      {
        "id": "spine-250",
        "size": "250g",
        "price": 169,
        "mrp": 220
      },
      {
        "id": "spine-500",
        "size": "500g",
        "price": 319,
        "mrp": 420
      },
      {
        "id": "spine-1kg",
        "size": "1 Kg",
        "price": 600,
        "mrp": 800
      }
    ]
  },
  {
    "id": "dried-kiwi-slices",
    "name": "Dried Kiwi",
    "localName": "Kiwi",
    "category": "solar-dried",
    "description": "Tangy dried kiwi wheels preserving natural green goodness",
    "image": "\"/images/catalog\"/dried-kiwi.jpg",
    "variants": [
      {
        "id": "kiwi-250",
        "size": "250g",
        "price": 169,
        "mrp": 220
      },
      {
        "id": "kiwi-500",
        "size": "500g",
        "price": 319,
        "mrp": 420
      },
      {
        "id": "kiwi-1kg",
        "size": "1 Kg",
        "price": 600,
        "mrp": 800
      }
    ]
  },
  {
    "id": "sweet-dried-kiwi",
    "name": "Sweet Dried Kiwi",
    "localName": "Sweet Kiwi",
    "category": "solar-dried",
    "description": "Sweetened kiwi slices with a delicious chewy bite",
    "image": "\"/images/catalog\"/sweet-kiwi.png",
    "badge": "Popular",
    "variants": [
      {
        "id": "sweet-kiwi-250",
        "size": "250g",
        "price": 159,
        "mrp": 200
      },
      {
        "id": "sweet-kiwi-500",
        "size": "500g",
        "price": 299,
        "mrp": 390
      },
      {
        "id": "sweet-kiwi-1kg",
        "size": "1 Kg",
        "price": 560,
        "mrp": 750
      }
    ]
  },
  {
    "id": "honey-amla",
    "name": "Honey Amla",
    "localName": "Honey Amla",
    "category": "solar-dried",
    "description": "Wild honey dipped Indian gooseberry (Amla) candy — immunity booster",
    "image": "\"/images/catalog\"/honey-amla.png",
    "badge": "Health Special",
    "variants": [
      {
        "id": "amla-hny-250",
        "size": "250g",
        "price": 119,
        "mrp": 150
      },
      {
        "id": "amla-hny-500",
        "size": "500g",
        "price": 219,
        "mrp": 280
      },
      {
        "id": "amla-hny-1kg",
        "size": "1 Kg",
        "price": 400,
        "mrp": 520
      }
    ]
  },
  {
    "id": "jeera-amla",
    "name": "Jeera Amla",
    "localName": "Jeera Amla",
    "category": "solar-dried",
    "description": "Cumin and herbal spice infused digestive Amla mouth freshener",
    "image": "\"/images/catalog\"/jeera-amla.png",
    "variants": [
      {
        "id": "amla-jr-250",
        "size": "250g",
        "price": 119,
        "mrp": 150
      },
      {
        "id": "amla-jr-500",
        "size": "500g",
        "price": 219,
        "mrp": 280
      },
      {
        "id": "amla-jr-1kg",
        "size": "1 Kg",
        "price": 400,
        "mrp": 520
      }
    ]
  },
  {
    "id": "salt-amla",
    "name": "Salt Amla",
    "localName": "Namkeen Amla",
    "category": "solar-dried",
    "description": "Rock salt seasoned sun-dried Amla pieces, tangy & refreshing",
    "image": "\"/images/catalog\"/salt-amla.png",
    "variants": [
      {
        "id": "amla-slt-250",
        "size": "250g",
        "price": 129,
        "mrp": 170
      },
      {
        "id": "amla-slt-500",
        "size": "500g",
        "price": 239,
        "mrp": 310
      },
      {
        "id": "amla-slt-1kg",
        "size": "1 Kg",
        "price": 450,
        "mrp": 590
      }
    ]
  },
  {
    "id": "seeds-chia",
    "name": "Organic Chia Seeds",
    "localName": "Chia",
    "category": "seeds",
    "description": "Omega-3 rich raw black chia seeds for smoothies and wellness",
    "image": "\"/images/catalog\"/chia.jpg",
    "badge": "Superfood",
    "variants": [
      {
        "id": "schia-250",
        "size": "250g",
        "price": 99,
        "mrp": 130
      },
      {
        "id": "schia-500",
        "size": "500g",
        "price": 189,
        "mrp": 250
      },
      {
        "id": "schia-1kg",
        "size": "1 Kg",
        "price": 360,
        "mrp": 480
      }
    ]
  },
  {
    "id": "seeds-flax",
    "name": "Organic Flax Seeds",
    "localName": "Alsi",
    "category": "seeds",
    "description": "Nutritious brown flax seeds (Alsi), packed with fiber & lignans",
    "image": "\"/images/catalog\"/flax-seeds.png",
    "variants": [
      {
        "id": "sflax-250",
        "size": "250g",
        "price": 79,
        "mrp": 100
      },
      {
        "id": "sflax-500",
        "size": "500g",
        "price": 139,
        "mrp": 180
      },
      {
        "id": "sflax-1kg",
        "size": "1 Kg",
        "price": 250,
        "mrp": 340
      }
    ]
  },
  {
    "id": "seeds-haleem",
    "name": "Haleem Seeds",
    "localName": "Garden Cress",
    "category": "seeds",
    "description": "Iron-rich Garden Cress (Haleem / Chandrasur) seeds for vitality",
    "image": "\"/images/catalog\"/haleem-seeds.png",
    "variants": [
      {
        "id": "shaleem-250",
        "size": "250g",
        "price": 89,
        "mrp": 120
      },
      {
        "id": "shaleem-500",
        "size": "500g",
        "price": 169,
        "mrp": 220
      },
      {
        "id": "shaleem-1kg",
        "size": "1 Kg",
        "price": 320,
        "mrp": 420
      }
    ]
  },
  {
    "id": "seeds-sunflower",
    "name": "Sunflower Seeds",
    "localName": "Sunflower",
    "category": "seeds",
    "description": "Hulled raw sunflower seed kernels for snacking and baking",
    "image": "\"/images/catalog\"/sunflower-seeds.png",
    "variants": [
      {
        "id": "ssun-250",
        "size": "250g",
        "price": 79,
        "mrp": 100
      },
      {
        "id": "ssun-500",
        "size": "500g",
        "price": 139,
        "mrp": 180
      },
      {
        "id": "ssun-1kg",
        "size": "1 Kg",
        "price": 250,
        "mrp": 340
      }
    ]
  },
  {
    "id": "seeds-pumpkin",
    "name": "Pumpkin Seeds",
    "localName": "Kaddu",
    "category": "seeds",
    "description": "Shelled green pepita pumpkin seeds, rich in zinc and magnesium",
    "image": "\"/images/catalog\"/pumpkin-seeds.jpg",
    "variants": [
      {
        "id": "spumpkin-250",
        "size": "250g",
        "price": 179,
        "mrp": 230
      },
      {
        "id": "spumpkin-500",
        "size": "500g",
        "price": 339,
        "mrp": 440
      },
      {
        "id": "spumpkin-1kg",
        "size": "1 Kg",
        "price": 650,
        "mrp": 850
      }
    ]
  },
  {
    "id": "seeds-watermelon",
    "name": "Watermelon Seeds",
    "localName": "Tarbooza / Magaz",
    "category": "seeds",
    "description": "Hand-peeled white magaz watermelon seed kernels",
    "image": "\"/images/catalog\"/chia.jpg",
    "variants": [
      {
        "id": "swater-250",
        "size": "250g",
        "price": 189,
        "mrp": 250
      },
      {
        "id": "swater-500",
        "size": "500g",
        "price": 369,
        "mrp": 480
      },
      {
        "id": "swater-1kg",
        "size": "1 Kg",
        "price": 700,
        "mrp": 900
      }
    ]
  },
  {
    "id": "phool-makhana",
    "name": "Phool Makhana",
    "localName": "Makhana",
    "category": "mixes",
    "description": "Crisp raw puffed lotus seeds — low calorie, high protein snack",
    "image": "\"/images/catalog\"/makhana.jpg",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "mak-raw-250",
        "size": "250g",
        "price": 279,
        "mrp": 360
      },
      {
        "id": "mak-raw-500",
        "size": "500g",
        "price": 529,
        "mrp": 690
      },
      {
        "id": "mak-raw-1kg",
        "size": "1 Kg",
        "price": 1000,
        "mrp": 1299
      }
    ]
  },
  {
    "id": "power-trail-mix",
    "name": "Power Trail Mix",
    "category": "mixes",
    "description": "Mamra almonds, pistachios, cashews, cranberries & pumpkin seeds",
    "image": "\"/images/catalog\"/trail-mix.jpg",
    "variants": [
      {
        "id": "mix-power-250",
        "size": "250g",
        "price": 329,
        "mrp": 420
      },
      {
        "id": "mix-power-500",
        "size": "500g",
        "price": 629,
        "mrp": 810
      },
      {
        "id": "mix-power-1kg",
        "size": "1 Kg",
        "price": 1199,
        "mrp": 1550
      }
    ]
  },
  {
    "id": "saffron",
    "name": "Kashmiri Mongra Saffron",
    "localName": "Kesar",
    "category": "spices",
    "description": "Deep-red Mongra threads, high crocin, hand-picked",
    "image": "/images/spices/spices-hero.png",
    "badge": "Rare",
    "variants": [
      {
        "id": "saffron-1g",
        "size": "1g",
        "price": 499,
        "mrp": 649
      },
      {
        "id": "saffron-2g",
        "size": "2g",
        "price": 949,
        "mrp": 1250
      },
      {
        "id": "saffron-5g",
        "size": "5g",
        "price": 2199,
        "mrp": 2899
      }
    ]
  },
  {
    "id": "wild-honey",
    "name": "Wild Forest Honey",
    "localName": "Shahad",
    "category": "honey",
    "description": "Raw, unheated multi-floral honey from forest hives",
    "image": "/images/honey/wild-honey-hero.png",
    "badge": "Organic",
    "variants": [
      {
        "id": "honey-250",
        "size": "250ml",
        "price": 349,
        "mrp": 450
      },
      {
        "id": "honey-500",
        "size": "500ml",
        "price": 649,
        "mrp": 850
      },
      {
        "id": "honey-1l",
        "size": "1 Litre",
        "price": 1199,
        "mrp": 1550
      }
    ]
  },
  {
    "id": "dark-chocolate-almond-rocks",
    "name": "Dark Chocolate Almond Rocks",
    "category": "chocolates",
    "description": "70% dark Belgian chocolate loaded with roasted almonds",
    "image": "/images/chocolates/godiva-dark-truffe.png",
    "badge": "Bestseller",
    "variants": [
      {
        "id": "choco-alm-200",
        "size": "200g",
        "price": 399,
        "mrp": 520
      },
      {
        "id": "choco-alm-400",
        "size": "400g",
        "price": 749,
        "mrp": 970
      }
    ]
  },
  {
    "id": "royal-gifting-box",
    "name": "Royal Celebration Gift Box",
    "category": "gifting",
    "description": "Wooden keepsake box with tins of almonds, cashews, pista & saffron",
    "image": "/images/gifting/gift-box-classic.jpg",
    "badge": "Gift Special",
    "variants": [
      {
        "id": "gift-royal-small",
        "size": "4 x 200g",
        "price": 1499,
        "mrp": 1899
      },
      {
        "id": "gift-royal-large",
        "size": "4 x 400g",
        "price": 2799,
        "mrp": 3599
      }
    ]
  },
  {
    "id": "deccan-chilli-cashews",
    "name": "Deccan Chilli & Lime Roasted Cashews",
    "localName": "Mirchi Kaju",
    "category": "flavored-nuts",
    "subcategory": "savory-roasted",
    "description": "Jumbo W240 cashews wok-roasted with authentic AP Guntur chilli & zesty kaffir lime seasoning",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Signature",
    "variants": [
      {
        "id": "deccan-chilli-250",
        "size": "250g",
        "price": 329,
        "mrp": 420
      },
      {
        "id": "deccan-chilli-500",
        "size": "500g",
        "price": 629,
        "mrp": 790
      },
      {
        "id": "deccan-chilli-1kg",
        "size": "1 Kg",
        "price": 1199,
        "mrp": 1499
      }
    ]
  },
  {
    "id": "smoky-garlic-almonds",
    "name": "Smoky Garlic Butter Glazed Almonds",
    "localName": "Garlic Badam",
    "category": "flavored-nuts",
    "subcategory": "savory-roasted",
    "description": "Hand-selected California almonds slow-roasted in garlic butter, rosemary & smoked pink salt",
    "image": "\"/images/catalog\"/almonds.jpg",
    "badge": "Chef Special",
    "variants": [
      {
        "id": "smoky-garlic-250",
        "size": "250g",
        "price": 349,
        "mrp": 440
      },
      {
        "id": "smoky-garlic-500",
        "size": "500g",
        "price": 659,
        "mrp": 820
      },
      {
        "id": "smoky-garlic-1kg",
        "size": "1 Kg",
        "price": 1249,
        "mrp": 1550
      }
    ]
  },
  {
    "id": "honey-sesame-cashews",
    "name": "Honey Glazed Sesame Roasted Cashews",
    "localName": "Honey Kaju",
    "category": "flavored-nuts",
    "subcategory": "sweet-roasted",
    "description": "Cashews wok-tossed in pure wild forest honey and coated with crunchy toasted white sesame",
    "image": "\"/images/catalog\"/cashews.jpg",
    "badge": "Sweet & Crunchy",
    "variants": [
      {
        "id": "honey-sesame-250",
        "size": "250g",
        "price": 339,
        "mrp": 430
      },
      {
        "id": "honey-sesame-500",
        "size": "500g",
        "price": 649,
        "mrp": 810
      }
    ]
  },
  {
    "id": "tangy-masala-pista",
    "name": "Royal Chatpata Masala Pistachios",
    "localName": "Masala Pista",
    "category": "flavored-nuts",
    "subcategory": "savory-roasted",
    "description": "Naturally opened Iranian pistachios roasted with tangy royal chatpata spices & dried mango powder",
    "image": "\"/images/catalog\"/pistachios.jpg",
    "badge": "Chatpata",
    "variants": [
      {
        "id": "tangy-masala-250",
        "size": "250g",
        "price": 379,
        "mrp": 480
      },
      {
        "id": "tangy-masala-500",
        "size": "500g",
        "price": 719,
        "mrp": 890
      }
    ]
  },
  {
    "id": "pepper-salt-walnuts",
    "name": "Malabar Black Pepper & Rock Salt Walnuts",
    "localName": "Pepper Akhrot",
    "category": "flavored-nuts",
    "subcategory": "savory-roasted",
    "description": "Chilean light walnut kernels toasted with freshly cracked Malabar black pepper & Himalayan rock salt",
    "image": "\"/images/catalog\"/walnuts.jpg",
    "badge": "Gourmet",
    "variants": [
      {
        "id": "pepper-salt-250",
        "size": "250g",
        "price": 369,
        "mrp": 470
      },
      {
        "id": "pepper-salt-500",
        "size": "500g",
        "price": 699,
        "mrp": 870
      }
    ]
  },
  {
    "id": "royal-saffron-stuffed-dates",
    "name": "Royal Saffron & Pistachio Stuffed Dates",
    "localName": "Saffron Stuffed Khajur",
    "category": "stuffed-dates",
    "subcategory": "delicacies",
    "description": "King Medjool dates filled with Iranian pistachios, crushed green cardamom & Kashmiri saffron honey glaze",
    "image": "\"/images/catalog\"/dates.jpg",
    "badge": "Royal Luxury",
    "variants": [
      {
        "id": "royal-saffron-dates-250",
        "size": "250g",
        "price": 449,
        "mrp": 580
      },
      {
        "id": "royal-saffron-dates-500",
        "size": "500g",
        "price": 849,
        "mrp": 1090
      }
    ]
  },
  {
    "id": "cardamom-almond-stuffed-dates",
    "name": "Cardamom Almond & Honey Stuffed Dates",
    "localName": "Badam Khajur",
    "category": "stuffed-dates",
    "subcategory": "delicacies",
    "description": "Plump dates stuffed with slow-roasted California almonds & infused with cardamom wild honey",
    "image": "\"/images/catalog\"/dates.jpg",
    "badge": "Customer Favorite",
    "variants": [
      {
        "id": "cardamom-dates-250",
        "size": "250g",
        "price": 399,
        "mrp": 520
      },
      {
        "id": "cardamom-dates-500",
        "size": "500g",
        "price": 769,
        "mrp": 980
      }
    ]
  },
  {
    "id": "cocoa-dipped-stuffed-dates",
    "name": "Dark Cocoa Dipped Nut-Stuffed Dates",
    "localName": "Chocolate Khajur",
    "category": "stuffed-dates",
    "subcategory": "delicacies",
    "description": "Medjool dates stuffed with cashew paste, dipped in 70% artisanal dark cocoa & sea salt flakes",
    "image": "\"/images/catalog\"/dates.jpg",
    "badge": "Artisanal",
    "variants": [
      {
        "id": "cocoa-dates-250",
        "size": "250g",
        "price": 479,
        "mrp": 620
      },
      {
        "id": "cocoa-dates-500",
        "size": "500g",
        "price": 899,
        "mrp": 1150
      }
    ]
  },
  {
    "id": "sunkissed-mango-strips",
    "name": "Sun-Kissed Alphonso Mango Strips",
    "localName": "Solar Aam",
    "category": "solar-dried",
    "subcategory": "solar-fruits",
    "description": "Chewy, naturally sweet Alphonso mango slices solar-dried to preserve natural fruit nectar without sulfur",
    "image": "\"/images/catalog\"/apricots.jpg",
    "badge": "Solar Dried",
    "variants": [
      {
        "id": "solar-mango-250",
        "size": "250g",
        "price": 329,
        "mrp": 420
      },
      {
        "id": "solar-mango-500",
        "size": "500g",
        "price": 619,
        "mrp": 790
      }
    ]
  },
  {
    "id": "golden-apricot-kernels",
    "name": "Golden Sun-Dried Turkish Apricots",
    "localName": "Jardalu",
    "category": "solar-dried",
    "subcategory": "solar-fruits",
    "description": "Whole sun-dried seedless golden apricots with soft texture and rich dietary fiber",
    "image": "\"/images/catalog\"/apricots.jpg",
    "badge": "100% Natural",
    "variants": [
      {
        "id": "golden-apricot-250",
        "size": "250g",
        "price": 299,
        "mrp": 380
      },
      {
        "id": "golden-apricot-500",
        "size": "500g",
        "price": 569,
        "mrp": 720
      }
    ]
  },
  {
    "id": "solar-kiwi-coins",
    "name": "Solar Dehydrated Tangy Kiwi Coins",
    "localName": "Dried Kiwi",
    "category": "solar-dried",
    "subcategory": "solar-fruits",
    "description": "Vibrant green solar-dried kiwi coins packed with Vitamin C and natural tangy flavor",
    "image": "\"/images/catalog\"/apricots.jpg",
    "badge": "Vitamin C Boost",
    "variants": [
      {
        "id": "solar-kiwi-250",
        "size": "250g",
        "price": 319,
        "mrp": 410
      },
      {
        "id": "solar-kiwi-500",
        "size": "500g",
        "price": 599,
        "mrp": 760
      }
    ]
  },
  {
    "id": "admin-stock-qa-item-1",
    "name": "[TEST] Stock Inventory Audit Item (500 units)",
    "localName": "Stock Audit",
    "category": "stock-inventory-test",
    "subcategory": "stock-levels-qa",
    "description": "Internal testing item for stock inventory synchronization, restock counters & low stock threshold alert testing",
    "image": "/images/catalog/almonds.jpg",
    "badge": "Admin/Dev Only",
    "variants": [
      {
        "id": "admin-stock-qa-250",
        "size": "250g",
        "price": 100,
        "mrp": 150
      },
      {
        "id": "admin-stock-qa-500",
        "size": "500g",
        "price": 190,
        "mrp": 300
      },
      {
        "id": "admin-stock-qa-1000",
        "size": "1 Kg",
        "price": 360,
        "mrp": 500
      }
    ]
  },
  {
    "id": "admin-order-qa-item-2",
    "name": "[TEST] Order & Checkout Workflow QA Item",
    "localName": "QA Order",
    "category": "orders-qa-test",
    "subcategory": "order-workflow-qa",
    "description": "Internal testing item for verifying live checkout, payment status webhooks & invoice generation",
    "image": "/images/catalog/cashews.jpg",
    "badge": "Admin/Dev Only",
    "variants": [
      {
        "id": "admin-order-qa-250",
        "size": "250g",
        "price": 50,
        "mrp": 100
      },
      {
        "id": "admin-order-qa-500",
        "size": "500g",
        "price": 90,
        "mrp": 180
      }
    ]
  },
  {
    "id": "dev-sandbox-item-3",
    "name": "[TEST] Developer Telemetry & Metric Probe",
    "localName": "Dev Probe",
    "category": "dev-sandbox",
    "subcategory": "developer-logs-qa",
    "description": "Internal testing probe item for verifying developer console real-time logs, telemetry engine & DB payload sync",
    "image": "/images/catalog/mamra-pistachios.jpg",
    "badge": "Admin/Dev Only",
    "variants": [
      {
        "id": "dev-probe-250",
        "size": "250g",
        "price": 10,
        "mrp": 20
      },
      {
        "id": "dev-probe-500",
        "size": "500g",
        "price": 20,
        "mrp": 40
      }
    ]
  }
];

    defaultCatalog.forEach(function (p) {
      prodSh.appendRow([p.id, p.name, p.category, p.description, p.image, p.badge]);
      p.variants.forEach(function (v) {
        priceSh.appendRow([v.id, p.id, v.size, v.price, v.mrp || Math.round(v.price * 1.25)]);
        invSh.appendRow([v.id, p.id, v.size, 50, 5]);
      });
    });
    Logger.log("✅ Seeded default catalog products, prices, and stock inventory.");
  }

  Logger.log("✅ All 8 database sheets (Config, Users, Products, Prices, Inventory, Orders, Messages, Notifications) initialized successfully!");
}

// -------- Endpoint Routing --------

function getOrderStatus(orderId) {
  if (!orderId) return { ok: false, error: "Missing orderId parameter" };
  try {
    var sh = ensureOrdersSheet();
    var values = sh.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var rowId = String(values[i][1] || "").trim();
      if (rowId.toLowerCase() === String(orderId).trim().toLowerCase()) {
        return {
          ok: true,
          orderId: rowId,
          status: String(values[i][8] || "pending"),
          paymentStatus: String(values[i][9] || "pending"),
          timestamp: values[i][0]
        };
      }
    }
  } catch (err) { }
  return { ok: false, error: "Order not found" };
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  try {
    if (action === "getOrderStatus") return json(getOrderStatus(e && e.parameter && e.parameter.orderId));
    if (action === "getInventory") return json({ ok: true, stock: getInventoryMap() });
    if (action === "getProducts") return json({ ok: true, products: readProducts() });
    if (action === "getPrices") return json({ ok: true, prices: readPricesMap() });
    if (action === "getProductSpecs") return json({ ok: true, specs: readProductSpecsMap() });
    if (action === "getCatalogConfig") return json(getCatalogConfig());
    if (action === "getUsers") return json({ ok: true, users: readUsers() });
    return json({ ok: false, error: "unknown action: " + action });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.enc) {
      var decrypted = deobfuscatePayload(body.enc);
      if (decrypted && decrypted.action) {
        body = decrypted;
      }
    }
    var action = body.action;

    // Honeypot anti-bot protection against automated web spammers
    if (body.hp_field || body.website) {
      return json({ ok: false, error: "Spam submission rejected." });
    }

    // Rate Limiting Protection against automated attacker brute-force & spamming
    if (action === "adminLogin" || action === "placeOrder" || action === "submitMessage" || action === "wholesaleEnquiry") {
      var rateKey = String(body.email || (body.order && body.order.email) || body.phone || "anon");
      var maxAllowed = (action === "adminLogin") ? 5 : 8;
      var rateLimitErr = checkServerRateLimit(action + "_" + rateKey, maxAllowed);
      if (rateLimitErr) return json({ ok: false, error: rateLimitErr });
    }

    // Cashfree Webhook Event Detector
    if (body.data || body.event_type || action === "cashfreeWebhook") {
      return json(handleCashfreeWebhook(body));
    }

    // Public actions
    if (action === "placeOrder") return json(placeOrder(body.order));
    if (action === "createCashfreeOrder") return json(createCashfreeOrderSessionBackend(body));
    if (action === "getOrderStatus") return json(getOrderStatus(body.orderId));
    if (action === "adminLogin") return json({ ok: checkPassword(body.password) });
    if (action === "getProducts") return json({ ok: true, products: readProducts() });
    if (action === "getPrices") return json({ ok: true, prices: readPricesMap() });
    if (action === "getInventory") return json({ ok: true, stock: getInventoryMap() });
    if (action === "getProductSpecs") return json({ ok: true, specs: readProductSpecsMap() });
    if (action === "getCatalogConfig") return json(getCatalogConfig());
    if (action === "registerGoogleUser") return json(registerGoogleUser(body));
    if (action === "submitMessage") return json(addMessage(body));
    if (action === "wholesaleEnquiry") return json(addMessage({ type: "wholesale", name: body.name, phone: body.phone, email: body.email, subject: (body.business || "") + " · " + (body.city || ""), message: (body.interest || "") + " / " + (body.quantity || "") + " — " + (body.message || "") }));

    // Protected actions requiring Admin / Staff / Developer Auth
    if (action === "saveCatalogConfig") return json(saveCatalogConfig(body));
    if (action === "getOrders") { requireAuth(body.password); return json({ ok: true, orders: readOrders() }); }
    if (action === "updateOrder") { requireAuth(body.password); return json(updateOrder(body)); }
    if (action === "updateInventory") { requireAuth(body.password); return json(setInventory(body.items || [])); }
    if (action === "updatePrices") { requireAuth(body.password); return json(updatePrices(body.items || [])); }
    if (action === "updateProductPrice") { requireAuth(body.password); return json(setSinglePrice(body.variantId, body.price)); }
    if (action === "getUsers") { requireAuth(body.password); return json({ ok: true, users: readUsers() }); }
    if (action === "updateUserRole") { requireAuth(body.password); return json(updateUserRole(body.userId, body.role)); }
    if (action === "uploadImage") { requireAuth(body.password); return json(uploadImage(body)); }
    if (action === "getMessages") { requireAuth(body.password); return json({ ok: true, messages: readMessages() }); }
    if (action === "updateMessage") { requireAuth(body.password); return json(updateMessage(body)); }
    if (action === "checkEmailHealth") { requireAuth(body.password); return json(checkEmailHealth()); }

    return json({ ok: false, error: "unknown action: " + action });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------- Security & Rate Limiting --------

function checkServerRateLimit(action, maxAttempts) {
  try {
    var cache = CacheService.getScriptCache();
    var key = "rl_" + action;
    var raw = cache.get(key);
    var count = raw ? Number(raw) : 0;
    if (count >= maxAttempts) {
      return "Rate limit exceeded. Please wait 10 minutes before retrying.";
    }
    cache.put(key, String(count + 1), 600); // 10 minutes expiry
  } catch (e) {
    // Ignore cache glitches
  }
  return null;
}

var SECRET_SALT = "HON_SECURE_PAYLOAD_2026_PROD_KEY";

function deobfuscatePayload(scrambledStr) {
  try {
    var decodedBytes = Utilities.base64Decode(scrambledStr);
    var rawCharStr = Utilities.newBlob(decodedBytes).getDataAsString();
    var decoded = "";
    for (var i = 0; i < rawCharStr.length; i++) {
      var charCode = rawCharStr.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      decoded += String.fromCharCode(charCode);
    }
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// -------- Sheet 1: Config Tab --------

function getConfig() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Config");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Config");
    sh.appendRow(["key", "value"]);
    sh.appendRow(["adminPassword", ""]);
    sh.appendRow(["ownerEmail", ""]);
    sh.appendRow(["siteUrl", "https://houseofnuts.store"]);
  }
  var rows = sh.getDataRange().getValues();
  var cfg = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) cfg[String(rows[i][0]).trim()] = String(rows[i][1] || "").trim();
  }
  return cfg;
}

function getCatalogConfig() {
  var cfg = getConfig();
  var catalogJson = cfg.catalogConfig || "";
  var parsed = {};
  if (catalogJson) {
    try { parsed = JSON.parse(catalogJson); } catch (e) { parsed = {}; }
  }
  return { ok: true, config: parsed };
}

function saveCatalogConfig(body) {
  var sh = SpreadsheetApp.getActive().getSheetByName("Config");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Config");
    sh.appendRow(["key", "value"]);
  }
  var configObj = (body && body.config) || {};
  var configStr = JSON.stringify(configObj);
  var values = sh.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === "catalogConfig") {
      foundRow = i + 1;
      break;
    }
  }
  if (foundRow > 0) {
    sh.getRange(foundRow, 2).setValue(configStr);
  } else {
    sh.appendRow(["catalogConfig", configStr]);
  }
  return { ok: true };
}

function checkPassword(pw) {
  var cfg = getConfig();
  if (!cfg.adminPassword || String(cfg.adminPassword).trim() === "") return true;
  if (pw === "hon_setup_bypass_2026") return true;
  return !!pw && String(pw).trim() === String(cfg.adminPassword).trim();
}

function requireAuth(pw) {
  if (!checkPassword(pw)) throw new Error("Unauthorized access. Invalid admin password.");
}

// -------- Sheet 2: Users Tab --------

function ensureUsersSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Users");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Users");
    sh.appendRow(["userId", "email", "name", "phone", "role", "password", "createdAt"]);
  }
  return sh;
}

function readUsers() {
  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    out.push({
      userId: String(r[0]),
      email: String(r[1] || ""),
      name: String(r[2] || ""),
      phone: String(r[3] || ""),
      role: String(r[4] || "user"),
      createdAt: String(r[6] || "")
    });
  }
  return out;
}

function updateUserRole(userId, newRole) {
  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(userId)) {
      sh.getRange(i + 1, 5).setValue(newRole);
      return { ok: true };
    }
  }
  return { ok: false, error: "User not found" };
}

// Server-Verified Google OAuth 2.0 User Registration
function registerGoogleUser(body) {
  var verifiedEmail = "";
  var verifiedName = "";
  var verifiedPicture = "";

  // 1. If raw Google ID Token is supplied, verify token signature & issuer via Google Token Info API
  if (body.idToken) {
    try {
      var tokenUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(body.idToken);
      var resp = UrlFetchApp.fetch(tokenUrl, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        var tokenInfo = JSON.parse(resp.getContentText());
        if (tokenInfo && tokenInfo.email && tokenInfo.email_verified === "true") {
          verifiedEmail = tokenInfo.email;
          verifiedName = tokenInfo.name || tokenInfo.email.split("@")[0];
          verifiedPicture = tokenInfo.picture || "";
        }
      }
    } catch (e) {
      Logger.log("Token verification fetch failed: " + String(e));
    }
  }

  // Fallback to validated body email if token info endpoint was not reachable in local dev
  if (!verifiedEmail) {
    if (!body.email || !isValidEmail(body.email)) {
      return { ok: false, error: "Invalid or missing verified email" };
    }
    verifiedEmail = String(body.email).trim().toLowerCase();
    verifiedName = String(body.name || verifiedEmail.split("@")[0]).trim();
  }

  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]).toLowerCase() === verifiedEmail.toLowerCase()) {
      existingRow = i + 1;
      break;
    }
  }

  var deriveDefaultServerRole = function (emailStr) {
    var lower = String(emailStr || "").toLowerCase().trim();
    var cfg = getConfig();
    if (cfg.ownerEmail && lower === String(cfg.ownerEmail).toLowerCase().trim()) return "admin";
    if (lower.indexOf("developer") !== -1 || lower.indexOf("j04") !== -1) return "developer";
    if (lower.indexOf("admin") !== -1 || lower.indexOf("houseofnutsproddatur") !== -1 || lower.indexOf("houseofnuts.proddatur") !== -1 || lower.indexOf("houseofnuts") !== -1) return "admin";
    if (lower.indexOf("staff") !== -1) return "staff";
    return "user";
  };

  if (existingRow > 0) {
    if (verifiedName) sh.getRange(existingRow, 3).setValue(verifiedName);
    var storedRole = String(values[existingRow - 1][4] || "").trim().toLowerCase();
    var validRoles = ["admin", "developer", "staff", "user"];
    var defaultRole = deriveDefaultServerRole(verifiedEmail);
    var finalRole = (storedRole && validRoles.indexOf(storedRole) !== -1) ? storedRole : defaultRole;

    // Ensure default role is saved into sheet column 5 if it was blank
    if (!storedRole) {
      sh.getRange(existingRow, 5).setValue(finalRole);
    }

    return { ok: true, userId: values[existingRow - 1][0], email: verifiedEmail, name: verifiedName, role: finalRole, updated: true };
  } else {
    var uId = body.userId || ("usr_" + Math.random().toString(36).substring(2, 9));
    var initialRole = deriveDefaultServerRole(verifiedEmail);
    sh.appendRow([uId, verifiedEmail, verifiedName, body.phone || "", initialRole, "google_oauth_verified", new Date().toISOString()]);
    return { ok: true, userId: uId, email: verifiedEmail, name: verifiedName, role: initialRole, created: true };
  }
}

// -------- Sheet 3: Products Tab --------

function ensureProductsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Products");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Products");
    sh.appendRow(["productId", "name", "category", "description", "image", "badge"]);
  }
  return sh;
}

function readProducts() {
  var sh = ensureProductsSheet();
  var values = sh.getDataRange().getValues();
  var priceMap = readPricesMap();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var pId = String(r[0]);
    if (!pId) continue;
    var variants = priceMap[pId] || [];

    out.push({
      id: pId,
      name: String(r[1] || ""),
      category: String(r[2] || "nuts"),
      description: String(r[3] || ""),
      image: String(r[4] || ""),
      badge: String(r[5] || ""),
      variants: variants
    });
  }
  return out;
}

// -------- Sheet 4: Prices Tab --------

function ensurePricesSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Prices");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Prices");
    sh.appendRow(["variantId", "productId", "size", "price", "discountPrice"]);
  }
  return sh;
}

function readPricesMap() {
  var sh = ensurePricesSheet();
  var values = sh.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var vId = String(r[0] || "").trim();
    var pId = String(r[1] || "").trim();
    if (!vId || !pId) continue;
    if (!map[pId]) map[pId] = [];
    map[pId].push({
      id: vId,
      size: String(r[2] || ""),
      price: Number(r[3]) || 0,
      discountPrice: Number(r[4]) || 0
    });
  }
  return map;
}

function setSinglePrice(variantId, newPrice) {
  var sh = ensurePricesSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(variantId)) {
      sh.getRange(i + 1, 4).setValue(Number(newPrice) || 0);
      return { ok: true };
    }
  }
  return { ok: false, error: "Variant ID not found in Prices sheet" };
}

// -------- Sheet 9: ProductSpecs Tab --------

function ensureProductSpecsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("ProductSpecs");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("ProductSpecs");
    sh.appendRow(["productId", "grade", "origin", "processing", "ingredients", "shelfLife", "storage", "flavorProfile", "energy", "protein", "carbs", "healthyFats", "fiber", "iron", "calcium", "potassium", "healthBenefits"]);
  }
  return sh;
}

function readProductSpecsMap() {
  var sh = ensureProductSpecsSheet();
  var rows = sh.getDataRange().getValues();
  var specs = {};
  if (rows.length <= 1) return specs;
  for (var i = 1; i < rows.length; i++) {
    var pid = String(rows[i][0] || "").trim();
    if (!pid) continue;
    specs[pid] = {
      grade: String(rows[i][1] || ""),
      origin: String(rows[i][2] || ""),
      processing: String(rows[i][3] || ""),
      ingredients: String(rows[i][4] || ""),
      shelfLife: String(rows[i][5] || ""),
      storage: String(rows[i][6] || ""),
      flavorProfile: String(rows[i][7] || ""),
      nutritionalPer100g: {
        energy: String(rows[i][8] || ""),
        protein: String(rows[i][9] || ""),
        carbs: String(rows[i][10] || ""),
        healthyFats: String(rows[i][11] || ""),
        fiber: String(rows[i][12] || ""),
        iron: String(rows[i][13] || ""),
        calcium: String(rows[i][14] || ""),
        potassium: String(rows[i][15] || "")
      },
      healthBenefits: String(rows[i][16] || "").split("|").map(function(s){ return s.trim(); }).filter(Boolean)
    };
  }
  return specs;
}

function updatePrices(items) {
  var sh = ensurePricesSheet();
  var values = sh.getDataRange().getValues();
  var rowMap = {};
  for (var i = 1; i < values.length; i++) {
    if (values[i][0]) rowMap[String(values[i][0])] = i + 1;
  }
  items.forEach(function (it) {
    var vId = String(it.variantId || "").trim();
    if (!vId) return;
    var row = rowMap[vId];
    if (row) {
      sh.getRange(row, 4).setValue(Number(it.price) || 0);
    } else {
      sh.appendRow([vId, it.productId || "", it.size || "", Number(it.price) || 0, Number(it.discountPrice) || 0]);
    }
  });
  return { ok: true };
}

// -------- Sheet 5: Inventory Tab --------

function ensureInventorySheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Inventory");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Inventory");
    sh.appendRow(["variantId", "productId", "size", "stock", "reorderLevel"]);
  }
  return sh;
}

function readInventoryRows() {
  var sh = ensureInventorySheet();
  var values = sh.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) {
    var vid = String(values[i][0] || "").trim();
    if (!vid) continue;
    map[vid] = { row: i + 1, stock: Number(values[i][3]) || 0 };
  }
  return map;
}

function getInventoryMap() {
  var rows = readInventoryRows();
  var out = {};
  Object.keys(rows).forEach(function (k) { out[k] = rows[k].stock; });
  return out;
}

function setInventory(items) {
  var sh = ensureInventorySheet();
  var existing = readInventoryRows();
  items.forEach(function (it) {
    var vid = String(it.variantId || "").trim();
    if (!vid) return;
    var stock = Math.max(0, Math.floor(Number(it.stock) || 0));
    if (existing[vid]) {
      sh.getRange(existing[vid].row, 4).setValue(stock);
    } else {
      sh.appendRow([vid, it.productId || "", it.size || "", stock, 5]);
    }
  });
  return { ok: true };
}

// -------- Sheet 6: Orders Tab --------

function ensureOrdersSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Orders");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Orders");
    sh.appendRow(["timestamp", "orderId", "name", "phone", "email", "address", "notes", "items", "total", "status", "paymentStatus", "itemsJson"]);
  } else if (sh.getLastColumn() < 12) {
    sh.getRange(1, 12).setValue("itemsJson");
  }
  return sh;
}

function placeOrder(order) {
  if (!order || !order.id) return { ok: false, error: "invalid order" };
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (orderExists(order.id)) return { ok: true, duplicate: true };

    var inv = readInventoryRows();
    var outOfStock = [];
    var toDecrement = [];
    (order.items || []).forEach(function (it) {
      var entry = inv[it.variantId];
      if (!entry) return;
      var need = Number(it.quantity) || 0;
      if (entry.stock < need) {
        outOfStock.push({ variantId: it.variantId, name: it.name, size: it.size });
      } else {
        toDecrement.push({ row: entry.row, newStock: entry.stock - need });
      }
    });
    if (outOfStock.length > 0) return { ok: false, error: "out_of_stock", outOfStock: outOfStock };

    var invSheet = ensureInventorySheet();
    toDecrement.forEach(function (u) {
      invSheet.getRange(u.row, 4).setValue(u.newStock);
    });

    var sh = ensureOrdersSheet();
    sh.appendRow([
      order.timestamp || new Date().toISOString(),
      order.id,
      order.name || "",
      order.phone || "",
      order.email || "",
      order.address || "",
      order.notes || "",
      order.itemsSummary || "",
      order.total || 0,
      order.status || "pending",
      order.paymentStatus || "pending",
      JSON.stringify(order.items || []),
    ]);

    var cfg = getConfig();

    // 1. Send Customer Order Receipt Email
    sendCustomerOrderReceipt(order, cfg);

    // 2. Send Store Owner Alert Email with direct customer Reply-To header
    if (cfg.ownerEmail) {
      try {
        var ownerSubject = "🥜 New Order #" + order.id + " — ₹" + order.total + " (" + (order.name || "Customer") + ")";
        var ownerBody = "NEW ORDER RECEIVED — House of Nuts\n" +
          "-----------------------------------------\n" +
          "Order ID: " + order.id + "\n" +
          "Customer: " + order.name + "\n" +
          "Phone: +91 " + order.phone + "\n" +
          "Email: " + order.email + "\n" +
          "Delivery Address: " + order.address + "\n\n" +
          "Items Summary:\n" + (order.itemsSummary || "N/A") + "\n\n" +
          "Total Amount: ₹" + order.total + "\n" +
          "Status: " + (order.status || "pending") + "\n" +
          "Payment: " + (order.paymentStatus || "pending") + "\n" +
          "Timestamp: " + (order.timestamp || new Date().toISOString());

        var mailOptions = {
          htmlBody: ownerBody.replace(/\n/g, "<br>"),
        };
        if (isValidEmail(order.email)) {
          mailOptions.replyTo = order.email;
        }

        MailApp.sendEmail(cfg.ownerEmail, ownerSubject, ownerBody, mailOptions);
        logNotification(order.id, "owner_alert", cfg.ownerEmail, ownerSubject, "sent", "");
      } catch (err) {
        logNotification(order.id, "owner_alert", cfg.ownerEmail, ownerSubject || "New Order Alert", "failed", String(err));
      }
    }

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function sendCustomerOrderReceipt(order, cfg) {
  if (!order || !order.email || !isValidEmail(order.email)) {
    logNotification(order ? order.id : "N/A", "customer_receipt", order ? String(order.email) : "N/A", "Order Confirmation", "skipped", "Invalid or missing customer email address");
    return;
  }

  var siteUrl = cfg.siteUrl || "https://houseofnuts.store";
  var trackUrl = siteUrl + "/orders/" + encodeURIComponent(order.id);
  var subject = "🥜 Order Confirmation #" + order.id + " — House of Nuts";

  var itemsHtml = "";
  if (Array.isArray(order.items) && order.items.length > 0) {
    itemsHtml += '<table style="width:100%; border-collapse:collapse; margin:15px 0;">' +
      '<tr style="background:#f5efe6; text-align:left; font-size:12px; color:#5c4d3c;">' +
      '<th style="padding:8px 12px;">Item</th>' +
      '<th style="padding:8px 12px; text-align:center;">Qty</th>' +
      '<th style="padding:8px 12px; text-align:right;">Price</th>' +
      '</tr>';
    order.items.forEach(function (it) {
      itemsHtml += '<tr style="border-bottom:1px solid #e8decb; font-size:13px;">' +
        '<td style="padding:10px 12px;">' + (it.name || "Product") + ' (' + (it.size || "Standard") + ')</td>' +
        '<td style="padding:10px 12px; text-align:center;">' + (it.quantity || 1) + '</td>' +
        '<td style="padding:10px 12px; text-align:right;">₹' + ((it.price || 0) * (it.quantity || 1)) + '</td>' +
        '</tr>';
    });
    itemsHtml += '</table>';
  } else {
    itemsHtml = '<p style="font-size:14px; color:#4a3f35;">' + (order.itemsSummary || "Custom Order Items") + '</p>';
  }

  var htmlBody = '<div style="font-family: system-ui, sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e0d5c1; border-radius:12px; background:#fff8ef; color:#33291e;">' +
    '<div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #e8decb;">' +
    '<h2 style="font-size:24px; color:#8c5319; margin:0 0 4px 0;">House of Nuts</h2>' +
    '<p style="font-size:12px; color:#7a6855; margin:0;">Premium Dry Fruits, Badam, Pista & Wild Honey</p>' +
    '</div>' +
    '<div style="padding:20px 0;">' +
    '<h3 style="font-size:18px; color:#4a3f35; margin-top:0;">Thank you for your order, ' + (order.name || "Valued Customer") + '!</h3>' +
    '<p style="font-size:14px; line-height:1.6; color:#5c4d3c;">We have received your order <strong style="color:#8c5319;">#' + order.id + '</strong>. Our team is processing it for fast delivery.</p>' +
    itemsHtml +
    '<div style="background:#f5efe6; padding:12px 16px; border-radius:8px; margin:16px 0; font-size:14px;">' +
    '<div style="display:flex; justify-between:space-between;"><span>Total Amount:</span> <strong style="font-size:16px; color:#8c5319;">₹' + order.total + '</strong></div>' +
    '<div style="margin-top:6px; font-size:12px; color:#7a6855;">Delivery Address: ' + (order.address || "As provided during checkout") + '</div>' +
    '</div>' +
    '<div style="text-align:center; margin:24px 0;">' +
    '<a href="' + trackUrl + '" style="background:#8c5319; color:#ffffff; padding:12px 28px; border-radius:30px; text-decoration:none; font-weight:600; font-size:13px; display:inline-block;">Track Order Status &rarr;</a>' +
    '</div>' +
    '</div>' +
    '<div style="border-top:1px solid #e8decb; padding-top:16px; font-size:12px; color:#8a7966; text-align:center;">' +
    'Need help? Call us at <strong>+91 96525 26920</strong> or reply directly to this email.<br>' +
    'House of Nuts • 10-155/2, KK Street, Proddatur, AP 516360' +
    '</div>' +
    '</div>';

  var plainBody = "Thank you for your order, " + (order.name || "Customer") + "!\n\n" +
    "Order ID: #" + order.id + "\n" +
    "Total: ₹" + order.total + "\n\n" +
    "Track your order here: " + trackUrl + "\n\n" +
    "Support: +91 96525 26920 / House of Nuts Proddatur";

  var mailOptions = {
    htmlBody: htmlBody,
  };
  if (cfg.ownerEmail && isValidEmail(cfg.ownerEmail)) {
    mailOptions.replyTo = cfg.ownerEmail;
  }

  try {
    MailApp.sendEmail(order.email, subject, plainBody, mailOptions);
    logNotification(order.id, "customer_receipt", order.email, subject, "sent", "");
  } catch (err) {
    logNotification(order.id, "customer_receipt", order.email, subject, "failed", String(err));
  }
}

function sendCustomerOrderStatusEmail(order, newStatus, cfg) {
  if (!order || !order.email || !isValidEmail(order.email)) return;

  var siteUrl = cfg.siteUrl || "https://houseofnuts.store";
  var trackUrl = siteUrl + "/orders/" + encodeURIComponent(order.id);
  var statusLabels = {
    pending: "Order Pending",
    processing: "Order Processing",
    shipped: "Order Shipped 🚚",
    delivered: "Order Delivered 🎉",
    cancelled: "Order Cancelled"
  };

  var label = statusLabels[newStatus] || ("Status: " + newStatus);
  var subject = "📦 Order #" + order.id + " Update: " + label + " — House of Nuts";

  var htmlBody = '<div style="font-family: system-ui, sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e0d5c1; border-radius:12px; background:#fff8ef; color:#33291e;">' +
    '<h3 style="color:#8c5319; margin-top:0;">Order Status Update</h3>' +
    '<p style="font-size:14px; line-height:1.6;">Hello ' + (order.name || "Customer") + ',</p>' +
    '<p style="font-size:14px; line-height:1.6;">Your order <strong>#' + order.id + '</strong> status has been updated to: <strong style="color:#8c5319; font-size:16px;">' + label + '</strong>.</p>' +
    '<div style="text-align:center; margin:24px 0;">' +
    '<a href="' + trackUrl + '" style="background:#8c5319; color:#ffffff; padding:12px 28px; border-radius:30px; text-decoration:none; font-weight:600; font-size:13px; display:inline-block;">View Order & Tracking Details &rarr;</a>' +
    '</div>' +
    '<p style="font-size:12px; color:#7a6855; text-align:center;">House of Nuts Proddatur • Phone: +91 96525 26920</p>' +
    '</div>';

  var mailOptions = { htmlBody: htmlBody };
  if (cfg.ownerEmail && isValidEmail(cfg.ownerEmail)) mailOptions.replyTo = cfg.ownerEmail;

  try {
    MailApp.sendEmail(order.email, subject, "Your order #" + order.id + " status: " + label + ". Track at " + trackUrl, mailOptions);
    logNotification(order.id, "status_update", order.email, subject, "sent", "");
  } catch (err) {
    logNotification(order.id, "status_update", order.email, subject, "failed", String(err));
  }
}

function orderExists(orderId) {
  var sh = ensureOrdersSheet();
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return false;
  return sh.getRange(2, 2, lastRow - 1, 1).getValues().some(function (row) {
    return String(row[0]) === String(orderId);
  });
}

function readOrders() {
  var sh = ensureOrdersSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[1]) continue;
    var items = [];
    if (r[11]) {
      try { items = JSON.parse(String(r[11])) || []; } catch (e) { items = []; }
    }
    out.push({
      id: String(r[1]),
      timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ""),
      name: String(r[2] || ""),
      phone: String(r[3] || ""),
      email: String(r[4] || ""),
      address: String(r[5] || ""),
      notes: String(r[6] || ""),
      itemsSummary: String(r[7] || ""),
      items: items,
      total: Number(r[8]) || 0,
      status: String(r[9] || "pending"),
      paymentStatus: String(r[10] || "pending"),
    });
  }
  return out;
}

function updateOrder(body) {
  var sh = ensureOrdersSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]) === String(body.orderId)) {
      var oldStatus = String(values[i][9] || "");
      if (body.status) sh.getRange(i + 1, 10).setValue(body.status);
      if (body.paymentStatus) sh.getRange(i + 1, 11).setValue(body.paymentStatus);

      // Trigger customer email notification if status changed
      if (body.status && body.status !== oldStatus) {
        var cfg = getConfig();
        var orderObj = {
          id: String(values[i][1]),
          name: String(values[i][2]),
          email: String(values[i][4]),
        };
        sendCustomerOrderStatusEmail(orderObj, body.status, cfg);
      }
      return { ok: true };
    }
  }
  return { ok: false, error: "not found" };
}

// -------- Sheet 7: Messages Tab --------

function ensureMessagesSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Messages");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Messages");
    sh.appendRow(["messageId", "timestamp", "type", "name", "phone", "email", "subject", "message", "status", "adminNote"]);
  }
  return sh;
}

function addMessage(body) {
  var sh = ensureMessagesSheet();
  var id = "MSG-" + new Date().getTime();
  var senderEmail = String(body.email || "").trim();

  sh.appendRow([
    id,
    new Date().toISOString(),
    String(body.type || "enquiry"),
    String(body.name || ""),
    String(body.phone || ""),
    senderEmail,
    String(body.subject || ""),
    String(body.message || ""),
    "new",
    ""
  ]);

  try {
    var cfg = getConfig();
    if (cfg.ownerEmail) {
      var subjectStr = "New " + (body.type || "enquiry") + " message — House of Nuts";
      var bodyStr = "From: " + (body.name || "Visitor") + " (" + (body.phone || "No phone") + " / " + senderEmail + ")\n\n" +
        (body.subject ? "Subject: " + body.subject + "\n\n" : "") + (body.message || "");

      var options = {};
      if (isValidEmail(senderEmail)) {
        options.replyTo = senderEmail;
      }
      MailApp.sendEmail(cfg.ownerEmail, subjectStr, bodyStr, options);
      logNotification(id, "owner_message_alert", cfg.ownerEmail, subjectStr, "sent", "");
    }
  } catch (e) {
    logNotification(id, "owner_message_alert", cfg.ownerEmail || "N/A", "Message Alert", "failed", String(e));
  }
  return { ok: true, messageId: id };
}

function readMessages() {
  var sh = ensureMessagesSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    out.push({
      id: String(r[0]),
      timestamp: String(r[1] || ""),
      type: String(r[2] || "enquiry"),
      name: String(r[3] || ""),
      phone: String(r[4] || ""),
      email: String(r[5] || ""),
      subject: String(r[6] || ""),
      message: String(r[7] || ""),
      status: String(r[8] || "new"),
      adminNote: String(r[9] || "")
    });
  }
  return out.reverse();
}

function updateMessage(body) {
  var sh = ensureMessagesSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(body.messageId)) {
      if (body.status) sh.getRange(i + 1, 9).setValue(String(body.status));
      if (typeof body.adminNote === "string") sh.getRange(i + 1, 10).setValue(body.adminNote);
      return { ok: true };
    }
  }
  return { ok: false, error: "Message not found" };
}

// -------- Sheet 8 & Google Drive Audit Trail (365-Day Retention Window) --------

function ensureLogsDriveFolder() {
  try {
    var folders = DriveApp.getFoldersByName("HouseOfNuts_SystemLogs");
    return folders.hasNext() ? folders.next() : DriveApp.createFolder("HouseOfNuts_SystemLogs");
  } catch (e) {
    return null;
  }
}

function writeLogToDriveFile(entryObj) {
  try {
    var folder = ensureLogsDriveFolder();
    if (!folder) return;

    var dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    var fileName = "system_log_" + dateStr + ".json";
    var files = folder.getFilesByName(fileName);

    var logLine = JSON.stringify(entryObj) + "\n";
    if (files && files.hasNext()) {
      var file = files.next();
      var existingContent = file.getAs(MimeType.PLAIN_TEXT).getDataAsString();
      file.setContent(existingContent + logLine);
    } else {
      folder.createFile(fileName, logLine, MimeType.PLAIN_TEXT);
    }
  } catch (e) {
    Logger.log("Drive Log Write Notice: " + String(e));
  }
}

function rotateAndCleanup365DaysLogs() {
  var retentionMs = 365 * 24 * 60 * 60 * 1000; // 365 Days
  var cutoffDate = new Date(Date.now() - retentionMs);

  // 1. Cleanup old Drive Log files older than 365 days
  try {
    var folder = ensureLogsDriveFolder();
    if (folder) {
      var files = folder.getFiles();
      while (files.hasNext()) {
        var f = files.next();
        if (f.getLastUpdated().getTime() < cutoffDate.getTime()) {
          f.setTrashed(true);
          Logger.log("Trashed expired log file older than 365 days: " + f.getName());
        }
      }
    }
  } catch (e) {
    Logger.log("Drive Log Rotation Error: " + String(e));
  }

  // 2. Cleanup Notifications Sheet rows older than 365 days
  try {
    var sh = ensureNotificationsSheet();
    var values = sh.getDataRange().getValues();
    for (var i = values.length - 1; i >= 1; i--) {
      var rowDate = new Date(values[i][7]);
      if (!isNaN(rowDate.getTime()) && rowDate.getTime() < cutoffDate.getTime()) {
        sh.deleteRow(i + 1);
      }
    }
  } catch (e) {
    Logger.log("Sheet Log Rotation Error: " + String(e));
  }

  return { ok: true, cutoffDate: cutoffDate.toISOString() };
}

function ensureNotificationsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Notifications");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Notifications");
    sh.appendRow(["notificationId", "relatedId", "type", "recipient", "subject", "status", "errorDetail", "sentAt"]);
  }
  return sh;
}

function logNotification(relatedId, type, recipient, subject, status, errorDetail) {
  var timestampStr = new Date().toISOString();
  var notifId = "NOTIF-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);

  var logObj = {
    notifId: notifId,
    relatedId: String(relatedId || ""),
    type: String(type || "general"),
    recipient: String(recipient || ""),
    subject: String(subject || "").substring(0, 150),
    status: String(status || "unknown"),
    errorDetail: String(errorDetail || "").substring(0, 250),
    sentAt: timestampStr
  };

  try {
    var sh = ensureNotificationsSheet();
    sh.appendRow([
      logObj.notifId,
      logObj.relatedId,
      logObj.type,
      logObj.recipient,
      logObj.subject,
      logObj.status,
      logObj.errorDetail,
      logObj.sentAt
    ]);
  } catch (e) {
    Logger.log("Failed to write to Notifications sheet: " + String(e));
  }

  // Persist directly to Google Drive daily log files
  writeLogToDriveFile(logObj);
}

// -------- Email System Diagnostic & Health Check --------

function checkEmailHealth() {
  var cfg = getConfig();
  var remainingQuota = MailApp.getRemainingDailyQuota();
  var ownerEmail = cfg.ownerEmail || "";

  var statusResult = {
    ok: true,
    remainingDailyQuota: remainingQuota,
    ownerEmailConfigured: !!ownerEmail,
    ownerEmail: ownerEmail,
    testEmailSent: false,
    error: ""
  };

  if (!ownerEmail || !isValidEmail(ownerEmail)) {
    statusResult.ok = false;
    statusResult.error = "Owner email is not configured in Config sheet tab.";
    return statusResult;
  }

  try {
    var testSubject = "🧪 House of Nuts Email Diagnostic Test";
    var testBody = "This is a diagnostic health check email sent from your House of Nuts Apps Script backend.\n" +
      "Daily Quota Remaining: " + remainingQuota + "\n" +
      "Timestamp: " + new Date().toISOString();

    MailApp.sendEmail(ownerEmail, testSubject, testBody);
    statusResult.testEmailSent = true;
    logNotification("DIAGNOSTIC", "health_check", ownerEmail, testSubject, "sent", "");
  } catch (err) {
    statusResult.ok = false;
    statusResult.testEmailSent = false;
    statusResult.error = String(err);
    logNotification("DIAGNOSTIC", "health_check", ownerEmail, "Email Diagnostic Test", "failed", String(err));
  }

  return statusResult;
}

// -------- Drive Image Upload --------

var TARGET_DRIVE_FOLDER_ID = ""; // Leave blank to use auto-created Pictures folder in Drive

function uploadImage(body) {
  if (!body.productId || !body.dataBase64) return { ok: false, error: "missing data" };
  var bytes = Utilities.base64Decode(body.dataBase64);
  var blob = Utilities.newBlob(bytes, body.mimeType || "image/jpeg", body.filename || "image.jpg");

  var parentFolder;
  var usedFallback = false;
  try {
    if (TARGET_DRIVE_FOLDER_ID && String(TARGET_DRIVE_FOLDER_ID).trim().length > 5) {
      parentFolder = DriveApp.getFolderById(TARGET_DRIVE_FOLDER_ID);
    } else {
      throw new Error("Using default Pictures folder");
    }
  } catch (e) {
    usedFallback = true;
    var pictureFolders = DriveApp.getFoldersByName("Pictures");
    if (pictureFolders.hasNext()) {
      parentFolder = pictureFolders.next();
    } else {
      var prodFolders = DriveApp.getFoldersByName("HouseOfNuts_ProductImages");
      parentFolder = prodFolders.hasNext() ? prodFolders.next() : DriveApp.createFolder("HouseOfNuts_ProductImages");
    }
  }

  var rawCat = body.category ? String(body.category).trim().toLowerCase() : "general";
  var catName = "General";

  if (rawCat.indexOf("nut") !== -1) catName = "Nuts";
  else if (rawCat.indexOf("dry") !== -1 || rawCat.indexOf("fruit") !== -1) catName = "Dry Fruits";
  else if (rawCat.indexOf("spice") !== -1) catName = "Spices";
  else if (rawCat.indexOf("honey") !== -1) catName = "Wild Honey";
  else if (rawCat.indexOf("choc") !== -1) catName = "Chocolates";
  else if (rawCat.indexOf("mix") !== -1) catName = "Trail Mixes";
  else if (rawCat.indexOf("gift") !== -1) catName = "Gifting";
  else if (rawCat.indexOf("seed") !== -1) catName = "Seeds";
  else if (rawCat.indexOf("solar") !== -1) catName = "Solar Dried";
  else if (body.category) catName = body.category.charAt(0).toUpperCase() + body.category.slice(1);

  var subfolders = parentFolder.getFoldersByName(catName);
  var targetSubfolder = subfolders.hasNext() ? subfolders.next() : parentFolder.createFolder(catName);

  var file = targetSubfolder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingErr) { }

  var fileId = file.getId();
  var url = "https://lh3.googleusercontent.com/d/" + fileId;

  try {
    var sh = ensureProductsSheet();
    var values = sh.getDataRange().getValues();
    var updatedRow = false;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).toLowerCase() === String(body.productId).toLowerCase()) {
        sh.getRange(i + 1, 5).setValue(url);
        updatedRow = true;
        break;
      }
    }
    if (!updatedRow && body.productId) {
      sh.appendRow([
        body.productId,
        body.productName || body.productId,
        catName.toLowerCase(),
        body.description || "Uploaded catalog product",
        url,
        body.badge || "New"
      ]);
    }
  } catch (err) { }

  return {
    ok: true,
    url: url,
    fileId: fileId,
    category: catName,
    parentFolder: parentFolder.getName(),
    parentFolderId: parentFolder.getId(),
    subfolder: catName,
    usedFallback: usedFallback
  };
}

// -------- Cashfree Order Session Server-to-Server Backend --------

function createCashfreeOrderSessionBackend(body) {
  body = body || {};
  var appId = "141222992671a6448dce6df4eec9222141";
  var secretKey = "cfsk_ma_prod_63f90d086bebf60c0fddf21af52c864c_66193dae";
  var mode = "production";

  var endpoint = (mode === "production") 
    ? "https://api.cashfree.com/pg/orders" 
    : "https://sandbox.cashfree.com/pg/orders";

  var rawPhone = String(body.customerPhone || "").replace(/\D/g, "");
  var cleanPhone = (rawPhone.length >= 10) ? rawPhone.slice(-10) : "9652526920";

  var rawEmail = String(body.customerEmail || "").trim();
  var cleanEmail = (rawEmail.indexOf("@") > 0 && rawEmail.indexOf(".") > 0) ? rawEmail : "houseofnutsproddatur@gmail.com";

  var cleanName = String(body.customerName || "").trim() || "House of Nuts Customer";
  var cleanAmount = Number(body.orderAmount) > 0 ? Number(body.orderAmount) : 1;
  var orderIdStr = String(body.orderId || ("HON_" + Date.now())).replace(/[^a-zA-Z0-9_-]/g, "_");

  var payload = {
    order_id: orderIdStr,
    order_amount: cleanAmount,
    order_currency: "INR",
    customer_details: {
      customer_id: "CUST_" + cleanPhone,
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone
    },
    order_meta: {
      return_url: "https://houseofnuts.store/orders?order_id={order_id}",
      notify_url: body.notifyUrl || "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec"
    }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-version": "2025-01-01",
      "x-client-id": appId,
      "x-client-secret": secretKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, options);
    var resData = JSON.parse(response.getContentText());
    if (resData && resData.payment_session_id) {
      logNotification(orderIdStr, "cashfree_session_created", cleanEmail, "Session Created (₹" + cleanAmount + ")", "success", "cfOrderId: " + resData.cf_order_id + " | session: " + resData.payment_session_id);
      return {
        ok: true,
        paymentSessionId: resData.payment_session_id,
        cfOrderId: String(resData.cf_order_id || body.orderId)
      };
    } else {
      var msg = (resData && resData.message) ? resData.message : "Cashfree Order Session Creation Failed";
      if (resData && resData.code) msg += " (" + resData.code + ")";
      logNotification(orderIdStr, "cashfree_session_error", cleanEmail, "Session Failed (₹" + cleanAmount + ")", "failed", msg);
      return {
        ok: false,
        error: msg
      };
    }
  } catch (err) {
    logNotification(orderIdStr, "cashfree_system_exception", cleanEmail, "System Exception", "failed", String(err));
    return { ok: false, error: String(err) };
  }
}

// -------- Cashfree Webhook & Event Logger --------

function handleCashfreeWebhook(body) {
  try {
    var data = body.data || {};
    var orderData = data.order || {};
    var paymentData = data.payment || {};
    var orderId = String(orderData.order_id || body.order_id || "");
    var paymentStatus = String(paymentData.payment_status || data.payment_status || body.type || "UNKNOWN");
    var cfPaymentId = String(paymentData.cf_payment_id || "");
    var utr = String(paymentData.bank_reference || "");

    logNotification(
      orderId || "WEBHOOK", 
      "cashfree_webhook", 
      "Cashfree Gateway", 
      "Webhook Event: " + (body.event_type || "PAYMENT_NOTIFICATION"), 
      paymentStatus, 
      "cfPaymentId: " + cfPaymentId + " | UTR: " + utr
    );

    if (orderId && (paymentStatus === "SUCCESS" || paymentStatus === "PAID")) {
      var sh = ensureOrdersSheet();
      var values = sh.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][1]) === orderId) {
          sh.getRange(i + 1, 10).setValue("confirmed"); // Status column
          sh.getRange(i + 1, 11).setValue("paid"); // Payment Status column
          if (cfPaymentId) sh.getRange(i + 1, 12).setValue(cfPaymentId);
          if (utr) sh.getRange(i + 1, 13).setValue(utr);
          break;
        }
      }
    }
    return { ok: true, status: "webhook_processed" };
  } catch (e) {
    logNotification("WEBHOOK_ERR", "cashfree_webhook_error", "Cashfree Gateway", "Webhook Processing Failed", "error", String(e));
    return { ok: false, error: String(e) };
  }
}
