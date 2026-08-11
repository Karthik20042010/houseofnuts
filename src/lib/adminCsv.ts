import type { Order } from "./orders";

const esc = (v: unknown) => {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function ordersToCsv(orders: Order[]): string {
  const headers = ["Order ID", "Date", "Name", "Phone", "Email", "Address", "Items", "Total", "Status", "Payment", "Notes"];
  const rows = orders.map((o) =>
    [
      o.id,
      new Date(o.timestamp).toISOString(),
      o.name,
      o.phone,
      o.email || "",
      o.address,
      o.itemsSummary || (o.items || []).map((it) => `${it.name} (${it.size}) x${it.quantity}`).join("; "),
      o.total,
      o.status,
      o.paymentStatus,
      o.notes || "",
    ]
      .map(esc)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Minimal CSV parser (handles quoted fields, CRLF) ----
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

// Parses a filename -> SKU mapping CSV. Accepts headers in any order:
// filename/file/image and sku/productid/product_id/id. Header row optional:
// if the first row doesn't look like headers, it's treated as data (2 columns).
export function parseSkuMappingCsv(text: string): { map: Record<string, string>; count: number } {
  const rows = parseCsv(text);
  if (!rows.length) return { map: {}, count: 0 };
  const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const head = rows[0].map(norm);
  const fileKeys = ["filename", "file", "image", "imagename", "photo"];
  const skuKeys = ["sku", "productid", "product", "id"];
  let fi = head.findIndex((h) => fileKeys.includes(h));
  let si = head.findIndex((h) => skuKeys.includes(h));
  let body = rows;
  if (fi >= 0 && si >= 0) body = rows.slice(1);
  else { fi = 0; si = 1; }
  const map: Record<string, string> = {};
  let count = 0;
  for (const r of body) {
    const file = (r[fi] || "").trim();
    const sku = (r[si] || "").trim();
    if (!file || !sku) continue;
    map[file.toLowerCase()] = sku;
    count++;
  }
  return { map, count };
}
