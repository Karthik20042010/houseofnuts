import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Smartphone } from "lucide-react";
import { generateOrderId, saveOrder, submitToGoogleSheet, type Order } from "@/lib/orders";

const UPI_ID = "863932789@okbizaxis";
const UPI_NAME = "HouseOfNuts";

const CheckoutPage = () => {
  const { items, totalPrice, subtotal, appliedDiscount, discountAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(300); // 5 min countdown
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

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
    setOrderId(generateOrderId());
    setTimer(300);
    setStep("payment");
  };

  const openUpiApp = () => {
    window.location.href = upiDeepLink;
  };

  const handlePaymentDone = useCallback(async () => {
    setSubmitting(true);

    const order: Order = {
      id: orderId,
      timestamp: new Date().toISOString(),
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      notes: form.notes,
      items: items.map((i) => ({
        name: i.product.name,
        size: i.variant.size,
        price: i.variant.price,
        quantity: i.quantity,
      })),
      itemsSummary: items.map((i) => `${i.product.name} (${i.variant.size}) x${i.quantity}`).join(", "),
      total: totalPrice,
      status: "pending",
      paymentStatus: "paid",
    };

    saveOrder(order);
    await submitToGoogleSheet(order);

    clearCart();
    setStep("done");
    setSubmitting(false);
  }, [orderId, form, items, totalPrice, clearCart]);

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
        <h2 className="font-display text-4xl">Order Placed!</h2>
        <p className="text-muted-foreground font-body max-w-md">
          Thank you, {form.name}! Order <span className="font-medium text-foreground">{orderId}</span> has been placed.
          We'll contact you on {form.phone} for confirmation & delivery.
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
          <h1 className="font-display text-4xl mb-8">Checkout</h1>

          <div className="bg-clay-light p-6 mb-8 space-y-3">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            {items.map((item) => (
              <div key={item.variant.id} className="flex justify-between text-sm font-body">
                <span>{item.product.name} ({item.variant.size}) × {item.quantity}</span>
                <span className="tabular-nums">₹{item.variant.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between font-medium font-body">
              <span>Total</span>
              <span className="tabular-nums text-lg">₹{totalPrice}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Full Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Phone / WhatsApp *</label>
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors" placeholder="+91 9652526920" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Email (Optional)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors" placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Delivery Address *</label>
              <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors min-h-[80px]" placeholder="Full delivery address with pincode" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Notes (Optional)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Any special instructions" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body mt-4">
              Proceed to Payment
            </button>
          </form>
        </>
      )}

      {step === "payment" && (
        <div className="text-center">
          <h1 className="font-display text-4xl mb-2">Pay & Confirm</h1>
          <p className="text-muted-foreground font-body mb-6">
            Order <span className="text-foreground font-medium">{orderId}</span> • ₹{totalPrice}
          </p>

          {/* Timer */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 mb-8 border ${timer <= 60 ? "border-destructive/40 text-destructive bg-destructive/5" : "border-accent/30 text-accent bg-accent/5"}`}>
            <Clock size={16} />
            <span className="font-body text-sm font-medium tabular-nums">
              {timer > 0 ? `Complete payment in ${formatTime(timer)}` : "Time expired — please retry"}
            </span>
          </div>

          {/* Open UPI App button (mobile) */}
          <div className="mb-6">
            <button
              onClick={openUpiApp}
              className="w-full bg-accent text-accent-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-primary transition-colors duration-300 font-body flex items-center justify-center gap-3"
            >
              <Smartphone size={18} />
              Open UPI App to Pay ₹{totalPrice}
            </button>
            <p className="text-xs text-muted-foreground font-body mt-2">Opens your UPI app (GPay, PhonePe, Paytm, etc.)</p>
          </div>

          {/* QR Code for desktop */}
          <div className="border border-border p-6 mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-4">Or scan QR code</p>
            <div className="bg-clay-light p-6 inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`}
                alt="UPI QR Code"
                className="w-[200px] h-[200px]"
              />
            </div>
            <p className="text-sm text-muted-foreground font-body">
              UPI ID: <span className="text-foreground font-medium select-all">{UPI_ID}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-accent/10 border border-accent/20 p-4 mb-8 text-sm font-body text-left">
            <p className="font-medium text-foreground mb-2">Steps:</p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Tap "Open UPI App" or scan the QR code</li>
              <li>Complete the payment of ₹{totalPrice}</li>
              <li>Come back here and tap "I've Paid" to confirm</li>
              <li>We'll verify & confirm via WhatsApp/Call</li>
            </ol>
          </div>

          <button
            onClick={handlePaymentDone}
            disabled={submitting || timer <= 0}
            className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "I've Paid — Place Order"}
          </button>

          {timer <= 0 && (
            <button onClick={() => { setTimer(300); setOrderId(generateOrderId()); }} className="w-full mt-3 border border-border py-3 text-xs uppercase tracking-wider font-body hover:bg-clay-light transition-colors">
              Restart Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
