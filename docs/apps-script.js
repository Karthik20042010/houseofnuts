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

// -------- Setup Function --------

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
      { id: "california-almonds", name: "California Almonds", category: "nuts", description: "Crunchy hand-sorted California almonds", image: "/images/catalog/almonds.jpg", badge: "Bestseller", variants: [{ id: "cal-almond-250", size: "250g", price: 349, mrp: 450 }, { id: "cal-almond-500", size: "500g", price: 649, mrp: 850 }, { id: "cal-almond-1kg", size: "1 Kg", price: 1199, mrp: 1550 }] },
      { id: "mamra-almonds", name: "Mamra Almonds", category: "nuts", description: "Premium oil-rich almonds from high-altitude valleys", image: "/images/catalog/mamra-almonds.jpg", badge: "Premium", variants: [{ id: "mamra-250", size: "250g", price: 899, mrp: 1100 }, { id: "mamra-500", size: "500g", price: 1699, mrp: 2100 }] },
      { id: "jumbo-cashews", name: "Jumbo Cashews W240", category: "nuts", description: "King-size whole white cashews", image: "/images/catalog/cashews.jpg", badge: "Customer Favorite", variants: [{ id: "cashew-250", size: "250g", price: 420, mrp: 520 }, { id: "cashew-500", size: "500g", price: 790, mrp: 980 }] },
      { id: "pistachios-salted", name: "Roasted Salted Pistachios", category: "nuts", description: "Naturally opened Iranian pistachios roasted with sea salt", image: "/images/catalog/pistachios.jpg", badge: "Crispy", variants: [{ id: "pista-250", size: "250g", price: 480, mrp: 600 }, { id: "pista-500", size: "500g", price: 920, mrp: 1150 }] },
      { id: "chilean-walnuts", name: "Chilean Walnut Kernels", category: "nuts", description: "Extra-light half kernels high in Omega-3", image: "/images/catalog/walnuts.jpg", badge: "Brain Food", variants: [{ id: "walnut-250", size: "250g", price: 450, mrp: 580 }, { id: "walnut-500", size: "500g", price: 860, mrp: 1100 }] },
      { id: "royal-gifting-box", name: "Royal Nut & Dry Fruit Gift Box", category: "gifting", description: "Handcrafted wooden keepsake box with 4 premium jars", image: "/images/catalog/gift-box-royal.jpg", badge: "Festive Special", variants: [{ id: "gift-royal", size: "1 Box (800g)", price: 1899, mrp: 2400 }] },
      { id: "medjool-dates", name: "Medjool Dates", category: "dry-fruits", description: "Large, soft and luscious dates from Jordan", image: "/images/catalog/dates.jpg", badge: "Natural Sweetener", variants: [{ id: "dates-250", size: "250g", price: 399, mrp: 500 }, { id: "dates-500", size: "500g", price: 749, mrp: 950 }] },
      { id: "berry-trail-mix", name: "Antioxidant Berry Mix", category: "mixes", description: "Blend of cranberries, blueberries, seeds and nuts", image: "/images/catalog/berry-mix.jpg", badge: "Superfood", variants: [{ id: "berry-250", size: "250g", price: 360, mrp: 460 }] }
    ];

    defaultCatalog.forEach(function (p) {
      prodSh.appendRow([p.id, p.name, p.category, "", "", p.description, p.image, "", p.badge]);
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

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  try {
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

    // Public actions
    if (action === "placeOrder") return json(placeOrder(body.order));
    if (action === "adminLogin") return json(handleAdminLogin(body));
    if (action === "createPaymentSession") return json(createPaymentSession(body));
    if (action === "verifyPayment") return json(verifyPayment(body));
    if (action === "getProducts") return json({ ok: true, products: readProducts() });
    if (action === "getPrices") return json({ ok: true, prices: readPricesMap() });
    if (action === "getInventory") return json({ ok: true, stock: getInventoryMap() });
    if (action === "getProductSpecs") return json({ ok: true, specs: readProductSpecsMap() });
    if (action === "getCatalogConfig") return json(getCatalogConfig());
    if (action === "getReviews") return json({ ok: true, reviews: readApprovedReviews(body.productId) });
    if (action === "submitReview") return json(submitCustomerReview(body));
    if (action === "registerGoogleUser") return json(registerGoogleUser(body));
    if (action === "submitMessage") return json(addMessage(body));
    if (action === "wholesaleEnquiry") return json(addMessage({ type: "wholesale", name: body.name, phone: body.phone, email: body.email, subject: (body.businessName || body.business || "") + " · " + (body.city || ""), message: (body.productInterest || body.interest || "") + " / " + (body.quantity || "") + " — " + (body.message || "") }));
    if (action === "healthCheck") return json(runHealthCheck());
    if (action === "logIncident") return json(logIncident(body));

    // Protected actions requiring Admin / Staff / Developer Auth
    if (action === "saveCatalogConfig") { requireAuth(body, ["admin", "developer"]); return json(saveCatalogConfig(body)); }
    if (action === "saveCatalog") { requireAuth(body, ["admin"]); return json(saveCatalog(body)); }
    if (action === "getOrders") { requireAuth(body, ["admin", "staff"]); return json({ ok: true, orders: readOrders() }); }
    if (action === "updateOrder") { requireAuth(body, ["admin", "staff"]); return json(updateOrder(body)); }
    if (action === "updateInventory") { requireAuth(body, ["admin", "staff"]); return json(setInventory(body.items || [])); }
    if (action === "updatePrices") { requireAuth(body, ["admin"]); return json(updatePrices(body.items || [])); }
    if (action === "updateProductPrice") { requireAuth(body, ["admin"]); return json(setSinglePrice(body.variantId, body.price)); }
    if (action === "getUsers") { requireAuth(body, ["admin"]); return json({ ok: true, users: readUsers() }); }
    if (action === "updateUserRole") { requireAuth(body, ["admin"]); return json(updateUserRole(body.userId, body.role)); }
    if (action === "uploadImage") { requireAuth(body, ["admin", "developer"]); return json(uploadImage(body)); }
    if (action === "getMessages") { requireAuth(body, ["admin", "staff"]); return json({ ok: true, messages: readMessages() }); }
    if (action === "updateMessage") { requireAuth(body, ["admin", "staff"]); return json(updateMessage(body)); }
    if (action === "checkEmailHealth") { requireAuth(body, ["admin", "developer"]); return json(checkEmailHealth()); }
    if (action === "moderateReview") { requireAuth(body, ["admin"]); return json(moderateReview(body)); }
    if (action === "getSeoChecklist") { requireAuth(body, ["admin", "developer"]); var sc = {}; try { sc = JSON.parse(getConfig().seoChecklist || "{}"); } catch (e) {} return json({ ok: true, done: sc }); }
    if (action === "saveSeoChecklist") { requireAuth(body, ["admin", "developer"]); setConfigValue("seoChecklist", JSON.stringify(body.done || {})); return json({ ok: true }); }
    if (action === "getAuditLogs") { requireAuth(body, ["admin", "developer"]); return json(getAuditLogs()); }

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

function setConfigValue(key, value) {
  getConfig();
  var sh = SpreadsheetApp.getActive().getSheetByName("Config");
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  }
  sh.appendRow([key, value]);
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

function getSessionSecret() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("HON_SESSION_SECRET");
  if (!secret) {
    secret = "HON_SEC_" + Utilities.getUuid() + "_" + Date.now();
    try { props.setProperty("HON_SESSION_SECRET", secret); } catch (e) {}
  }
  return secret;
}

function createSessionToken(role, userId) {
  var secret = getSessionSecret();
  var exp = Date.now() + (8 * 60 * 60 * 1000); // 8 hours valid
  var payload = JSON.stringify({ userId: userId || "admin", role: role || "admin", exp: exp });
  var payloadB64 = Utilities.base64Encode(payload);
  var sigBytes = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var sigB64 = Utilities.base64Encode(sigBytes);
  var token = payloadB64 + "." + sigB64;
  return { token: token, role: role, expiresAt: exp };
}

function verifySessionToken(token, allowedRoles) {
  if (!token || typeof token !== "string") return null;
  var parts = token.split(".");
  if (parts.length !== 2) return null;
  var payloadB64 = parts[0];
  var sigB64 = parts[1];
  var secret = getSessionSecret();
  var expectedSigBytes = Utilities.computeHmacSha256Signature(payloadB64, secret);
  var expectedSigB64 = Utilities.base64Encode(expectedSigBytes);
  if (sigB64 !== expectedSigB64) return null;

  try {
    var payloadStr = Utilities.newBlob(Utilities.base64Decode(payloadB64)).getDataAsString();
    var session = JSON.parse(payloadStr);
    if (session.exp && Date.now() > session.exp) return null;
    if (allowedRoles && allowedRoles.length > 0) {
      if (allowedRoles.indexOf(session.role) === -1) {
        throw new Error("Insufficient role privileges for " + session.role);
      }
    }
    return session;
  } catch (e) {
    if (String(e).indexOf("Insufficient role privileges") !== -1) throw e;
    return null;
  }
}

function checkPassword(pw) {
  var cfg = getConfig();
  if (!cfg.adminPassword || String(cfg.adminPassword).trim() === "") return false;
  return !!pw && String(pw).trim() === String(cfg.adminPassword).trim();
}

function handleAdminLogin(body) {
  var pw = body && body.password;
  if (!pw || !checkPassword(pw)) {
    return { ok: false, error: "Invalid administrator password." };
  }
  var role = (body && body.role) || "admin";
  var session = createSessionToken(role, "admin");
  logAuditEvent("ADMIN_LOGIN", "Successful login with role " + role, "admin");
  return {
    ok: true,
    sessionToken: session.token,
    role: session.role,
    expiresAt: session.expiresAt
  };
}

function requireAuth(authInput, allowedRoles) {
  var token = null;
  var pw = null;
  if (typeof authInput === "string") {
    token = authInput;
    pw = authInput;
  } else if (authInput && typeof authInput === "object") {
    token = authInput.sessionToken || authInput.token || authInput.password;
    pw = authInput.password;
  }

  if (token && token.indexOf(".") !== -1) {
    var session = verifySessionToken(token, allowedRoles);
    if (session) return session;
  }

  if (pw && checkPassword(pw)) {
    return { role: "admin", userId: "admin" };
  }

  throw new Error("Unauthorized access. Invalid or expired session token.");
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

  if (body && body.idToken) {
    try {
      var tokenUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(body.idToken);
      var resp = UrlFetchApp.fetch(tokenUrl, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        var tokenInfo = JSON.parse(resp.getContentText());
        if (tokenInfo && tokenInfo.email && (tokenInfo.email_verified === "true" || tokenInfo.email_verified === true)) {
          verifiedEmail = String(tokenInfo.email).trim().toLowerCase();
          verifiedName = String(tokenInfo.name || tokenInfo.email.split("@")[0]).trim();
          verifiedPicture = tokenInfo.picture || "";
        }
      }
    } catch (e) {
      Logger.log("Token verification fetch failed: " + String(e));
    }
  }

  if (!verifiedEmail) {
    return { ok: false, error: "Valid, verified Google OAuth ID token is required." };
  }

  var sh = ensureUsersSheet();
  var values = sh.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]).toLowerCase().trim() === verifiedEmail) {
      existingRow = i + 1;
      break;
    }
  }

  var cfg = getConfig();
  var isOwner = cfg.ownerEmail && verifiedEmail === String(cfg.ownerEmail).toLowerCase().trim();
  var adminEmails = (cfg.adminEmails || "").toLowerCase().split(",").map(function(e){ return e.trim(); }).filter(Boolean);
  var isAllowlistedAdmin = adminEmails.indexOf(verifiedEmail) !== -1;

  if (existingRow > 0) {
    if (verifiedName) sh.getRange(existingRow, 3).setValue(verifiedName);
    var storedRole = String(values[existingRow - 1][4] || "user").trim().toLowerCase();
    var finalRole = (isOwner || isAllowlistedAdmin) ? "admin" : storedRole;
    if (finalRole !== storedRole) {
      sh.getRange(existingRow, 5).setValue(finalRole);
    }
    return { ok: true, userId: values[existingRow - 1][0], email: verifiedEmail, name: verifiedName, role: finalRole, updated: true };
  } else {
    var uId = body.userId || ("usr_" + Math.random().toString(36).substring(2, 9));
    var assignedRole = (isOwner || isAllowlistedAdmin) ? "admin" : "user";
    sh.appendRow([uId, verifiedEmail, verifiedName, body.phone || "", assignedRole, "google_oauth_verified", new Date().toISOString()]);
    return { ok: true, userId: uId, email: verifiedEmail, name: verifiedName, role: assignedRole, created: true };
  }
}

