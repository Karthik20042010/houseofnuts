import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Smartphone, Mail, ShieldCheck, LogOut, FileText, AlertCircle } from "lucide-react";
import { isOutOfStock, isInventoryUnavailable } from "@/lib/inventory";
import { generateOrderId, saveOrder, placeOrderApi, type Order } from "@/lib/orders";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
import { toast } from "sonner";

const UPI_ID = "863932789@okbizaxis";
const UPI_NAME = "HouseOfNuts";

const CheckoutPage = () => {
  const { items, totalPrice, subtotal, appliedDiscount, discountAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { refresh: refreshInventory, stock, isOffline } = useInventory();
  const { googleUser, isGoogleAuthenticated, logoutGoogle } = useAuth();

  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(300); // 5 min countdown
  const [orderId, setOrderId] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  // Optional: Autofill details if customer is logged in with Google
  useEffect(() => {
    if (googleUser) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || googleUser.email,
        name: prev.name || googleUser.name,
      }));
    }
  }, [googleUser]);

  // Countdown timer for payment step
  useEffect(() => {
    if (step !== "payment" || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPrice}&cu=INR&tn=Order-${orderId}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInventoryUnavailable(stock)) {
      toast.error("Live stock availability is temporarily unavailable. Please retry in a few moments.");
      return;
    }
    const outOfStockItem = items.find((it) => isOutOfStock(stock, it.variant.id));
    if (outOfStockItem) {
      toast.error(`"${outOfStockItem.product.name} (${outOfStockItem.variant.size})" is currently out of stock. Please remove it from your basket.`);
      return;
    }
    setOrderId(generateOrderId());
    setTimer(300);
    setStep("payment");
  };

  const openUpiApp = () => {
    window.location.href = upiDeepLink;
  };

  const handlePaymentDone = useCallback(async () => {
    const trimmedUtr = utrNumber.trim();
    if (!trimmedUtr || trimmedUtr.length < 6) {
      toast.error("Please enter the UPI Transaction / UTR reference number from your payment app before completing the order.");
      return;
    }

    setSubmitting(true);

    const noteParts = [];
    noteParts.push(`[UTR/Ref: ${trimmedUtr}]`);
    if (appliedDiscount) noteParts.push(`[Promo: ${appliedDiscount.code} (-₹${discountAmount})]`);
    if (form.notes.trim()) noteParts.push(form.notes.trim());

    const order: Order = {
      id: orderId,
      timestamp: new Date().toISOString(),
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      notes: noteParts.join(" "),
      items: items.map((i) => ({
        name: i.product.name,
        size: i.variant.size,
        variantId: i.variant.id,
        productId: i.product.id,
        price: i.variant.price,
        quantity: i.quantity,
        image: i.product.image || (i.product.images && i.product.images[0]) || "",
      })),
      itemsSummary: items.map((i) => `${i.product.name} (${i.variant.size}) x${i.quantity}`).join(", "),
      total: totalPrice,
      status: "pending",
      paymentStatus: "pending",
    };

    const result = await placeOrderApi(order);

    if (!result.ok && result.error === "out_of_stock") {
      const names = (result.outOfStock || []).map((v) => `${v.name} (${v.size})`).join(", ");
      toast.error(`Sorry, out of stock: ${names || "some items"}. Please adjust your cart.`);
      await refreshInventory();
      setSubmitting(false);
      setStep("details");
      return;
    }

    if (!result.ok) {
      toast.error("We couldn't place your order. Your cart is still saved—please try again.");
      setSubmitting(false);
      return;
    }

    saveOrder(order);
    clearCart();
    await refreshInventory();
    setStep("done");
    setSubmitting(false);
  }, [orderId, form, items, totalPrice, clearCart, refreshInventory, appliedDiscount, discountAmount, utrNumber]);

  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6">
        <p className="text-muted-foreground font-body text-lg">Your basket is empty</p>
        <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
          Go Shopping
        </button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6 text-center">
        <CheckCircle size={64} className="text-accent" />
        <h2 className="font-display text-4xl">Order Received!</h2>
        <p className="text-muted-foreground font-body max-w-md">
          Thank you, {form.name}! Order <span className="font-medium text-foreground">{orderId}</span> has been placed.
          We have recorded your UPI Transaction Reference <span className="font-mono font-medium text-foreground">{utrNumber}</span>.
          Our team will verify the payment against bank records and send tracking confirmation to <span className="font-semibold text-foreground">{form.email}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button onClick={() => navigate(`/orders/${orderId}`)} className="bg-accent text-accent-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body">
            Track Order
          </button>
          <button onClick={() => navigate("/")} className="border border-border px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-clay-light transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Optional Google Login Modal Popup */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={() => {
          if (googleUser) {
            setForm((prev) => ({
              ...prev,
              email: googleUser.email,
              name: prev.name || googleUser.name,
            }));
          }
        }}
      />

      <button
        onClick={() => (step === "payment" ? setStep("details") : navigate("/"))}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-body"
      >
        <ArrowLeft size={16} />
        {step === "payment" ? "Back to details" : "Back to shop"}
      </button>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {["Details", "Payment", "Done"].map((label, i) => {
          const stepIdx = step === "details" ? 0 : step === "payment" ? 1 : 2;
          return (
            <div key={label} className="flex items-center gap-3">
              <div className={`size-8 rounded-full flex items-center justify-center text-xs font-body font-medium ${i <= stepIdx ? "bg-accent text-accent-foreground" : "bg-clay-light text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`text-xs uppercase tracking-wider font-body ${i <= stepIdx ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < 2 && <div className={`w-8 h-[1px] ${i < stepIdx ? "bg-accent" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      {step === "details" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-4xl">Checkout</h1>

            {/* Optional Google Mail Autofill */}
            {isGoogleAuthenticated && googleUser ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-sm text-xs font-body">
                <ShieldCheck size={14} />
                <span>{googleUser.email}</span>
                <button
                  type="button"
                  onClick={logoutGoogle}
                  title="Switch Google Account"
                  className="hover:text-destructive p-0.5 ml-1"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <Mail size={14} /> Autofill with Google
              </button>
            )}
          </div>

          <div className="bg-clay-light p-6 mb-8 space-y-3">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            {items.map((item) => (
              <div key={item.variant.id} className="flex justify-between text-sm font-body">
                <span>{item.product.name} ({item.variant.size}) × {item.quantity}</span>
                <span className="tabular-nums">₹{item.variant.price * item.quantity}</span>
              </div>
            ))}
            {appliedDiscount && (
              <>
                <div className="border-t border-border pt-3 flex justify-between text-sm font-body text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-body text-accent">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="tabular-nums">-₹{discountAmount}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xs font-body text-emerald-700 dark:text-emerald-400">
              <span>Delivery</span>
              <span>{totalPrice >= 999 ? "FREE" : "Standard (Free on ₹999+)"}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-display text-lg">
              <span>Total</span>
              <span className="tabular-nums">₹{totalPrice}</span>
            </div>
          </div>

          {isInventoryUnavailable(stock) && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-300 text-xs font-body flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>Live inventory verification is currently offline. Orders cannot be placed until stock connection is re-established.</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden Honeypot Field against automated spam submissions */}
            <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] font-body text-muted-foreground mb-2 flex items-center justify-between">
                <span>Email Address *</span>
                {isGoogleAuthenticated && googleUser && form.email === googleUser.email ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
                    <ShieldCheck size={12} /> Google Account
                  </span>
                ) : null}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="yourname@gmail.com"
              />
              <p className="text-[11px] text-muted-foreground mt-1 font-body">
                Order confirmation receipts, shipping alerts, and tracking links will be sent here.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] font-body text-muted-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] font-body text-muted-foreground mb-2">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] font-body text-muted-foreground mb-2">
                Delivery Address *
              </label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="House/Flat No., Street, Landmark, City, Pincode"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] font-body text-muted-foreground mb-2">
                Order Notes (Optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Special delivery instructions, gift notes, etc."
              />
            </div>

            <button
              type="submit"
              disabled={isInventoryUnavailable(stock)}
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInventoryUnavailable(stock) ? "Live Inventory Unavailable — Retry Shortly" : `Proceed to UPI Payment (₹${totalPrice})`}
            </button>
          </form>
        </>
      )}

      {step === "payment" && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl">Scan & Pay via UPI</h1>
            <p className="text-sm text-muted-foreground font-body">
              Order ID: <span className="font-medium text-foreground">{orderId}</span> • Total: <span className="font-medium text-foreground">₹{totalPrice}</span>
            </p>
          </div>

          <div className="bg-clay-light p-4 rounded-sm flex items-center justify-center gap-2 text-sm font-body text-muted-foreground">
            <Clock size={16} />
            <span>Complete payment in: </span>
            <span className="font-mono font-medium text-foreground tabular-nums">{formatTime(timer)}</span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-4 border border-border rounded-sm shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`}
                alt="UPI QR Code"
                className="w-52 h-52 object-contain"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">UPI ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-mono text-sm font-medium">{UPI_ID}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(UPI_ID);
                    toast.success("UPI ID copied to clipboard!");
                  }}
                  className="text-xs text-accent font-body hover:underline font-medium uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Mobile UPI Deep Link */}
          <div className="block md:hidden">
            <button
              onClick={openUpiApp}
              className="w-full bg-accent text-accent-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-medium font-body flex items-center justify-center gap-2"
            >
              <Smartphone size={16} />
              Open UPI App (GPay / PhonePe / Paytm)
            </button>
          </div>

          {/* UTR / Transaction Reference ID Input for Payment Verification */}
          <div className="bg-card border border-border p-5 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-foreground font-display font-medium text-sm">
              <FileText size={16} className="text-accent" />
              <span>Step 2: Enter UPI Reference / UTR Number</span>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Once you have completed the payment in your UPI app, please enter the 12-digit UPI Reference / UTR number from the payment receipt to confirm your order:
            </p>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
              placeholder="e.g. 423918273645 (12 digits)"
              className="w-full border border-border bg-background px-4 py-3 font-mono text-sm tracking-wider focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="border-t border-border pt-6 space-y-3">
            <button
              onClick={handlePaymentDone}
              disabled={submitting || !utrNumber.trim()}
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Verifying & Placing Order..." : "Submit Order with Payment Reference"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
