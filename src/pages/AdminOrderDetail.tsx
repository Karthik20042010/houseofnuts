import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Copy,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Truck,
  IndianRupee,
} from "lucide-react";
import { adminFetchOrders, adminUpdateOrder } from "@/lib/admin";
import type { Order } from "@/lib/orders";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { PaymentPill, StatusPill } from "@/components/admin/StatusPill";
import { toast } from "sonner";
import { products } from "@/data/products";

const productImage = (productId?: string) =>
  productId ? products.find((p) => p.id === productId)?.image : undefined;

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await adminFetchOrders();
      const o = list.find((x) => x.id === id);
      setOrder(o || null);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = async (patch: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"]; tracking?: string }) => {
    if (!order) return;
    setBusy(true);
    try {
      await adminUpdateOrder(order.id, patch);
      setOrder({ ...order, ...patch });
      toast.success(patch.status === "shipped" || patch.status === "delivered" ? "Updated — customer notified" : "Updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  };

  const markShipped = async () => {
    const tracking = window.prompt("Enter tracking number (optional). Leave blank to skip.") || "";
    await update({ status: "shipped", tracking: tracking.trim() });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-20 flex flex-col items-center gap-3">
        <p className="text-muted-foreground font-body">Order not found</p>
        <Link to="/admin" className="text-accent underline font-body text-sm">Back to admin</Link>
      </div>
    );
  }

  const phoneDigits = (order.phone || "").replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Hi ${order.name}, regarding your order ${order.id}.`);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 print-area">
      <Link
        to="/admin"
        className="no-print flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 font-body"
      >
        <ArrowLeft size={16} /> All Orders
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4 min-w-0">
          {/* Header card */}
          <div className="bg-background border border-border rounded-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl">{order.id}</h1>
                  <button
                    onClick={() => copy(order.id, "Order ID")}
                    className="no-print text-muted-foreground hover:text-foreground"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground font-body mt-1">
                  {new Date(order.timestamp).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <StatusPill status={order.status} />
                <PaymentPill status={order.paymentStatus} />
              </div>
            </div>
            <StatusTimeline status={order.status} />
          </div>

          {/* Customer */}
          <div className="bg-background border border-border rounded-sm p-6">
            <h3 className="font-display text-lg mb-3">Customer</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm font-body">
              <Field label="Name" value={order.name} onCopy={() => copy(order.name, "Name")} />
              <Field label="Phone" value={order.phone} onCopy={() => copy(order.phone, "Phone")} />
              {order.email && <Field label="Email" value={order.email} onCopy={() => copy(order.email!, "Email")} />}
              <Field
                label="Address"
                value={order.address}
                onCopy={() => copy(order.address, "Address")}
                extra={
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print inline-flex items-center gap-1 text-accent hover:underline text-xs"
                  >
                    <MapPin size={12} /> Map
                  </a>
                }
              />
              {order.notes && (
                <div className="sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
                  <div>{order.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-background border border-border rounded-sm p-6">
            <h3 className="font-display text-lg mb-3">Items</h3>
            <div className="divide-y divide-border">
              {(order.items || []).map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {productImage(it.productId) && (
                    <img src={productImage(it.productId)} alt={it.name} className="size-12 object-cover rounded-sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm truncate">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.size} · ₹{it.price} × {it.quantity}
                    </div>
                  </div>
                  <div className="tabular-nums font-medium text-sm">₹{it.price * it.quantity}</div>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p className="text-muted-foreground text-xs font-body py-2">{order.itemsSummary}</p>
              )}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-medium font-body">
              <span>Total</span>
              <span className="tabular-nums text-lg">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Sticky actions */}
        <aside className="no-print lg:sticky lg:top-20 self-start space-y-3">
          <div className="bg-background border border-border rounded-sm p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1">Quick actions</div>
            {order.paymentStatus !== "paid" && (
              <ActionBtn onClick={() => update({ paymentStatus: "paid" })} busy={busy} icon={<IndianRupee size={14} />}>
                Mark Paid
              </ActionBtn>
            )}
            {order.status === "pending" && (
              <ActionBtn onClick={() => update({ status: "confirmed" })} busy={busy} icon={<CheckCircle2 size={14} />}>
                Confirm
              </ActionBtn>
            )}
            {(order.status === "pending" || order.status === "confirmed") && (
              <ActionBtn onClick={markShipped} busy={busy} icon={<Truck size={14} />}>
                Mark Shipped
              </ActionBtn>
            )}
            {order.status === "shipped" && (
              <ActionBtn onClick={() => update({ status: "delivered" })} busy={busy} icon={<CheckCircle2 size={14} />}>
                Mark Delivered
              </ActionBtn>
            )}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <ActionBtn
                onClick={() => update({ status: "cancelled" })}
                busy={busy}
                icon={<Ban size={14} />}
                variant="destructive"
              >
                Cancel Order
              </ActionBtn>
            )}
          </div>

          <div className="bg-background border border-border rounded-sm p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1">Contact</div>
            <a
              href={`https://wa.me/${phoneDigits}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-border px-3 py-2 rounded-sm text-sm font-body hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center gap-2 border border-border px-3 py-2 rounded-sm text-sm font-body hover:bg-clay-light"
            >
              <Phone size={14} /> Call
            </a>
            <button
              onClick={() => window.print()}
              className="w-full flex items-center gap-2 border border-border px-3 py-2 rounded-sm text-sm font-body hover:bg-clay-light"
            >
              <Printer size={14} /> Print invoice
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onCopy,
  extra,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  extra?: React.ReactNode;
}) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
      {label}
      <button onClick={onCopy} className="no-print hover:text-foreground">
        <Copy size={10} />
      </button>
      {extra}
    </div>
    <div className="break-words">{value}</div>
  </div>
);

const ActionBtn = ({
  children,
  onClick,
  busy,
  icon,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  icon?: React.ReactNode;
  variant?: "primary" | "destructive";
}) => (
  <button
    onClick={onClick}
    disabled={busy}
    className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-xs uppercase tracking-[0.15em] font-medium font-body transition-colors disabled:opacity-50 ${
      variant === "destructive"
        ? "border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        : "bg-primary text-primary-foreground hover:bg-accent"
    }`}
  >
    {icon}
    {children}
  </button>
);

export default AdminOrderDetail;
