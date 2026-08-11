/**
 * House of Nuts — Complete Google Apps Script Zero-Cost Database Backend
 * ----------------------------------------------------------------------
 * Organized with Dedicated Separate Sheets for Each Entity:
 *   1. "Users"     — User accounts, contact details, authentication & roles
 *   2. "Products"  — Product catalog (Names, Categories, Descriptions, Badges, Images)
 *   3. "Prices"    — Price Master (Product ID, Variant ID, Size, Price, Discount Price)
 *   4. "Inventory" — Stock Master (Variant ID, Product ID, Size, Available Stock, Reorder Level)
 *   5. "Orders"    — Customer Orders (Timestamp, Order ID, Customer Info, Items, Total, Status)
 *   6. "Config"    — Store settings (Admin Password, Owner Email, Site URL)
 *
 * Setup Instructions:
 * 1. Open your Google Sheet.
 * 2. Click: Extensions → Apps Script
 * 3. Replace all content in Code.gs with this exact file content and click Save (Ctrl+S).
 * 4. Deploy:
 *    Click Deploy → New deployment → Select type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy (Copy the Web App URL into your React app).
 */

// -------- Endpoint Routing --------

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  try {
    if (action === "getInventory") return json({ ok: true, stock: getInventoryMap() });
    if (action === "getProducts")  return json({ ok: true, products: readProducts() });
    if (action === "getPrices")    return json({ ok: true, prices: readPricesMap() });
    if (action === "getUsers")     return json({ ok: true, users: readUsers() });
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

    // Rate Limiting Protection against automated attacker brute-force & spamming
    if (action === "adminLogin" || action === "placeOrder") {
      // Scope the limit to the caller rather than blocking all customers after
      // a handful of orders. This is still only one layer of abuse protection.
      var rateKey = action === "placeOrder"
        ? String(body.order && body.order.phone || "anonymous")
        : String(body.email || "admin");
      var rateLimitErr = checkServerRateLimit(action + "_" + rateKey, 6);
      if (rateLimitErr) return json({ ok: false, error: rateLimitErr });
    }

    // Public actions
    if (action === "placeOrder")         return json(placeOrder(body.order));
    if (action === "adminLogin")         return json({ ok: checkPassword(body.password) });
    if (action === "getProducts")        return json({ ok: true, products: readProducts() });
    if (action === "getPrices")          return json({ ok: true, prices: readPricesMap() });
    if (action === "registerGoogleUser") return json(registerGoogleUser(body));

    // Protected actions requiring Admin / Staff / Developer Auth
    if (action === "getOrders")          { requireAuth(body.password); return json({ ok: true, orders: readOrders() }); }
    if (action === "updateOrder")        { requireAuth(body.password); return json(updateOrder(body)); }
    if (action === "updateInventory")    { requireAuth(body.password); return json(setInventory(body.items || [])); }
    if (action === "updatePrices")       { requireAuth(body.password); return json(updatePrices(body.items || [])); }
    if (action === "updateProductPrice") { requireAuth(body.password); return json(setSinglePrice(body.variantId, body.price)); }
    if (action === "getUsers")           { requireAuth(body.password); return json({ ok: true, users: readUsers() }); }
    if (action === "updateUserRole")     { requireAuth(body.password); return json(updateUserRole(body.userId, body.role)); }
    if (action === "uploadImage")        { requireAuth(body.password); return json(uploadImage(body)); }

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
      return "Rate limit exceeded (Too many attempts). Locked for 10 minutes.";
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

// -------- Sheet 1: Config Tab --------

function getConfig() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Config");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Config");
    sh.appendRow(["key", "value"]);
    sh.appendRow(["adminPassword", ""]);
    sh.appendRow(["ownerEmail", ""]);
    sh.appendRow(["siteUrl", "https://houseofnuts.in"]);
  }
  var rows = sh.getDataRange().getValues();
  var cfg = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) cfg[String(rows[i][0]).trim()] = String(rows[i][1] || "").trim();
  }
  return cfg;
}

function checkPassword(pw) {
  var cfg = getConfig();
  if (!cfg.adminPassword) throw new Error("Admin password is not configured. Set it in the Config sheet before using admin tools.");
  return !!pw && !!cfg.adminPassword && String(pw) === cfg.adminPassword;
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

function registerGoogleUser(body) {
  if (!body.email) return { ok: false, error: "Missing email" };
  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]).toLowerCase() === String(body.email).toLowerCase()) {
      existingRow = i + 1;
      break;
    }
  }
  if (existingRow > 0) {
    if (body.name) sh.getRange(existingRow, 3).setValue(body.name);
    return { ok: true, userId: values[existingRow - 1][0], updated: true };
  } else {
    var uId = body.userId || ("usr_" + Math.random().toString(36).substring(2, 9));
    sh.appendRow([uId, body.email, body.name || "", body.phone || "", body.role || "user", "google_oauth", new Date().toISOString()]);
    return { ok: true, userId: uId, created: true };
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

    // Attach prices for this product from the separate "Prices" tab
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
  var map = {}; // productId -> Variant[]
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

function updatePrices(items) {
  var sh = ensurePricesSheet();
  var values = sh.getDataRange().getValues();
  var rowMap = {};
  for (var i = 1; i < values.length; i++) {
    if (values[i][0]) rowMap[String(values[i][0])] = i + 1;
  }
  items.forEach(function(it) {
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
    sh.appendRow(["timestamp", "orderId", "name", "phone", "email", "address", "notes", "items", "total", "status", "paymentStatus"]);
  }
  return sh;
}

function placeOrder(order) {
  if (!order || !order.id) return { ok: false, error: "invalid order" };
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // Retrying after a lost response must not create a second order or
    // decrement inventory twice.
    if (orderExists(order.id)) return { ok: true, duplicate: true };
    // Check and update inventory
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

    // Save order record
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
    ]);

    // Send confirmation email
    try {
      var cfg = getConfig();
      if (cfg.ownerEmail) {
        MailApp.sendEmail(
          cfg.ownerEmail,
          "🥜 New Order " + order.id + " — ₹" + order.total,
          "Order ID: " + order.id + "\nCustomer: " + order.name + " (" + order.phone + ")\nTotal: ₹" + order.total
        );
      }
    } catch (e) {}

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function orderExists(orderId) {
  var sh = ensureOrdersSheet();
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return false;
  return sh.getRange(2, 2, lastRow - 1, 1).getValues().some(function(row) {
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
    out.push({
      id: String(r[1]),
      timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ""),
      name: String(r[2] || ""),
      phone: String(r[3] || ""),
      email: String(r[4] || ""),
      address: String(r[5] || ""),
      notes: String(r[6] || ""),
      itemsSummary: String(r[7] || ""),
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
      if (body.status)        sh.getRange(i + 1, 10).setValue(body.status);
      if (body.paymentStatus) sh.getRange(i + 1, 11).setValue(body.paymentStatus);
      return { ok: true };
    }
  }
  return { ok: false, error: "not found" };
}

// -------- Drive Image Upload --------

function uploadImage(body) {
  if (!body.productId || !body.dataBase64) return { ok: false, error: "missing data" };
  var bytes = Utilities.base64Decode(body.dataBase64);
  var blob = Utilities.newBlob(bytes, body.mimeType || "image/jpeg", body.filename || "image.jpg");
  
  var folderName = "HouseOfNuts_ProductImages";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileId = file.getId();
  var url = "https://lh3.googleusercontent.com/d/" + fileId;
  return { ok: true, url: url, fileId: fileId };
}
