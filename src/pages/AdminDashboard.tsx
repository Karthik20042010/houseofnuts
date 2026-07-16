import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchOrders } from "@/lib/admin";
import type { Order } from "@/lib/orders";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import { PaymentPill, StatusPill } from "@/components/admin/StatusPill";
import { downloadCsv, ordersToCsv } from "@/lib/adminCsv";
import { toast } from "sonner";

type DateRange = "today" | "7d" | "30d" | "all";
type SortKey = "date" | "total" | "status";

const PAGE_SIZE = 25;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | Order["paymentStatus"]>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const list = await adminFetchOrders();
      setOrders(list);
      setLastSync(new Date());
    } catch (e) {
      setError((e as Error).message);
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      dateRange === "today" ? 24 * 3600e3 : dateRange === "7d" ? 7 * 86400e3 : dateRange === "30d" ? 30 * 86400e3 : Infinity;
    const list = orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
      if (rangeMs !== Infinity && now - new Date(o.timestamp).getTime() > rangeMs) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !o.id.toLowerCase().includes(s) &&
          !(o.name || "").toLowerCase().includes(s) &&
          !(o.phone || "").toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "total") cmp = Number(a.total) - Number(b.total);
      else cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [orders, statusFilter, paymentFilter, dateRange, q, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled");
    const revenue = active.reduce((s, o) => s + Number(o.total || 0), 0);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const revenueToday = active
      .filter((o) => new Date(o.timestamp) >= startOfDay)
      .reduce((s, o) => s + Number(o.total || 0), 0);
    const unpaid = orders.filter((o) => o.paymentStatus === "pending" && o.status !== "cancelled").length;
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      unpaid,
      revenue,
      revenueToday,
    };
  }, [orders]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const quickAction = async (o: Order, e: React.MouseEvent, action: "confirm" | "paid" | "whatsapp") => {
    e.stopPropagation();
    if (action === "whatsapp") {
      const phone = (o.phone || "").replace(/\D/g, "");
      const msg = encodeURIComponent(`Hi ${o.name}, this is House of Nuts regarding your order ${o.id} (₹${o.total}).`);
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      return;
    }
    const { adminUpdateOrder } = await import("@/lib/admin");
    try {
      if (action === "confirm") await adminUpdateOrder(o.id, { status: "confirmed" });
      if (action === "paid") await adminUpdateOrder(o.id, { paymentStatus: "paid" });
      toast.success(action === "confirm" ? "Marked confirmed" : "Marked paid");
      load(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const exportCsv = () => {
    downloadCsv(`houseofnuts-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(filtered));
  };

  const SortHeader = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) => (
    <th className={`px-4 py-3 text-${align}`}>
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 uppercase tracking-wider text-xs hover:text-foreground"
      >
        {label}
        {sortKey === k ? (
          sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total Orders" value={stats.total.toString()} />
        <Stat label="Pending" value={stats.pending.toString()} tone="pending" />
        <Stat label="Unpaid" value={stats.unpaid.toString()} tone="pending" />
        <Stat label="Revenue Today" value={`₹${stats.revenueToday.toLocaleString("en-IN")}`} tone="delivered" icon={<TrendingUp size={12} />} />
        <Stat label="Total Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} tone="delivered" />
      </div>

      {/* Filters bar */}
      <div className="bg-background border border-border rounded-sm p-3 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[220px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search order ID, name, phone…"
              className="w-full pl-9 pr-3 py-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-accent rounded-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            className="border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none rounded-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as typeof paymentFilter);
              setPage(1);
            }}
            className="border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none rounded-sm"
          >
            <option value="all">All payments</option>
            <option value="pending">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <div className="flex border border-border rounded-sm overflow-hidden">
            {(["today", "7d", "30d", "all"] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDateRange(r);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs uppercase tracking-wider font-body transition-colors ${
                  dateRange === r ? "bg-primary text-primary-foreground" : "hover:bg-clay-light"
                }`}
              >
                {r === "today" ? "Today" : r === "all" ? "All" : r}
              </button>
            ))}
          </div>
          <button
            onClick={() => load()}
            className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
        {lastSync && (
          <div className="text-[11px] text-muted-foreground font-body">
            Last synced {lastSync.toLocaleTimeString("en-IN")} · Showing {filtered.length} of {orders.length}
          </div>
        )}
      </div>

      {error && (
        <div className="text-destructive text-sm font-body p-3 border border-destructive/30 bg-destructive/5 rounded-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-background border border-border rounded-sm">
          <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-body">No orders match your filters</p>
          <button onClick={() => load()} className="mt-4 text-accent text-sm underline font-body">Retry</button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-background border border-border rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead className="bg-clay-light text-xs text-muted-foreground sticky top-14 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 uppercase tracking-wider">Items</th>
                    <SortHeader k="total" label="Total" align="right" />
                    <SortHeader k="status" label="Status" />
                    <th className="text-left px-4 py-3 uppercase tracking-wider">Payment</th>
                    <SortHeader k="date" label="Date" />
                    <th className="text-right px-4 py-3 uppercase tracking-wider">Quick</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o, i) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className={`border-t border-border cursor-pointer group hover:bg-clay-light/70 ${i % 2 ? "bg-clay-light/20" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">{o.id}</td>
                      <td className="px-4 py-3">
                        <div>{o.name}</div>
                        <div className="text-xs text-muted-foreground">{o.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">{o.itemsSummary}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">₹{o.total}</td>
                      <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                      <td className="px-4 py-3"><PaymentPill status={o.paymentStatus} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(o.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {o.status === "pending" && (
                            <button
                              title="Mark confirmed"
                              onClick={(e) => quickAction(o, e, "confirm")}
                              className="text-[10px] uppercase tracking-wider px-2 py-1 border border-border rounded-sm hover:bg-status-confirmed hover:text-status-confirmed-foreground hover:border-status-confirmed"
                            >
                              Confirm
                            </button>
                          )}
                          {o.paymentStatus === "pending" && o.status !== "cancelled" && (
                            <button
                              title="Mark paid"
                              onClick={(e) => quickAction(o, e, "paid")}
                              className="text-[10px] uppercase tracking-wider px-2 py-1 border border-border rounded-sm hover:bg-status-paid hover:text-status-delivered-foreground hover:border-status-paid"
                            >
                              Paid
                            </button>
                          )}
                          <button
                            title="WhatsApp"
                            onClick={(e) => quickAction(o, e, "whatsapp")}
                            className="p-1.5 border border-border rounded-sm hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
                          >
                            <MessageCircle size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {paged.map((o) => (
              <div
                key={o.id}
                onClick={() => navigate(`/admin/orders/${o.id}`)}
                className="bg-background border border-border rounded-sm p-3 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{o.name} · {o.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums font-medium">₹{o.total}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(o.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate mb-2">{o.itemsSummary}</div>
                <div className="flex gap-2">
                  <StatusPill status={o.status} />
                  <PaymentPill status={o.paymentStatus} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-muted-foreground text-xs">
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-border rounded-sm text-xs uppercase tracking-wider disabled:opacity-40 hover:bg-clay-light"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="px-3 py-1.5 border border-border rounded-sm text-xs uppercase tracking-wider disabled:opacity-40 hover:bg-clay-light"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Stat = ({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: "pending" | "delivered";
  icon?: React.ReactNode;
}) => (
  <div className="bg-background border border-border rounded-sm p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body flex items-center gap-1">
      {icon} {label}
    </div>
    <div
      className={`font-display text-2xl mt-1 tabular-nums ${
        tone === "pending" ? "text-status-pending" : tone === "delivered" ? "text-status-delivered" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

export default AdminDashboard;
