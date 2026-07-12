import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminFetchOrders, adminLogout, isAdminLoggedIn } from "@/lib/admin";
import type { Order } from "@/lib/orders";
import { Loader2, LogOut, Package, RefreshCw, Search } from "lucide-react";

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await adminFetchOrders();
      setOrders(list);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
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
  }, [orders, statusFilter, q]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="min-h-screen bg-clay-light">
      <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="font-display text-xl">Admin</Link>
          <nav className="flex gap-4 text-xs uppercase tracking-[0.15em] font-body">
            <Link to="/admin" className="text-foreground font-medium">Orders</Link>
            <Link to="/admin/inventory" className="text-muted-foreground hover:text-foreground">Inventory</Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">Storefront</Link>
          </nav>
        </div>
        <button
          onClick={() => {
            adminLogout();
            navigate("/admin/login");
          }}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-body hover:text-accent"
        >
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Orders" value={orders.length.toString()} />
          <Stat label="Pending" value={orders.filter((o) => o.status === "pending").length.toString()} />
          <Stat label="Shipped" value={orders.filter((o) => o.status === "shipped").length.toString()} />
          <Stat label="Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order ID, name, phone…"
              className="w-full pl-9 pr-3 py-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={load}
            className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider font-body hover:bg-clay-light"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {error && <p className="text-destructive text-sm font-body mb-4">{error}</p>}

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-background border border-border">
            <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-body">No orders match your filters</p>
          </div>
        ) : (
          <div className="bg-background border border-border overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-clay-light text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => navigate(`/admin/orders/${o.id}`)}
                    className="border-t border-border cursor-pointer hover:bg-clay-light/50"
                  >
                    <td className="px-4 py-3 font-medium">{o.id}</td>
                    <td className="px-4 py-3">
                      <div>{o.name}</div>
                      <div className="text-xs text-muted-foreground">{o.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">{o.itemsSummary}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">₹{o.total}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium ${statusColors[o.status] || "bg-gray-100"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{o.paymentStatus}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-background border border-border p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">{label}</div>
    <div className="font-display text-2xl mt-1">{value}</div>
  </div>
);

export default AdminDashboard;
