import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, Search, Phone, MapPin, Mail, HelpCircle, ShieldCheck, Truck, RefreshCw, Lock, FileText, Scale } from "lucide-react";
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
  { path: "/shipping_policy", label: "Shipping Policy", icon: Truck },
  { path: "/refund_policy", label: "Refund Policy", icon: RefreshCw },
  { path: "/return_policy", label: "Return Policy", icon: Scale },
  { path: "/privacy_policy", label: "Privacy Policy", icon: Lock },
  { path: "/terms", label: "Terms & Conditions", icon: FileText },
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
  "/shipping_policy": {
    eyebrow: "Freshly packed, quickly shipped",
    title: "Shipping Policy",
    intro: "The orders for the user are shipped through registered domestic courier companies and/or speed post only.",
    icon: Truck,
    sections: [
      ["Dispatch & Courier Partners", "The orders for the user are shipped through registered domestic courier companies and/or speed post only."],
      ["Shipping Timeline", "Orders are shipped within 7 days from the date of the order and/or payment or as per the delivery date agreed at the time of order confirmation and delivering of the shipment, subject to courier company / post office norms."],
      ["Delivery Responsibility & Delay", "Platform Owner shall not be liable for any delay in delivery by the courier company / postal authority. Delivery of all orders will be made to the address provided by the buyer at the time of purchase."],
      ["Email Confirmation", "Delivery of our services will be confirmed on your email ID as specified at the time of registration."],
      ["Non-refundable Shipping Charges", "If there are any shipping cost(s) levied by the seller or the Platform Owner (as the case be), the same is not refundable."],
    ],
  },
  "/refund_policy": {
    eyebrow: "Customer Satisfaction & Quality Assurance",
    title: "Refund and Cancellation Policy",
    intro: "This refund and cancellation policy outlines how you can cancel or seek a refund for a product / service that you have purchased through the Platform.",
    icon: RefreshCw,
    sections: [
      ["Order Cancellation Window", "Cancellations will only be considered if the request is made within 7 days of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to such sellers / merchant(s) listed on the Platform and they have initiated the process of shipping them, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep."],
      ["Perishable Items", "7995526067 / House of Nuts does not accept cancellation requests for perishable items like flowers, eatables, etc. However, the refund / replacement can be made if the user establishes that the quality of the product delivered is not good."],
      ["Damaged or Defective Goods", "In case of receipt of damaged or defective items, please report to our customer service team. The request would be entertained once the seller/ merchant listed on the Platform, has checked and determined the same at its own end. This should be reported within 7 days of receipt of products."],
      ["Expectation & Quality Concerns", "In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 7 days of receiving the product. The customer service team after looking into your complaint will take an appropriate decision."],
      ["Manufacturer Warranty", "In case of complaints regarding the products that come with a warranty from the manufacturers, please refer the issue to them."],
      ["Refund Processing Timeline", "In case of any refunds approved by 7995526067 / House of Nuts, it will take 7 days for the refund to be processed to you."],
    ],
  },
  "/return_policy": {
    eyebrow: "Product Returns & Exchanges",
    title: "Return Policy",
    intro: "We offer refund / exchange within first 7 days from the date of your purchase.",
    icon: Scale,
    sections: [
      ["Return Window", "We offer refund / exchange within first 7 days from the date of your purchase. If 7 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind."],
      ["Eligibility Criteria", "In order to become eligible for a return or an exchange, (i) the purchased item should be unused and in the same condition as you received it, (ii) the item must have original packaging, (iii) if the item that you purchased on a sale, then the item may not be eligible for a return / exchange."],
      ["Defective or Damaged Replacement", "Further, only such items are replaced by us (based on an exchange request), if such items are found defective or damaged."],
      ["Exempted Categories", "You agree that there may be a certain category of products / items that are exempted from returns or refunds. Such categories of the products would be identified to you at the item of purchase."],
      ["Inspection & Quality Check", "For exchange / return accepted request(s) (as applicable), once your returned product / item is received and inspected by us, we will send you an email to notify you about receipt of the returned / exchanged product. Further, if the same has been approved after the quality check at our end, your request (i.e. return / exchange) will be processed in accordance with our policies."],
    ],
  },
  "/privacy_policy": {
    eyebrow: "Your Data Protection",
    title: "Privacy Policy",
    intro: "This Privacy Policy describes how 7995526067 and its affiliates (collectively '7995526067, we, our, us') collect, use, share, protect or otherwise process your information/ personal data through our website https://houseofnuts.store/.",
    icon: Lock,
    sections: [
      ["Introduction & Jurisdiction", "This Privacy Policy describes how 7995526067 and its affiliates process personal data through https://houseofnuts.store/. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India."],
      ["Information Collection", "We collect personal data such as name, date of birth, address, telephone/mobile number, email ID provided during sign-up/registering or using our Platform. Sensitive data like payment details are collected in accordance with applicable laws."],
      ["Data Usage", "We use personal data to provide requested services, assist sellers in order fulfillment, enhance customer experience, resolve disputes, inform about offers/updates, detect fraud, and enforce terms."],
      ["Information Sharing", "We may share personal data internally within group entities and with third-party service providers including logistics partners, payment gateways, and law enforcement agencies when required by law."],
      ["Security Precautions", "To protect your personal data from unauthorized access, loss, or misuse, we adopt reasonable security practices and procedures, adhering to strict security guidelines."],
      ["Data Retention & Deletion", "You have an option to delete your account by visiting your profile settings. We retain personal data for a period no longer than required for the purpose collected or required under applicable law."],
      ["User Consent & Withdrawal", "By visiting our Platform, you consent to data collection and processing. You have an option to withdraw consent by writing to the Grievance Officer."],
      ["Contact Support Hours", "Customer Support & Grievance Team: Monday - Friday (9:00 - 18:00). Email: houseofnutsproddatur@gmail.com | Phone: +91 96525 26920."],
    ],
  },
  "/terms": {
    eyebrow: "Platform Terms of Use",
    title: "Terms & Conditions",
    intro: "This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable.",
    icon: FileText,
    sections: [
      ["Electronic Record", "This document is an electronic record in terms of Information Technology Act, 2000 and rules there under. Generated by a computer system, it does not require physical or digital signatures."],
      ["Platform Ownership", "The Platform https://houseofnuts.store/ is owned by 7995526067, a company incorporated under Companies Act, 1956, with registered office at 10-155-2, KK Street, Gandhi Road, Proddatur, 516360."],
      ["Binding Terms of Use", "Your use of the Platform and services are governed by these Terms of Use. Accessing, browsing, or using the Platform indicates your agreement to all terms."],
      ["User Registration Obligations", "You agree to provide true, accurate, and complete information during registration and accept full responsibility for all acts done through your registered account."],
      ["No Warranties", "Neither we nor third parties provide any warranty as to the accuracy, timeliness, or suitability of materials on this website for any specific purpose."],
      ["Intellectual Property Rights", "The contents of the Platform and Services are proprietary to us. You will not have any authority to claim intellectual property rights in its design, layout, look, or graphics."],
      ["Unlawful Use Restricted", "You agree not to use the Platform or Services for any purpose that is unlawful, illegal, or forbidden by these Terms or Indian/local laws."],
      ["Force Majeure & Governing Law", "Parties shall not be liable for failure to perform due to force majeure events. These Terms are governed by the laws of India."],
    ],
  },
  "/contact": {
    eyebrow: "We’d love to hear from you",
    title: "Contact Us",
    intro: "Questions about an order, bulk buying or gifting? Our team in Proddatur is here to help.",
    icon: Phone,
    sections: [
      ["Email Support", "houseofnutsproddatur@gmail.com"],
      ["Phone & WhatsApp", "+91 96525 26920 / 7995526067"],
      ["Operating Support Hours", "Monday - Friday (9:00 AM - 6:00 PM)"],
      ["Registered Office Address", "10-155-2, KK Street, Gandhi Road, Proddatur, Andhra Pradesh — 516360"],
      ["Order Support", "For the fastest help, include your order ID and a short description of your question."],
      ["Platform Owner Details", "Registered Company / Platform Owner: 7995526067 (House of Nuts), KK Street, Gandhi Road, Proddatur, 516360."],
    ],
  },
};

// Map URL Alias Slugs
const ALIASES: Record<string, string> = {
  "/T&C": "/terms",
  "/terms_and_conditions": "/terms",
  "/privacy": "/privacy_policy",
  "/refund_policy": "/refund_policy",
  "/refund-policy": "/refund_policy",
  "/return_policy": "/return_policy",
  "/return-policy": "/return_policy",
  "/returns": "/return_policy",
  "/shipping_policy": "/shipping_policy",
  "/shipping-policy": "/shipping_policy",
  "/shipping": "/shipping_policy",
};

const StoreInfo = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const targetPath = ALIASES[pathname] || pathname;
  const page = PAGES[targetPath] ?? PAGES["/faq"];

  const filteredSections = page.sections.filter(
    ([heading, body]) =>
      heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={page.title}
        description={`${page.intro} — House of Nuts Proddatur, 10-155-2, KK Street, Gandhi Road, Proddatur, Andhra Pradesh 516360.`}
        keywords={`house of nuts proddatur, house of nuts policies, ${pathname.replace('/', '')} house of nuts`}
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
              const active = targetPath === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-body uppercase tracking-[0.14em] font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
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
              placeholder="Search help topics & legal policies..."
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
          {targetPath === "/contact" && (
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
