import { useState } from "react";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import { sanitizeInput, validateEmail, sanitizePhone, isSafeParam } from "@/lib/security";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageCircle, Send, CheckCircle, Store, MapPin, Package, Loader2 } from "lucide-react";

const wholesaleSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  businessName: z.string().trim().min(2, "Business name is required").max(150, "Business name is too long"),
  phone: z.string().trim().min(10, "Enter a valid 10-digit mobile number").max(15, "Phone number is too long"),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(100, "City name is too long"),
  productInterest: z.string().min(1, "Please select a product interest"),
  quantity: z.string().min(1, "Please select an approximate quantity"),
  message: z.string().trim().max(1000, "Message must be under 1000 characters").optional(),
});

type WholesaleFormData = z.infer<typeof wholesaleSchema>;

const productOptions = [
  "Dry Fruits",
  "Nuts",
  "Seeds",
  "Spices",
  "Honey",
  "Gift Hampers",
  "Mixed assortment",
];

const quantityOptions = [
  "5 - 25 kg",
  "25 - 100 kg",
  "100 - 500 kg",
  "500+ kg",
  "Custom regular supply",
];

const initialForm: WholesaleFormData = {
  name: "",
  businessName: "",
  phone: "",
  email: "",
  city: "",
  productInterest: "",
  quantity: "",
  message: "",
};

const WholesaleForm = () => {
  const [form, setForm] = useState<WholesaleFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof WholesaleFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof WholesaleFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = wholesaleSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof WholesaleFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof WholesaleFormData;
        if (!fieldErrors[path]) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Extra server-side safety: reject dangerous payloads before they leave the client
    const dangerousFields = [form.name, form.businessName, form.city, form.message || ""];
    if (dangerousFields.some((f) => !isSafeParam(f))) {
      toast({
        title: "Invalid input",
        description: "Some fields contain characters that are not allowed. Please review and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: sanitizeInput(form.name),
        businessName: sanitizeInput(form.businessName),
        business: sanitizeInput(form.businessName),
        phone: sanitizePhone(form.phone),
        email: form.email ? sanitizeInput(form.email) : "",
        city: sanitizeInput(form.city),
        productInterest: form.productInterest,
        interest: form.productInterest,
        quantity: form.quantity,
        message: sanitizeInput(form.message || ""),
        source: "website_wholesale_form",
        submittedAt: new Date().toISOString(),
      };

      const res = await apiPost<{ ok: boolean; error?: string }>("wholesaleEnquiry", payload);

      if (res.ok) {
        setIsSuccess(true);
        setForm(initialForm);
        toast({
          title: "Enquiry sent",
          description: "Our team will contact you shortly.",
        });
      } else {
        throw new Error(res.error || "Failed to submit enquiry");
      }
    } catch (err) {
      toast({
        title: "Could not send enquiry",
        description: err instanceof Error ? err.message : "Please try again or reach us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappHref = `https://wa.me/919652526920?text=${encodeURIComponent(
    `Hi House of Nuts, I'm interested in wholesale/distributor pricing.${form.businessName ? ` My business: ${form.businessName}.` : ""}${form.city ? ` Location: ${form.city}.` : ""} Please share your catalogue and best rates.`
  )}`;

  if (isSuccess) {
    return (
      <div className="bg-background/5 border border-primary-foreground/10 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 grid place-items-center mb-6">
          <CheckCircle size={32} className="text-accent" />
        </div>
        <h3 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4">
          Enquiry Received
        </h3>
        <p className="font-body text-primary-foreground/70 max-w-md mx-auto mb-8 leading-relaxed">
          Thank you for reaching out. Our wholesale team will review your request and call or WhatsApp you within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+919652526920"
            className="inline-flex items-center justify-center gap-3 border border-primary-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
          >
            <Phone size={16} /> Call Us
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-primary-foreground hover:text-primary transition-all duration-300"
          >
            <MessageCircle size={16} /> WhatsApp Now
          </a>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-xs uppercase tracking-[0.15em] text-accent hover:text-primary-foreground transition-colors font-body"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background/5 border border-primary-foreground/10 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-name" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Your Name <span className="text-accent">*</span>
            </label>
            <input
              id="wholesale-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ramesh Kumar"
              className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              maxLength={100}
            />
            {errors.name && <p className="text-xs text-destructive font-body">{errors.name}</p>}
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-business" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Business / Shop Name <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
              <input
                id="wholesale-business"
                type="text"
                value={form.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                placeholder="Sri Lakshmi Traders"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                maxLength={150}
              />
            </div>
            {errors.businessName && <p className="text-xs text-destructive font-body">{errors.businessName}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-phone" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Mobile Number <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
              <input
                id="wholesale-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="96525 26920"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                maxLength={15}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive font-body">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-email" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Email <span className="text-primary-foreground/40">(optional)</span>
            </label>
            <input
              id="wholesale-email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@business.com"
              className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              maxLength={255}
            />
            {errors.email && <p className="text-xs text-destructive font-body">{errors.email}</p>}
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-city" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              City / Town <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
              <input
                id="wholesale-city"
                type="text"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Proddatur, Andhra Pradesh"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                maxLength={100}
              />
            </div>
            {errors.city && <p className="text-xs text-destructive font-body">{errors.city}</p>}
          </div>

          {/* Product Interest */}
          <div className="space-y-1.5">
            <label htmlFor="wholesale-interest" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Interested In <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" />
              <select
                id="wholesale-interest"
                value={form.productInterest}
                onChange={(e) => handleChange("productInterest", e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-primary text-primary-foreground">Select category</option>
                {productOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-primary text-primary-foreground">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {errors.productInterest && <p className="text-xs text-destructive font-body">{errors.productInterest}</p>}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="wholesale-quantity" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Approximate Requirement <span className="text-accent">*</span>
            </label>
            <select
              id="wholesale-quantity"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-primary text-primary-foreground">Select quantity range</option>
              {quantityOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-primary text-primary-foreground">
                  {opt}
                </option>
              ))}
            </select>
            {errors.quantity && <p className="text-xs text-destructive font-body">{errors.quantity}</p>}
          </div>

          {/* Message */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="wholesale-message" className="text-[11px] uppercase tracking-[0.15em] font-body font-medium text-primary-foreground/80">
              Message <span className="text-primary-foreground/40">(optional)</span>
            </label>
            <textarea
              id="wholesale-message"
              rows={4}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Tell us about your business, preferred products, and delivery location..."
              className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
              maxLength={1000}
            />
            {errors.message && <p className="text-xs text-destructive font-body">{errors.message}</p>}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-primary-foreground hover:text-primary transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={16} /> Send Wholesale Enquiry
              </>
            )}
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 border border-primary-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-body font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 min-h-[52px]"
          >
            <MessageCircle size={16} /> Quick WhatsApp
          </a>
        </div>

        <p className="text-[10px] text-primary-foreground/50 font-body leading-relaxed">
          By submitting, you agree to be contacted by House of Nuts via phone, WhatsApp or email regarding wholesale pricing and distribution.
        </p>
      </form>
    </div>
  );
};

export default WholesaleForm;
