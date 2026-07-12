import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { adminFetchOrders, adminUpdateOrder, isAdminLoggedIn } from "@/lib/admin";
import type { Order } from "@/lib/orders";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [paymentStatus, setPaymentStatus] = useState<Order["paymentStatus"]>("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    (async () => {
      try {
        const list = await adminFetchOrders();
        const o = list.find((x) => x.id === id);
        if (o) {
          setOrder(o);
          setStatus(o.status);
          setPaymentStatus(o.paymentStatus);
        }
      } catch (e) {
        setMsg((e as Error).message);
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  const save = async () => {
    if (!order) return;
    setSaving(true);
    setMsg("");
    try {
      await adminUpdateOrder(order.id, { status, paymentStatus });
      setMsg("Saved ✓");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground font-body">Order not found</p>
        <Link to="/admin" className="text-accent underline font-body text-sm">Back to admin</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-light">
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
          <ArrowLeft size={16} /> All Orders
        </Link>

        <div className="bg-background border border-border p-6 mb-4">
          <h1 className="font-display text-2xl mb-1">{order.id}</h1>
          <p className="text-sm text-muted-foreground font-body">
            {new Date(order.timestamp).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-background border border-border p-6">
            <h3 className="font-display text-lg mb-3">Customer</h3>
            <div className="space-y-1 text-sm font-body">
              <div><span className="text-muted-foreground">Name:</span> {order.name}</div>
              <div><span className="text-muted-foreground">Phone:</span> {order.phone}</div>
              {order.email && <div><span className="text-muted-foreground">Email:</span> {order.email}</div>}
              <div><span className="text-muted-foreground">Address:</span> {order.address}</div>
              {order.notes && <div><span className="text-muted-foreground">Notes:</span> {order.notes}</div>}
            </div>
          </div>

          <div className="bg-background border border-border p-6">
            <h3 className="font-display text-lg mb-3">Items</h3>
            <div className="space-y-2 text-sm font-body">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.name} ({it.size}) × {it.quantity}</span>
                  <span className="tabular-nums">₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="tabular-nums">₹{order.total}</span>
              </div>
              {(!order.items || order.items.length === 0) && (
                <p className="text-muted-foreground text-xs">{order.itemsSummary}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-background border border-border p-6">
          <h3 className="font-display text-lg mb-4">Update Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order["status"])}
                className="w-full border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none focus:border-accent"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as Order["paymentStatus"])}
                className="w-full border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none focus:border-accent"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
            {msg && <span className="text-sm font-body text-muted-foreground">{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
