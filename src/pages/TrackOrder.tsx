import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { getOrders, type Order } from "@/lib/orders";
import { Package, Truck, CheckCircle, XCircle, Search, ArrowRight, MessageCircle } from "lucide-react";

const steps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];
const statusIdx: Record<string, number> = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 };

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSearched(true);
    const id = orderId.trim().toUpperCase();
    const c = contact.trim().toLowerCase();
    if (!id || !c) {
      setError("Please enter both your order ID and email or phone number.");
      setOrder(null);
      return;
    }
    const found = getOrders().find((o) => o.id.toUpperCase() === id);
    if (!found) {
      setError("No order found with that ID on this device. If you ordered on another device, please contact support.");
      setOrder(null);
      return;
    }
    const matches =
      (found.email && found.email.toLowerCase() === c) ||
      found.phone.replace(/\D/g, "").endsWith(c.replace(/\D/g, "").slice(-10));
    if (!matches) {
      setError("The email or phone number does not match this order.");
      setOrder(null);
      return;
    }
    setOrder(found);
  };

  const currentStep = order ? (order.status === "cancelled" ? -1 : statusIdx[order.status] ?? 0) : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl mb-3">Track Your Order</h1>
          <p className="text-muted-foreground font-body">
            Enter your order ID and the email or phone used at checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-border p-6 md:p-8 bg-clay-light space-y-4 mb-8">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-body font-medium mb-2">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="HON-XXXXXX-XXXX"
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-body font-medium mb-2">Email or Phone</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@email.com or 98765XXXXX"
              className="w-full bg-background border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:opacity-90 transition-opacity"
          >
            <Search size={14} /> Track Order
          </button>
          {error && <p className="text-sm text-destructive font-body">{error}</p>}
        </form>

        {order && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl">Order {order.id}</h2>
                <p className="text-sm text-muted-foreground font-body">
                  Placed on {new Date(order.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className={`text-[11px] uppercase tracking-wider px-3 py-1.5 font-body font-medium ${
                order.status === "cancelled" ? "bg-red-100 text-red-800" :
                order.status === "delivered" ? "bg-green-100 text-green-800" :
                "bg-accent/10 text-accent"
              }`}>
                {order.status}
              </div>
            </div>

            {order.status === "cancelled" ? (
              <div className="bg-red-50 border border-red-200 p-6 flex items-center gap-4">
                <XCircle size={24} className="text-red-500 shrink-0" />
                <div>
                  <p className="font-body font-medium text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600 font-body">This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="bg-clay-light p-6 md:p-8">
                <h3 className="font-display text-lg mb-6">Progress</h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-4 right-4 h-[2px] bg-border" />
                  <div
                    className="absolute top-4 left-4 h-[2px] bg-accent transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, maxWidth: "calc(100% - 32px)" }}
                  />
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    const active = i <= currentStep;
                    return (
                      <div key={s.key} className="flex flex-col items-center gap-2 z-10 relative">
                        <div className={`size-8 rounded-full flex items-center justify-center transition-colors ${active ? "bg-accent text-accent-foreground" : "bg-background border-2 border-border text-muted-foreground"}`}>
                          <Icon size={14} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-body text-center ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg">Summary</h3>
                <span className="tabular-nums font-medium font-body">₹{order.total}</span>
              </div>
              <div className="space-y-2 text-sm font-body text-muted-foreground">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.name} ({it.size}) × {it.quantity}</span>
                    <span className="tabular-nums">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium font-body text-accent hover:underline"
                >
                  View full details <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://wa.me/919652526920?text=${encodeURIComponent(`Hi House of Nuts, I'd like an update on my order ${order.id} (status: ${order.status}). Thank you!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 uppercase tracking-[0.15em] text-[11px] font-medium font-body hover:opacity-90 transition-opacity"
                >
                  <MessageCircle size={14} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {searched && !order && !error && (
          <p className="text-center text-muted-foreground font-body">No order to show.</p>
        )}

        <div className="mt-12 text-center text-sm font-body text-muted-foreground">
          Need help? <a href="https://wa.me/919652526920" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">WhatsApp us</a> or call <a href="tel:+919652526920" className="text-accent hover:underline">+91 96525 26920</a>.
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