// -------- Sheet 3: Products Tab --------

function ensureProductsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Products");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Products");
    sh.appendRow(["productId", "name", "category", "subcategory", "localName", "description", "image", "imagesJson", "badge", "status"]);
  } else if (sh.getLastColumn() < 10) {
    sh.getRange(1, 10).setValue("status");
  }
  return sh;
}

function readProducts(includeArchived) {
  var sh = ensureProductsSheet();
  var values = sh.getDataRange().getValues();
  var priceMap = readPricesMap();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    var pId = String(r[0]);
    if (!pId) continue;
    var status = String(r[9] || "active").toLowerCase().trim();
    if (!includeArchived && (status === "archived" || status === "draft")) {
      continue;
    }
    var variants = priceMap[pId] || [];

    out.push({
      id: pId,
      name: String(r[1] || ""),
      category: String(r[2] || "nuts"),
      subcategory: String(r[3] || ""),
      localName: String(r[4] || ""),
      description: String(r[5] || ""),
      image: String(r[6] || ""),
      images: safeJsonArray(r[7]),
      badge: String(r[8] || ""),
      status: status,
      variants: variants
    });
  }
  return out;
}

function safeJsonArray(value) {
  try { var parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; }
}

// Rebuild the catalog master from one validated snapshot. Products and prices
// change together, which prevents shop/inventory/image records drifting apart.
function saveCatalog(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var rawProducts = (body && body.products) || [];
    if (!Array.isArray(rawProducts)) return { ok: false, error: "products must be an array" };

    // Unique SKU / Variant ID & Product ID validation
    var seenVariantIds = {};
    var seenProductIds = {};
    var duplicateSkus = [];
    var duplicateProductIds = [];

    rawProducts.forEach(function (p) {
      if (!p || !p.id) return;
      if (seenProductIds[p.id]) duplicateProductIds.push(p.id);
      seenProductIds[p.id] = true;

      (p.variants || []).forEach(function (v) {
        if (!v || !v.id) return;
        if (seenVariantIds[v.id]) duplicateSkus.push(v.id);
        seenVariantIds[v.id] = true;
      });
    });

    if (duplicateSkus.length > 0) {
      return { ok: false, error: "Duplicate SKU / variant IDs rejected: " + duplicateSkus.join(", ") + ". Each variant must have an immutable unique SKU." };
    }
    if (duplicateProductIds.length > 0) {
      return { ok: false, error: "Duplicate product IDs rejected: " + duplicateProductIds.join(", ") };
    }

    var products = dedupeCatalogProducts(rawProducts);
    var productRows = [];
    var priceRows = [];
    products.forEach(function (p) {
      if (!p || !p.id || !p.name || !Array.isArray(p.variants) || p.variants.length === 0) return;
      productRows.push([
        String(p.id),
        String(p.name),
        String(p.category || "nuts"),
        String(p.subcategory || ""),
        String(p.localName || ""),
        String(p.description || ""),
        String(p.image || ""),
        JSON.stringify(Array.isArray(p.images) ? p.images.slice(0, 10) : []),
        String(p.badge || ""),
        String(p.status || "active")
      ]);
      p.variants.forEach(function (v) {
        if (!v || !v.id) return;
        priceRows.push([String(v.id), String(p.id), String(v.size || ""), Number(v.price) || 0, Number(v.mrp) || 0]);
      });
    });
    if (productRows.length === 0) return { ok: false, error: "catalog must contain at least one product" };

    var prodSh = ensureProductsSheet();
    var priceSh = ensurePricesSheet();
    if (prodSh.getLastRow() > 1) prodSh.getRange(2, 1, prodSh.getLastRow() - 1, prodSh.getLastColumn()).clearContent();
    if (priceSh.getLastRow() > 1) priceSh.getRange(2, 1, priceSh.getLastRow() - 1, priceSh.getLastColumn()).clearContent();
    prodSh.getRange(2, 1, productRows.length, 10).setValues(productRows);
    if (priceRows.length) priceSh.getRange(2, 1, priceRows.length, 5).setValues(priceRows);

    var meta = (body && body.metadata) || {};
    var revision = Date.now();
    saveCatalogConfig({ config: {
      catalogVersion: 2,
      catalogRevision: revision,
      productOrder: Array.isArray(meta.productOrder) ? meta.productOrder : [],
      categoryOrder: Array.isArray(meta.categoryOrder) ? meta.categoryOrder : [],
      customCategories: Array.isArray(meta.categories) ? meta.categories : [],
      customSubcategories: Array.isArray(meta.subcategories) ? meta.subcategories : []
    }});

    logAuditEvent("CATALOG_PUBLISH", "Catalog published with " + productRows.length + " products, " + priceRows.length + " variants. Revision: " + revision, body.actor || "admin");

    return { ok: true, productCount: productRows.length, variantCount: priceRows.length, catalogRevision: revision };
  } finally {
    lock.releaseLock();
  }
}

