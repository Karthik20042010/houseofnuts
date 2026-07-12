/**
 * House of Nuts — Google Apps Script backend
 * ------------------------------------------
 * Paste this whole file into your Google Sheet:
 *   Extensions → Apps Script → replace Code.gs with this content → Save
 * Then deploy:
 *   Deploy → Manage deployments → edit (pencil) → New version → Deploy
 *   (Keep the same Web App URL. Access: "Anyone".)
 *
 * Required sheet tabs (create if missing):
 *   1. "Orders"     — header row: timestamp | orderId | name | phone | email
 *                     | address | notes | items | total | status | paymentStatus
 *   2. "Inventory"  — header row: variantId | productId | size | stock
 *   3. "Config"     — header row: key | value
 *                     rows:  adminPassword   | <your-password>
 *                            ownerEmail      | <your-email@gmail.com>
 */

// -------- Endpoint routing --------

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  try {
    if (action === "getInventory") return json({ ok: true, stock: getInventoryMap() });
    return json({ ok: false, error: "unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === "placeOrder")     return json(placeOrder(body.order));
    if (action === "adminLogin")     return json({ ok: checkPassword(body.password) });
    if (action === "getOrders")      { requireAuth(body.password); return json({ ok: true, orders: readOrders() }); }
    if (action === "updateOrder")    { requireAuth(body.password); return json(updateOrder(body)); }
    if (action === "updateInventory"){ requireAuth(body.password); return json(setInventory(body.items || [])); }

    return json({ ok: false, error: "unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------- Config / auth --------

function getConfig() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Config");
  if (!sh) throw new Error("Missing 'Config' sheet");
  var rows = sh.getDataRange().getValues();
  var cfg = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) cfg[String(rows[i][0]).trim()] = String(rows[i][1] || "").trim();
  }
  return cfg;
}

function checkPassword(pw) {
  var cfg = getConfig();
  return !!pw && !!cfg.adminPassword && String(pw) === cfg.adminPassword;
}

function requireAuth(pw) {
  if (!checkPassword(pw)) throw new Error("Unauthorized");
}

// -------- Orders --------

function ensureOrdersSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Orders");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Orders");
    sh.appendRow(["timestamp","orderId","name","phone","email","address","notes","items","total","status","paymentStatus"]);
  }
  return sh;
}

function placeOrder(order) {
  if (!order || !order.id) return { ok: false, error: "invalid order" };
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // 1. Verify + decrement inventory
    var inv = readInventoryRows(); // { variantId: { row, stock } }
    var outOfStock = [];
    var toDecrement = [];
    (order.items || []).forEach(function (it) {
      var entry = inv[it.variantId];
      if (!entry) return; // untracked
      var need = Number(it.quantity) || 0;
      if (entry.stock < need) {
        outOfStock.push({ variantId: it.variantId, name: it.name, size: it.size });
      } else {
        toDecrement.push({ row: entry.row, newStock: entry.stock - need });
      }
    });
    if (outOfStock.length > 0) return { ok: false, error: "out_of_stock", outOfStock: outOfStock };

    var invSheet = SpreadsheetApp.getActive().getSheetByName("Inventory");
    toDecrement.forEach(function (u) {
      invSheet.getRange(u.row, 4).setValue(u.newStock);
    });

    // 2. Append order row
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

    // 3. Email owner
    try {
      var cfg = getConfig();
      if (cfg.ownerEmail) {
        MailApp.sendEmail(
          cfg.ownerEmail,
          "🥜 New Order " + order.id + " — ₹" + order.total,
          [
            "Order ID: " + order.id,
            "Customer: " + order.name + " (" + order.phone + ")",
            "Address: " + order.address,
            "Items: " + (order.itemsSummary || ""),
            "Total: ₹" + order.total,
            "Payment: " + (order.paymentStatus || "pending"),
            "",
            "Manage in admin: (open the site → /admin)",
          ].join("\n")
        );
      }
    } catch (mailErr) {
      // don't fail the order if email fails
    }

    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function readOrders() {
  var sh = ensureOrdersSheet();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var header = values[0].map(function (h) { return String(h); });
  var idx = {};
  header.forEach(function (h, i) { idx[h] = i; });
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[idx.orderId]) continue;
    out.push({
      id: r[idx.orderId],
      timestamp: r[idx.timestamp] instanceof Date ? r[idx.timestamp].toISOString() : String(r[idx.timestamp] || ""),
      name: r[idx.name] || "",
      phone: r[idx.phone] || "",
      email: r[idx.email] || "",
      address: r[idx.address] || "",
      notes: r[idx.notes] || "",
      items: [],
      itemsSummary: r[idx.items] || "",
      total: Number(r[idx.total]) || 0,
      status: String(r[idx.status] || "pending"),
      paymentStatus: String(r[idx.paymentStatus] || "pending"),
    });
  }
  // newest first
  out.sort(function (a, b) { return (a.timestamp < b.timestamp) ? 1 : -1; });
  return out;
}

function updateOrder(body) {
  var sh = ensureOrdersSheet();
  var values = sh.getDataRange().getValues();
  var header = values[0];
  var idx = {};
  header.forEach(function (h, i) { idx[String(h)] = i; });
  for (var i = 1; i < values.length; i++) {
    if (values[i][idx.orderId] === body.orderId) {
      if (body.status) sh.getRange(i + 1, idx.status + 1).setValue(body.status);
      if (body.paymentStatus) sh.getRange(i + 1, idx.paymentStatus + 1).setValue(body.paymentStatus);
      return { ok: true };
    }
  }
  return { ok: false, error: "not found" };
}

// -------- Inventory --------

function ensureInventorySheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Inventory");
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet("Inventory");
    sh.appendRow(["variantId","productId","size","stock"]);
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
      sh.appendRow([vid, it.productId || "", it.size || "", stock]);
    }
  });
  return { ok: true };
}
