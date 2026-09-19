import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, Search, Phone, MapPin, Mail, HelpCircle, ShieldCheck, Truck, RefreshCw, Lock, FileText, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import CartDrawer from "@/components/CartDrawer";
import ContactMessageForm from "@/components/ContactMessageForm";

type Info = {
  eyebrow: string;
  title: string;
  intro: string;
  icon: typeof HelpCircle;
  sections: Array<[string, string]>;
};

const NAV_TABS = [
  { path: "/faq", label: "FAQ", icon: HelpCircle },
  { path: "/shipping", label: "Shipping", icon: Truck },
  { path: "/returns", label: "Returns", icon: RefreshCw },
  { path: "/privacy", label: "Privacy", icon: Lock },
  { path: "/terms", label: "Terms", icon: FileText },
  { path: "/contact", label: "Contact Us", icon: Phone },
];

const PAGES: Record<string, Info> = {
  "/faq": {
    eyebrow: "Good to know",
    title: "Frequently Asked Questions",
    intro: "Helpful answers about our artisanal nuts, ordering process, packaging and nationwide delivery.",
    icon: HelpCircle,
    sections: [
      ["Are your products fresh?", "We aim to pack products carefully so they arrive ready to enjoy. Store them in an airtight container in a cool, dry place after opening."],
      ["Do you ship across India?", "Delivery availability and charges are confirmed during checkout. Orders above ₹999 qualify for free shipping in the cart."],
      ["Can I order a gift directly for someone?", "Yes. Add the recipient's delivery address at checkout and use our gifting enquiry for bulk or special-occasion orders."],
      ["How can I get help with an order?", "Keep your order ID handy and message us on WhatsApp so our team can help quickly."],
    ],
  },
  "/shipping": {
    eyebrow: "Freshly packed, quickly shipped",
    title: "Shipping Policy",
    intro: "Everything you need to know about dispatch timelines, shipping costs and order tracking.",
    icon: Truck,
    sections: [
      ["Dispatch", "Orders are prepared after confirmation. We’ll share any important update using the contact information entered at checkout."],
      ["Delivery charges", "Free shipping applies to qualifying orders above ₹999. Any applicable charge is shown before you place the order."],
      ["Tracking", "Once an order is dispatched, our team can share tracking details and delivery updates."],
      ["Address changes", "Contact us as soon as possible with your order ID. Changes may not be possible after dispatch."],
    ],
  },
  "/returns": {
    eyebrow: "Eat with confidence",
    title: "Returns & Refunds",
    intro: "Our straightforward approach to quality concerns and order support.",
    icon: RefreshCw,
    sections: [
      ["Perishable products", "For hygiene and food-safety reasons, opened edible products generally cannot be returned. If an item arrives damaged, incorrect or unsuitable, please contact us promptly."],
      ["Reporting an issue", "Send your order ID and clear photos of the product and package on WhatsApp. We’ll review the issue and discuss the appropriate resolution."],
      ["Cancellations", "Contact us quickly if you need to cancel. A cancellation can only be considered before an order has been dispatched."],
      ["Refunds", "Approved refunds are processed to the original payment method. Timing depends on the payment provider and bank."],
    ],
  },
  "/privacy": {
    eyebrow: "Your data privacy",
    title: "Privacy Policy",
    intro: "How we collect, protect and handle your personal details when shopping with House of Nuts.",
    icon: Lock,
    sections: [
      ["Information we collect", "We collect the contact, delivery and order information needed to process your purchase and support you."],
      ["How it is used", "Your information is used for order fulfilment, delivery updates, support and fraud prevention. We do not sell personal data."],
      ["Storage", "Store only the information necessary for operating the store, and protect administrative access with strong credentials."],
      ["Your choices", "You can ask us to correct or remove information that is no longer required for an order or applicable legal obligation."],
    ],
  },
  "/terms": {
    eyebrow: "Store terms",
    title: "Terms & Conditions",
    intro: "The standard guidelines that apply when purchasing products from House of Nuts.",
    icon: FileText,
    sections: [
      ["Product information", "We work to present product descriptions, prices and availability accurately. Small variations in natural food products can occur."],
      ["Orders", "An order is confirmed only after our store accepts it. Payment and stock may need verification before dispatch."],
      ["Pricing", "Prices, promotions and availability can change. The final amount is shown before you place an order."],
      ["Contact", "For any concern about an order or these terms, contact us with your order ID and details."],
    ],
  },
  "/contact": {
    eyebrow: "We’d love to hear from you",
    title: "Contact Us",
    intro: "Questions about an order, bulk buying or gifting? Our team in Proddatur is here to help.",
    icon: Phone,
    sections: [
      ["Email Support", "houseofnutsproddatur@gmail.com"],
      ["Phone & WhatsApp", "+91 96525 26920"],
      ["Store address", "10-155/2, KK Street, Gandhi Road, Proddatur, Andhra Pradesh — 516360"],
      ["Order support", "For the fastest help, include your order ID and a short description of your question."],
      ["Business details", "Registered store location: House of Nuts, Gandhi Road, Proddatur. Contact us directly for GST/wholesale invoices."],
    ],
  },
};

