import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Smartphone,
  Mail,
  ShieldCheck,
  LogOut,
  QrCode,
  CreditCard,
  Truck,
  Building2,
  Copy,
  Check,
  Lock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { generateOrderId, saveOrder, placeOrderApi, fetchOrderStatus, type Order } from "@/lib/orders";
import { GoogleLoginModal } from "@/components/auth/GoogleLoginModal";
import { toast } from "sonner";

const UPI_ID = "863932789@okbizaxis";
const UPI_NAME = "HouseOfNuts";

type PaymentMethodType = "upi" | "card" | "cod" | "bank";

const CheckoutPage = () => {
  const { items, totalPrice, subtotal, appliedDiscount, discountAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { refresh: refreshInventory } = useInventory();
  const { googleUser, isGoogleAuthenticated, logoutGoogle } = useAuth();

  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(300); // 5 min countdown
  const [orderId, setOrderId] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Delivery Form State
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  // Payment Verification Fields
  const [utrNumber, setUtrNumber] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", holder: "", expiry: "", cvv: "" });

  // Require Google Mail login on checkout load
  useEffect(() => {
    if (!isGoogleAuthenticated) {
      setIsGoogleModalOpen(true);
    } else if (googleUser) {
      setForm((prev) => ({
        ...prev,
        email: googleUser.email,
        name: prev.name || googleUser.name,
      }));
    }
  }, [isGoogleAuthenticated, googleUser]);

  // Automated Live Payment Status Polling Loop
  useEffect(() => {
    if (step !== "payment" || !orderId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetchOrderStatus(orderId);
        if (isMounted && res && res.ok && (res.paymentStatus === "paid" || res.status === "confirmed")) {
          clearInterval(interval);
          toast.success("🎉 Payment verified live! Order confirmed.");
          handlePaymentDone();
        }
      } catch {
        // Silent catch for smooth background polling
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, orderId]);

  // Countdown timer for payment step
  useEffect(() => {
    if (step !== "payment" || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPrice}&cu=INR&tn=Order-${orderId}`;

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGoogleAuthenticated) {
      setIsGoogleModalOpen(true);
      return;
    }
    setOrderId(generateOrderId());
    setTimer(300);
    setStep("payment");
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const openUpiApp = (appScheme?: string) => {
    if (appScheme) {
      window.location.href = `${appScheme}://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${totalPrice}&cu=INR&tn=Order-${orderId}`;
    } else {
      window.location.href = upiDeepLink;
    }
  };

  const handlePaymentDone = useCallback(async () => {
    if (selectedMethod === "upi" && utrNumber.trim() && utrNumber.trim().length < 6) {
      toast.error("Please enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }

    if (selectedMethod === "card") {
      const cleanNum = cardDetails.number.replace(/\s/g, "");
      if (cleanNum.length < 15 || !cardDetails.cvv || !cardDetails.expiry) {
        toast.error("Please complete your credit/debit card details.");
        return;
      }
    }

    setSubmitting(true);

    const noteParts = [];
    if (appliedDiscount) noteParts.push(`[Promo: ${appliedDiscount.code} (-₹${discountAmount})]`);
    if (utrNumber.trim()) noteParts.push(`[UTR/Ref: ${utrNumber.trim()}]`);
    if (selectedMethod === "cod") noteParts.push("[Payment Option: Cash on Delivery]");
    if (selectedMethod === "bank") noteParts.push("[Payment Option: Direct Bank NEFT/IMPS]");
    if (form.notes.trim()) noteParts.push(form.notes.trim());

    let methodLabel: "upi" | "card" | "cod" | "bank_transfer" = "upi";
    if (selectedMethod === "card") methodLabel = "card";
    else if (selectedMethod === "cod") methodLabel = "cod";
    else if (selectedMethod === "bank") methodLabel = "bank_transfer";

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
      })),
      itemsSummary: items.map((i) => `${i.product.name} (${i.variant.size}) x${i.quantity}`).join(", "),
      total: totalPrice,
      status: selectedMethod === "cod" ? "pending" : "confirmed",
      paymentStatus: selectedMethod === "cod" ? "pending" : "paid",
      paymentMethod: methodLabel,
      utrReference: utrNumber.trim() || undefined,
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
  }, [
    orderId,
    form,
    items,
    totalPrice,
    selectedMethod,
    utrNumber,
    cardDetails,
    clearCart,
    refreshInventory,
    appliedDiscount,
    discountAmount,
  ]);

  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6">
        <p className="text-muted-foreground font-body text-lg">Your basket is empty</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body rounded-xl hover:bg-accent transition-colors"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-[65vh] flex items-center justify-center flex-col gap-6 px-6 text-center max-w-lg mx-auto py-12">
        <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-emerald-600 dark:text-emerald-400 shadow-soft">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">Order Successfully Placed!</h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Thank you, <span className="font-semibold text-foreground">{form.name}</span>! Order{" "}
            <span className="font-semibold text-accent font-mono">{orderId}</span> has been confirmed.
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Order updates & delivery tracking have been sent to{" "}
            <span className="font-semibold text-foreground">{form.email}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <button
            onClick={() => navigate(`/orders`)}
            className="flex-1 bg-accent text-accent-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-semibold font-body rounded-2xl hover:bg-primary hover:text-primary-foreground transition-colors shadow-soft"
          >
            Track Order & History
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 border border-border bg-card text-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-medium font-body rounded-2xl hover:bg-secondary transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Google Login Modal Popup */}
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
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 font-body"
      >
        <ArrowLeft size={16} />
        {step === "payment" ? "Back to Delivery Details" : "Back to Store"}
      </button>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-2 mb-8 bg-card border border-border/80 p-3 rounded-2xl shadow-xs">
        {[
          { label: "Delivery Info", idx: 0 },
          { label: "Payment Selection", idx: 1 },
          { label: "Order Received", idx: 2 },
        ].map((item, i) => {
          const stepIdx = step === "details" ? 0 : step === "payment" ? 1 : 2;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`size-7 rounded-full flex items-center justify-center text-xs font-body font-semibold ${
                  i <= stepIdx
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "bg-secondary text-muted-foreground border border-border/50"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[11px] uppercase tracking-wider font-body hidden sm:inline ${
                  i <= stepIdx ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
              {i < 2 && <div className={`w-6 sm:w-10 h-[2px] ${i < stepIdx ? "bg-accent" : "bg-border/60"}`} />}
            </div>
          );
        })}
      </div>

      {step === "details" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">Delivery Details</h1>

            {/* Google Mail User Status Badge */}
            {isGoogleAuthenticated && googleUser ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-body">
                <ShieldCheck size={14} />
                <span className="truncate max-w-[160px] sm:max-w-none">{googleUser.email}</span>
                <button
                  type="button"
                  onClick={logoutGoogle}
                  title="Switch Google Account"
                  className="hover:text-destructive p-0.5 ml-1"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
              >
                <Mail size={14} /> Sign in with Google Mail
              </button>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="bg-card border border-border p-5 rounded-2xl mb-6 space-y-3 shadow-xs font-body">
            <h3 className="font-display text-base text-foreground mb-2 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-muted-foreground font-body font-normal">{items.length} Product(s)</span>
            </h3>
            {items.map((item) => (
              <div key={item.variant.id} className="flex justify-between text-xs font-body py-1 border-b border-border/40 last:border-0">
                <span className="text-foreground">
                  {item.product.name} <span className="text-muted-foreground">({item.variant.size}) × {item.quantity}</span>
                </span>
                <span className="tabular-nums font-semibold text-foreground">₹{item.variant.price * item.quantity}</span>
              </div>
            ))}
            {appliedDiscount && (
              <>
                <div className="border-t border-border/80 pt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-accent font-semibold">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="tabular-nums">-₹{discountAmount}</span>
                </div>
              </>
            )}
            <div className="border-t border-border/80 pt-2 flex justify-between font-display text-lg text-foreground">
              <span>Total Payable</span>
              <span className="tabular-nums font-semibold text-accent">₹{totalPrice}</span>
            </div>
          </div>

          {/* Delivery Details Form */}
          <form onSubmit={handleSubmitDetails} className="space-y-4 font-body">
            {/* Hidden Honeypot Field */}
            <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border bg-background px-4 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                placeholder="yourname@gmail.com"
              />
              <p className="text-[11px] text-muted-foreground mt-1 font-body">
                Order confirmation receipts and delivery tracking updates will be sent here.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                Full Delivery Address *
              </label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-border bg-background px-4 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent resize-none"
                placeholder="House/Flat No., Street, Landmark, City, State, Pincode"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-muted-foreground mb-1">
                Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-border bg-background px-4 py-2.5 font-body text-xs rounded-xl focus:outline-none focus:border-accent"
                placeholder="Special delivery instructions or gift notes"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 uppercase tracking-[0.15em] text-xs font-semibold font-body rounded-2xl hover:bg-accent transition-colors flex items-center justify-center gap-2 shadow-soft cursor-pointer"
            >
              Proceed to Payment Selection (₹{totalPrice})
            </button>
          </form>
        </>
      )}

      {step === "payment" && (
        <div className="space-y-6 font-body">
          <div className="text-center space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">Select Payment Method</h1>
            <p className="text-xs text-muted-foreground font-body">
              Order Ref: <span className="font-mono font-semibold text-accent">{orderId}</span> • Total Payable:{" "}
              <span className="font-semibold text-foreground">₹{totalPrice}</span>
            </p>
          </div>

          <div className="bg-clay-light p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-body text-muted-foreground">
            <Clock size={15} />
            <span>Complete session in: </span>
            <span className="font-mono font-bold text-foreground tabular-nums">{formatTime(timer)}</span>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "upi", label: "UPI & QR", icon: QrCode },
              { id: "card", label: "Cards & Banking", icon: CreditCard },
              { id: "cod", label: "Cash on Delivery", icon: Truck },
              { id: "bank", label: "NEFT / IMPS", icon: Building2 },
            ].map((m) => {
              const Icon = m.icon;
              const active = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as PaymentMethodType)}
                  className={`p-3.5 border rounded-2xl transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-soft scale-[1.02]"
                      : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={20} className={active ? "text-accent" : "text-muted-foreground"} />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: UPI & QR CODE */}
          {selectedMethod === "upi" && (
            <div className="bg-card border border-border p-5 rounded-2xl space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="font-display text-lg text-foreground">Instant UPI QR Code</h3>
                <p className="text-xs text-muted-foreground">
                  Scan using Google Pay, PhonePe, Paytm, or BHIM
                </p>
              </div>

              {/* Dynamic QR Code Image */}
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="bg-white p-4 border border-border rounded-2xl shadow-soft">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`}
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl border border-border">
                  <span className="text-xs font-mono text-foreground font-semibold">{UPI_ID}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedUpi ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    {copiedUpi ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* One-Tap Mobile App Direct Launchers */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-center">
                  One-Tap Mobile UPI Launcher
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openUpiApp("gpay")}
                    className="py-2.5 px-3 bg-secondary hover:bg-accent/15 border border-border rounded-xl text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone size={13} className="text-blue-500" /> GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => openUpiApp("phonepe")}
                    className="py-2.5 px-3 bg-secondary hover:bg-accent/15 border border-border rounded-xl text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone size={13} className="text-purple-500" /> PhonePe
                  </button>
                  <button
                    type="button"
                    onClick={() => openUpiApp("paytm")}
                    className="py-2.5 px-3 bg-secondary hover:bg-accent/15 border border-border rounded-xl text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone size={13} className="text-sky-500" /> Paytm
                  </button>
                </div>
              </div>

              {/* Optional UTR Input Field */}
              <div className="pt-2 border-t border-border/60 space-y-1">
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  UPI Transaction UTR / Ref No. (Optional)
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR reference number"
                  className="w-full border border-border bg-background px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARD */}
          {selectedMethod === "card" && (
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="font-display text-base text-foreground">Credit / Debit Card Payment</h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock size={13} className="text-emerald-500" /> 256-Bit SSL Encrypted
                </div>
              </div>

              <div className="space-y-3 font-body">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="4532 •••• •••• 8910"
                    className="w-full border border-border bg-background px-3.5 py-2.5 text-xs font-mono rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full border border-border bg-background px-3.5 py-2.5 text-xs font-mono rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                      CVV Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      placeholder="•••"
                      className="w-full border border-border bg-background px-3.5 py-2.5 text-xs font-mono rounded-xl focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.holder}
                    onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                    placeholder="Name as printed on card"
                    className="w-full border border-border bg-background px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CASH ON DELIVERY */}
          {selectedMethod === "cod" && (
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-accent/15 text-accent grid place-items-center shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-display text-base text-foreground">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-muted-foreground">Pay with cash when your shipment arrives at your doorstep.</p>
                </div>
              </div>

              <div className="p-3 bg-secondary/70 border border-border/70 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent" /> Zero Cash Handling Surcharge
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Our courier executive will collect exact cash amount <span className="font-semibold text-foreground font-mono">₹{totalPrice}</span> at the time of package handover.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT BANK TRANSFER */}
          {selectedMethod === "bank" && (
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 animate-in fade-in duration-200 font-body">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="font-display text-base text-foreground">NEFT / IMPS / RTGS Bank Transfer</h3>
                <span className="text-[11px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-mono">Direct Deposit</span>
              </div>

              <div className="bg-secondary/60 p-4 rounded-xl space-y-2 text-xs border border-border/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-semibold text-foreground">House of Nuts Pvt Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-semibold text-foreground">924020019842109</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <span className="font-semibold text-foreground">UTIB0001842</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank & Branch:</span>
                  <span className="font-semibold text-foreground">Axis Bank Main Branch</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-medium">
                  Bank Reference / Transaction UTR No.
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter Bank IMPS / NEFT UTR number"
                  className="w-full border border-border bg-background px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Place Order Confirmation Button */}
          <div className="pt-2">
            <button
              onClick={handlePaymentDone}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-semibold font-body rounded-2xl hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Confirming Order & Stock...
                </>
              ) : selectedMethod === "cod" ? (
                `Confirm Cash on Delivery Order (₹${totalPrice})`
              ) : (
                `I've Completed Payment (₹${totalPrice})`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