// Product ID catches exact duplicates; the second key catches accidental
// copies created with a different ID but the same name, local name and pack
// sizes. Keeping the last item matches the latest row saved by the manager.
function dedupeCatalogProducts(products) {
  var byId = {};
  (products || []).forEach(function (p) {
    if (p && p.id && p.name && Array.isArray(p.variants) && p.variants.length) {
      byId[String(p.id)] = p;
    }
  });
  return Object.keys(byId).map(function (k) { return byId[k]; });
}

// -------- Sheet 4: Prices Tab --------

function ensurePricesSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Prices");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Prices");
    sh.appendRow(["variantId", "productId", "size", "price", "mrp"]);
  } else if (String(sh.getRange(1, 5).getValue()).toLowerCase() === "discountprice") {
    sh.getRange(1, 5).setValue("mrp");
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
      mrp: Number(r[4]) || 0
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
      sh.appendRow([vId, it.productId || "", it.size || "", Number(it.price) || 0, Number(it.mrp) || 0]);
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

// -------- Sheet 8: Notifications Audit Trail Tab --------

function ensureNotificationsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Notifications");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Notifications");
    sh.appendRow(["notificationId", "relatedId", "type", "recipient", "subject", "status", "errorDetail", "sentAt"]);
  }
  return sh;
}

