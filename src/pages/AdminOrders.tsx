import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchOrders } from "@/lib/admin";
import type { Order, OrderItem } from "@/lib/orders";
import { ChevronDown, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";
import { PaymentPill, StatusPill } from "@/components/admin/StatusPill";

// Older sheet rows predate the itemsJson column — recover the lines from the
// human-readable summary ("Almonds (250g) x2, Cashews (500g) x1") so the
// itemized view is never empty for historical orders.
function parseSummary(summary: string): OrderItem[] {
  if (!summary) return [];
  return summary
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const m = chunk.match(/^(.*?)\s*\(([^)]*)\)\s*[x×]\s*(\d+)$/i);
      return {
        name: m ? m[1].trim() : chunk,
        size: m ? m[2].trim() : "—",
        variantId: "",
        productId: "",
        price: 0,
        quantity: m ? Number(m[3]) : 1,
      } satisfies OrderItem;
    });
}

function linesFor(order: Order): OrderItem[] {
  return order.items && order.items.length > 0 ? order.items : parseSummary(order.itemsSummary);
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await adminFetchOrders());
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
      .filter((o) =>
        !term
          ? true
          : [o.id, o.name, o.phone, o.email, o.itemsSummary]
              .join(" ")
              .toLowerCase()
              .includes(term),
      )
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [orders, q, statusFilter]);

  const totals = useMemo(() => {
    const lineCount = filtered.reduce((n, o) => n + linesFor(o).length, 0);
    const units = filtered.reduce(
      (n, o) => n + linesFor(o).reduce((s, i) => s + (Number(i.quantity) || 0), 0),
      0,
    );
    const revenue = filtered.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return { lineCount, units, revenue };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-muted-foreground font-body">
            Live from the Google Sheet — itemized lines, totals and status.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Orders", value: filtered.length },
          { label: "Order lines", value: totals.lineCount },
          { label: "Units", value: totals.units },
          { label: "Revenue", value: `₹${totals.revenue.toLocaleString("en-IN")}` },
        ].map((s) => (
          <div key={s.label} className="border border-border rounded-sm p-4 bg-background">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">
              {s.label}
            </div>
            <div className="font-display text-2xl mt-1 tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order ID, customer, item…"
            className="w-full border border-border bg-background pl-9 pr-3 py-2 text-sm font-body rounded-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-border bg-background px-3 py-2 text-sm font-body rounded-sm"
        >
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/5 text-destructive text-sm font-body p-4 rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-12 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading orders from the sheet…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-12 text-center">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const lines = linesFor(o);
            const open = !!expanded[o.id];
            return (
              <div key={o.id} className="border border-border rounded-sm bg-background overflow-hidden">
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [o.id]: !p[o.id] }))}
                  className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-clay-light transition-colors"
                >
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-mono text-sm font-medium">{o.id}</span>
                  <span className="text-sm font-body">{o.name}</span>
                  <span className="text-xs text-muted-foreground font-body">
                    {o.timestamp ? new Date(o.timestamp).toLocaleString("en-IN") : ""}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <StatusPill status={o.status} />
                    <PaymentPill status={o.paymentStatus} />
                    <span className="font-display text-lg tabular-nums">₹{o.total}</span>
                  </span>
                </button>

                {open && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground text-left">
                            <th className="py-2 pr-4">Item</th>
                            <th className="py-2 pr-4">Size</th>
                            <th className="py-2 pr-4 text-right">Unit</th>
                            <th className="py-2 pr-4 text-right">Qty</th>
                            <th className="py-2 text-right">Line total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((it, idx) => (
                            <tr key={`${o.id}-${idx}`} className="border-t border-border/60">
                              <td className="py-2 pr-4">{it.name}</td>
                              <td className="py-2 pr-4 text-muted-foreground">{it.size}</td>
                              <td className="py-2 pr-4 text-right tabular-nums">
                                {it.price ? `₹${it.price}` : "—"}
                              </td>
                              <td className="py-2 pr-4 text-right tabular-nums">{it.quantity}</td>
                              <td className="py-2 text-right tabular-nums">
                                {it.price ? `₹${it.price * it.quantity}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border">
                            <td colSpan={4} className="py-2 pr-4 text-right uppercase text-xs tracking-wider">
                              Order total
                            </td>
                            <td className="py-2 text-right font-display text-lg tabular-nums">₹{o.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm font-body">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer</div>
                        <div>{o.name}</div>
                        <div className="text-muted-foreground">{o.phone}</div>
                        <div className="text-muted-foreground break-all">{o.email}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivery</div>
                        <div className="text-muted-foreground whitespace-pre-line">{o.address}</div>
                        {o.notes && <div className="text-xs text-muted-foreground mt-1">Notes: {o.notes}</div>}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="text-xs uppercase tracking-wider font-body border border-border px-3 py-2 rounded-sm hover:bg-clay-light"
                    >
                      Manage order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
