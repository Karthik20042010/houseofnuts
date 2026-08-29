import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { getOrders, type Order } from "@/lib/orders";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const navigate = useNavigate();
  const { googleUser } = useAuth();

  useEffect(() => {
    const all = getOrders();
    if (googleUser?.email) {
      const userOrders = all.filter((o) => o.email?.toLowerCase() === googleUser.email.toLowerCase());
      setOrders(userOrders.length > 0 ? userOrders : all);
    } else {
      setOrders(all);
    }
  }, [googleUser]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen font-body">
      <Header />
      <CartDrawer />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-4xl mb-1">My Orders</h1>
            <p className="text-muted-foreground font-body">Track and manage your purchase history</p>
          </div>
          {googleUser && (
            <div className="flex items-center gap-2 bg-clay-light px-3 py-1.5 rounded-full border border-border text-xs">
              <img src={googleUser.picture} alt={googleUser.name} className="size-5 rounded-full" />
              <span className="font-medium text-foreground">{googleUser.email}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] uppercase tracking-[0.15em] px-4 py-2 border transition-colors font-body font-medium capitalize ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-body text-lg mb-4">No orders yet</p>
            <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
              Start Shopping
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground font-body text-center py-12">No {filter} orders</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center gap-4 p-5 border border-border hover:border-foreground/20 transition-colors group"
              >
                <Package size={24} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-body font-medium text-sm">{order.id}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-body font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-body truncate">{order.itemsSummary}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(order.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-xs font-medium font-body tabular-nums">₹{order.total}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