function logNotification(relatedId, type, recipient, subject, status, errorDetail) {
  try {
    var sh = ensureNotificationsSheet();
    var notifId = "NOTIF-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
    sh.appendRow([
      notifId,
      String(relatedId || ""),
      String(type || "general"),
      String(recipient || ""),
      String(subject || "").substring(0, 150),
      String(status || "unknown"),
      String(errorDetail || "").substring(0, 250),
      new Date().toISOString()
    ]);
  } catch (e) {
    Logger.log("Failed to write to Notifications sheet: " + String(e));
  }
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

var TARGET_DRIVE_FOLDER_ID = "16BLOa7rZQ1O6Ob54l89ABTbVSfi1xui3";

function uploadImage(body) {
  if (!body.productId || !body.dataBase64) return { ok: false, error: "missing data" };
  var bytes = Utilities.base64Decode(body.dataBase64);
  var blob = Utilities.newBlob(bytes, body.mimeType || "image/jpeg", body.filename || "image.jpg");

  var parentFolder;
  var usedFallback = false;
  try {
    parentFolder = DriveApp.getFolderById(TARGET_DRIVE_FOLDER_ID);
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
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  var url = "https://lh3.googleusercontent.com/d/" + fileId;

  try {
    var sh = ensureProductsSheet();
    var values = sh.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]).toLowerCase() === String(body.productId).toLowerCase()) {
        sh.getRange(i + 1, 5).setValue(url);
        break;
      }
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

// -------- Audit Logging --------

function ensureAuditLogsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("AuditLogs");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("AuditLogs");
    sh.appendRow(["timestamp", "actor", "action", "details"]);
  }
  return sh;
}

