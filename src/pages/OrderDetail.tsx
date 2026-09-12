import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import { getOrder, cancelOrder, type Order } from "@/lib/orders";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Phone, MessageCircle } from "lucide-react";

const steps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusIdx: Record<string, number> = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 };

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (id) setOrder(getOrder(id));
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6">
          <p className="text-muted-foreground font-body text-lg">Order not found</p>
          <button onClick={() => navigate("/orders")} className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : (statusIdx[order.status] ?? 0);

  const handleCancel = () => {
    if (id && cancelOrder(id)) {
      setOrder(getOrder(id));
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-body">
          <ArrowLeft size={16} /> All Orders
        </Link>

        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-1">Order {order.id}</h1>
            <p className="text-sm text-muted-foreground font-body">
              Placed on {new Date(order.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className={`text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full font-body font-medium ${
            order.status === "cancelled" ? "bg-status-cancelled/15 text-status-cancelled-foreground border border-status-cancelled/30" :
            order.status === "delivered" ? "bg-status-delivered/15 text-status-delivered-foreground border border-status-delivered/30" :
            order.status === "shipped" ? "bg-status-shipped/15 text-status-shipped-foreground border border-status-shipped/30" :
            order.status === "confirmed" ? "bg-status-confirmed/15 text-status-confirmed-foreground border border-status-confirmed/30" :
            "bg-status-pending/15 text-status-pending-foreground border border-status-pending/30"
          }`}>
            {order.status}
          </div>
        </div>

        {/* Tracking Progress */}
        {order.status !== "cancelled" && (
          <div className="bg-clay-light p-6 md:p-8 mb-8">
            <h3 className="font-display text-lg mb-6">Order Tracking</h3>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-[2px] bg-border" />
              <div className="absolute top-4 left-4 h-[2px] bg-accent transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, maxWidth: "calc(100% - 32px)" }} />

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

        {order.status === "cancelled" && (
          <div className="bg-red-50 border border-red-200 p-6 mb-8 flex items-center gap-4">
            <XCircle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-body font-medium text-red-800">Order Cancelled</p>
              <p className="text-sm text-red-600 font-body">This order has been cancelled. If you paid, the refund will be processed within 3-5 business days.</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border border-border p-6 mb-6">
          <h3 className="font-display text-lg mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm font-body">
                <span>{item.name} ({item.size}) × {item.quantity}</span>
                <span className="tabular-nums font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 mt-3 flex justify-between font-medium font-body">
            <span>Total</span>
            <span className="tabular-nums text-lg">₹{order.total}</span>
          </div>
        </div>

        {/* Payment & Delivery Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border border-border p-6">
            <h3 className="font-display text-lg mb-3">Payment</h3>
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>UPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${order.paymentStatus === "paid" ? "text-green-700" : order.paymentStatus === "refunded" ? "text-orange-600" : "text-yellow-600"}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="tabular-nums">₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="border border-border p-6">
            <h3 className="font-display text-lg mb-3">Delivery</h3>
            <div className="space-y-2 text-sm font-body">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span>{order.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span>{order.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Address: </span>
                <span>{order.address}</span>
              </div>
              {order.notes && (
                <div>
                  <span className="text-muted-foreground">Notes: </span>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {(order.status === "pending" || order.status === "confirmed") && (
            <>
              {!showCancelConfirm ? (
                <button onClick={() => setShowCancelConfirm(true)} className="border border-destructive/30 text-destructive px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-destructive/5 transition-colors">
                  Cancel Order
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="bg-destructive text-destructive-foreground px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
                    Confirm Cancel
                  </button>
                  <button onClick={() => setShowCancelConfirm(false)} className="border border-border px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
                    Keep Order
                  </button>
                </div>
              )}
            </>
          )}

          <a href="tel:+919652526920" className="flex items-center justify-center gap-2 border border-border px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-clay-light transition-colors">
            <Phone size={14} /> Call Support
          </a>
          <a href={`https://wa.me/919652526920?text=Hi, I have a query about order ${order.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
