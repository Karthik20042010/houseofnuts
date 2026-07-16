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