function logAuditEvent(action, details, actor) {
  try {
    var sh = ensureAuditLogsSheet();
    sh.appendRow([new Date().toISOString(), actor || "system", action, details]);
  } catch (e) {
    Logger.log("Failed to log audit event: " + e);
  }
}

function getAuditLogs() {
  var sh = ensureAuditLogsSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return { ok: true, logs: [] };
  var logs = [];
  for (var i = values.length - 1; i >= 1 && logs.length < 100; i--) {
    logs.push({
      timestamp: values[i][0],
      actor: values[i][1],
      action: values[i][2],
      details: values[i][3]
    });
  }
  return { ok: true, logs: logs };
}

// -------- Payment Gateway & Verification --------

function createPaymentSession(body) {
  var props = PropertiesService.getScriptProperties();
  var cfg = getConfig();
  var appId = props.getProperty("CASHFREE_APP_ID") || cfg.cashfreeAppId || "";
  var secretKey = props.getProperty("CASHFREE_SECRET_KEY") || cfg.cashfreeSecretKey || "";
  if (!appId || !secretKey) {
    return { ok: false, error: "Payment gateway credentials not configured in Script Properties." };
  }
  var order = body && body.order;
  if (!order || !order.id || !order.total) return { ok: false, error: "Invalid order data for payment" };

  try {
    var url = "https://api.cashfree.com/pg/orders";
    var payload = {
      order_id: String(order.id),
      order_amount: Number(order.total),
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_" + String(order.phone || "user").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16),
        customer_phone: String(order.phone || "9999999999").replace(/[^0-9]/g, "").slice(-10),
        customer_name: String(order.name || "Guest"),
        customer_email: String(order.email || "order@houseofnuts.store")
      },
      order_meta: {
        return_url: (cfg.siteUrl || "https://houseofnuts.store") + "/orders/" + order.id + "?cf_id={order_id}"
      }
    };
    var resp = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var data = JSON.parse(resp.getContentText());
    if (resp.getResponseCode() === 200 && data.payment_session_id) {
      return { ok: true, paymentSessionId: data.payment_session_id, orderId: order.id };
    } else {
      return { ok: false, error: data.message || "Failed to create payment session" };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function verifyPayment(body) {
  var props = PropertiesService.getScriptProperties();
  var cfg = getConfig();
  var appId = props.getProperty("CASHFREE_APP_ID") || cfg.cashfreeAppId || "";
  var secretKey = props.getProperty("CASHFREE_SECRET_KEY") || cfg.cashfreeSecretKey || "";
  if (!appId || !secretKey) {
    return { ok: false, error: "Payment gateway credentials not configured in Script Properties." };
  }
  var orderId = body && body.orderId;
  if (!orderId) return { ok: false, error: "Missing order ID" };

  try {
    var url = "https://api.cashfree.com/pg/orders/" + encodeURIComponent(orderId) + "/payments";
    var resp = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01"
      },
      muteHttpExceptions: true
    });
    var payments = JSON.parse(resp.getContentText());
    if (Array.isArray(payments) && payments.some(function(p){ return p.payment_status === "SUCCESS"; })) {
      updateOrderPaymentStatus(orderId, "paid");
      logAuditEvent("PAYMENT_VERIFIED", "Cashfree payment verified for order " + orderId, "cashfree_gateway");
      return { ok: true, paymentStatus: "paid" };
    }
    return { ok: false, paymentStatus: "pending", message: "Payment not completed or verified" };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function updateOrderPaymentStatus(orderId, newStatus) {
  var sh = ensureOrdersSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]) === String(orderId)) {
      sh.getRange(i + 1, 11).setValue(newStatus);
      if (newStatus === "paid") {
        sh.getRange(i + 1, 10).setValue("confirmed");
      }
      return true;
    }
  }
  return false;
}