const StoreInfo = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const page = PAGES[pathname] ?? PAGES["/faq"];

  const filteredSections = page.sections.filter(
    ([heading, body]) =>
      heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={page.title}
        description={`${page.intro} — House of Nuts Proddatur, Gandhi Road, Proddatur, Andhra Pradesh.`}
        keywords={`house of nuts proddatur, house of nuts contact, dry fruits store proddatur, ${pathname.replace('/', '')} house of nuts`}
        canonicalUrl={pathname}
      />
      <Header />
      <CartDrawer />
      <main className="px-4 sm:px-6 md:px-12 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          {/* Header Banner */}
          <div className="mb-10 text-center md:text-left">
            <span className="eyebrow justify-center md:justify-start mb-3">{page.eyebrow}</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight mb-4">{page.title}</h1>
            <p className="text-muted-foreground font-body text-base md:text-lg max-w-2xl font-light">{page.intro}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-10 border-b border-border/80 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-body uppercase tracking-[0.14em] font-medium transition-all duration-300 whitespace-nowrap ${
                    active
                      ? "gradient-earth text-primary-foreground shadow-soft"
                      : "border border-border bg-card text-foreground hover:border-accent/60 hover:text-accent"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Filter for Sections */}
          <div className="relative mb-8 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-card text-xs uppercase tracking-wider font-body focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Policy Sections Cards */}
          <div className="space-y-4 mb-12">
            {filteredSections.length === 0 ? (
              <div className="p-8 text-center border border-border rounded-2xl bg-card">
                <p className="text-muted-foreground font-body">No matching topics found for "{searchQuery}"</p>
                <button onClick={() => setSearchQuery("")} className="mt-3 text-xs uppercase tracking-widest text-accent font-medium font-body hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              filteredSections.map(([heading, body]) => (
                <div key={heading} className="p-6 sm:p-7 rounded-2xl border border-border/80 bg-card hover:border-accent/40 transition-colors shadow-soft">
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">{heading}</h2>
                  <p className="text-muted-foreground font-body text-sm md:text-base leading-relaxed font-light">{body}</p>
                </div>
              ))
            )}
          </div>

          {/* Special Contact Form embed on /contact */}
          {pathname === "/contact" && (
            <div className="mb-12 p-8 md:p-10 rounded-3xl border border-border bg-card shadow-card">
              <h2 className="font-display text-3xl mb-2">Send Us a Direct Message</h2>
              <p className="text-muted-foreground font-body text-sm mb-6">Fill out the form below and our team will get back to you within 24 hours.</p>
              <ContactMessageForm />
            </div>
          )}

          {/* Quick Action Footer CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
            <Link to="/shop" className="btn-earth">
              Shop Collection
            </Link>
            <a
              href="https://wa.me/919652526920?text=Hi,%20I%20have%20a%20question%20about%20House%20of%20Nuts"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-7 py-3.5 text-[11px] uppercase tracking-[0.15em] font-body font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <MessageCircle size={16} className="text-accent" /> WhatsApp Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreInfo;
