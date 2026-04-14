import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyomb0F_ardu7ESJxebSBu6Qady4RXo4bLjzYbuY1AF6WIUQ4osA3hT1oeOTPi2S2sM/exec";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentDone = async () => {
    setSubmitting(true);

    // Build order data
    const orderData = {
      timestamp: new Date().toISOString(),
      name: form.name,
      phone: form.phone,
      address: form.address,
      notes: form.notes,
      items: items.map((i) => `${i.product.name} (${i.variant.size}) x${i.quantity}`).join(", "),
      total: totalPrice,
    };

    // Try to save to Google Sheet
    if (GOOGLE_SHEET_URL) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
      } catch (err) {
        console.error("Failed to save order:", err);
      }
    }

    // Also save locally
    const orders = JSON.parse(localStorage.getItem("hon-orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("hon-orders", JSON.stringify(orders));

    clearCart();
    setStep("done");
    setSubmitting(false);
  };

  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 px-6">
        <p className="text-muted-foreground font-body text-lg">Your basket is empty</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body"
        >
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
          Thank you, {form.name}! We've received your order. We'll contact you on {form.phone} for confirmation & delivery.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body mt-4"
        >
          Continue Shopping
        </button>
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

      {step === "details" && (
        <>
          <h1 className="font-display text-4xl mb-8">Checkout</h1>

          {/* Order summary */}
          <div className="bg-clay-light p-6 mb-8 space-y-3">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            {items.map((item) => (
              <div key={item.variant.id} className="flex justify-between text-sm font-body">
                <span>
                  {item.product.name} ({item.variant.size}) × {item.quantity}
                </span>
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
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">
                Full Name *
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">
                Phone / WhatsApp *
              </label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">
                Delivery Address *
              </label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors min-h-[80px]"
                placeholder="Full delivery address with pincode"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">
                Notes (Optional)
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Any special instructions"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors duration-300 font-body mt-4"
            >
              Proceed to Payment
            </button>
          </form>
        </>
      )}

      {step === "payment" && (
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Scan & Pay</h1>
          <p className="text-muted-foreground font-body mb-8">
            Pay <span className="text-foreground font-medium">₹{totalPrice}</span> using any UPI app
          </p>

          {/* UPI QR - using UPI deep link format */}
          <div className="bg-clay-light p-8 inline-block mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=863932789@okbizaxis&pn=HouseOfNuts&am=${totalPrice}&cu=INR&tn=Order-${Date.now()}`}
              alt="UPI QR Code"
              className="w-[250px] h-[250px]"
            />
          </div>

          <p className="text-sm text-muted-foreground font-body mb-2">
            Or pay via UPI ID: <span className="text-foreground font-medium select-all">863932789@okbizaxis</span>
          </p>
          <p className="text-xs text-muted-foreground font-body mb-8">
            Amount: ₹{totalPrice}
          </p>

          <div className="bg-accent/10 border border-accent/20 p-4 mb-8 text-sm font-body text-left">
            <p className="font-medium text-foreground mb-1">After payment:</p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Complete the payment in your UPI app</li>
              <li>Click "I've Paid" below to confirm your order</li>
              <li>We'll verify and confirm via WhatsApp/Call</li>
            </ol>
          </div>

          <button
            onClick={handlePaymentDone}
            disabled={submitting}
            className="w-full bg-accent text-accent-foreground py-4 uppercase tracking-[0.15em] text-xs font-medium hover:bg-primary transition-colors duration-300 font-body disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "I've Paid — Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