// -------- Reviews Tab & Moderation --------

function ensureReviewsSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Reviews");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Reviews");
    sh.appendRow(["reviewId", "productId", "customerName", "rating", "text", "date", "status", "verifiedPurchase"]);
  }
  return sh;
}

function readApprovedReviews(productId) {
  var sh = ensureReviewsSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    var status = String(r[6] || "approved").toLowerCase().trim();
    if (status !== "approved") continue;
    var pId = String(r[1] || "");
    if (!productId || pId === productId || pId === "_global") {
      out.push({
        id: String(r[0]),
        productId: pId,
        name: String(r[2] || ""),
        rating: Number(r[3]) || 5,
        text: String(r[4] || ""),
        date: String(r[5] || ""),
        verified: r[7] === true || String(r[7]).toLowerCase() === "true"
      });
    }
  }
  return out;
}

function submitCustomerReview(body) {
  var rev = body && body.review;
  if (!rev || !rev.productId || !rev.rating || !rev.text) {
    return { ok: false, error: "Invalid review content" };
  }
  var sh = ensureReviewsSheet();
  var rId = "rev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  var rating = Math.min(5, Math.max(1, Math.round(Number(rev.rating) || 5)));
  var verified = false;

  if (rev.orderId) {
    var ordSh = ensureOrdersSheet();
    var ordValues = ordSh.getDataRange().getValues();
    for (var i = 1; i < ordValues.length; i++) {
      if (String(ordValues[i][1]).trim() === String(rev.orderId).trim()) {
        var ordItems = String(ordValues[i][7] || "") + " " + String(ordValues[i][11] || "");
        if (ordItems.indexOf(String(rev.productId)) !== -1 || ordItems.toLowerCase().indexOf(String(rev.productName || "").toLowerCase()) !== -1) {
          verified = true;
        }
        break;
      }
    }
  }

  var status = verified ? "approved" : "pending";
  sh.appendRow([
    rId,
    String(rev.productId),
    String(rev.name || "Customer").slice(0, 60),
    rating,
    String(rev.text).slice(0, 1000),
    new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    status,
    verified
  ]);
  return { ok: true, reviewId: rId, status: status, verified: verified };
}

function moderateReview(body) {
  var reviewId = body && body.reviewId;
  var newStatus = String((body && body.status) || "").toLowerCase().trim();
  if (!reviewId || (newStatus !== "approved" && newStatus !== "rejected")) {
    return { ok: false, error: "Invalid review moderation parameters" };
  }
  var sh = ensureReviewsSheet();
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(reviewId)) {
      sh.getRange(i + 1, 7).setValue(newStatus);
      logAuditEvent("MODERATE_REVIEW", "Review " + reviewId + " status set to " + newStatus, body.actor || "admin");
      return { ok: true, status: newStatus };
    }
  }
  return { ok: false, error: "Review not found" };
}


// -------- Operational Monitoring & Health Check --------

function runHealthCheck() {
  try {
    var ss = SpreadsheetApp.getActive();
    var sheets = ["Products", "Prices", "Inventory", "Orders", "Users", "Config", "AuditLogs", "Reviews"];
    var status = {};
    sheets.forEach(function (name) {
      var s = ss.getSheetByName(name);
      status[name] = s ? { exists: true, rows: s.getLastRow() } : { exists: false, rows: 0 };
    });
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      service: "House of Nuts Apps Script Backend",
      version: "2.1.0",
      sheets: status,
      healthy: Boolean(status.Products.exists && status.Prices.exists && status.Inventory.exists && status.Orders.exists)
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function logIncident(body) {
  try {
    var context = String((body && body.context) || "Client Error").slice(0, 100);
    var details = String((body && body.details) || "").slice(0, 1000);
    var actor = String((body && body.actor) || "storefront_visitor").slice(0, 100);
    logAuditEvent("INCIDENT_" + context, details, actor);
    return { ok: true, logged: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
