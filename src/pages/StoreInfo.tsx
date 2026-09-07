import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ContactMessageForm from "@/components/ContactMessageForm";

type Info = { eyebrow: string; title: string; intro: string; sections: Array<[string, string]> };

const PAGES: Record<string, Info> = {
  "/faq": { eyebrow: "Good to know", title: "Frequently asked questions", intro: "Helpful answers about our products, orders and delivery.", sections: [["Are your products fresh?", "We aim to pack products carefully so they arrive ready to enjoy. Store them in an airtight container in a cool, dry place after opening."], ["Do you ship across India?", "Delivery availability and charges are confirmed during checkout. Orders above ₹999 qualify for free shipping in the cart."], ["Can I order a gift directly for someone?", "Yes. Add the recipient's delivery address at checkout and use our gifting enquiry for bulk or special-occasion orders."], ["How can I get help with an order?", "Keep your order ID handy and message us on WhatsApp so our team can help quickly."]] },
  "/shipping": { eyebrow: "Freshly packed, quickly shipped", title: "Shipping policy", intro: "Everything you need to know about dispatch and delivery.", sections: [["Dispatch", "Orders are prepared after confirmation. We’ll share any important update using the contact information entered at checkout."], ["Delivery charges", "Free shipping applies to qualifying orders above ₹999. Any applicable charge is shown before you place the order."], ["Tracking", "Once an order is dispatched, our team can share tracking details and delivery updates."], ["Address changes", "Contact us as soon as possible with your order ID. Changes may not be possible after dispatch."]] },
  "/returns": { eyebrow: "Eat with confidence", title: "Returns & refunds", intro: "Our approach to food-quality concerns and order issues.", sections: [["Perishable products", "For hygiene and food-safety reasons, opened edible products generally cannot be returned. If an item arrives damaged, incorrect or unsuitable, please contact us promptly."], ["Reporting an issue", "Send your order ID and clear photos of the product and package on WhatsApp. We’ll review the issue and discuss the appropriate resolution."], ["Cancellations", "Contact us quickly if you need to cancel. A cancellation can only be considered before an order has been dispatched."], ["Refunds", "Approved refunds are processed to the original payment method. Timing depends on the payment provider and bank."]] },
  "/privacy": { eyebrow: "Your data", title: "Privacy policy", intro: "How we use the details you provide while shopping with us.", sections: [["Information we collect", "We collect the contact, delivery and order information needed to process your purchase and support you."], ["How it is used", "Your information is used for order fulfilment, delivery updates, support and fraud prevention. We do not sell personal data."], ["Storage", "Store only the information necessary for operating the store, and protect administrative access with strong credentials."], ["Your choices", "You can ask us to correct or remove information that is no longer required for an order or applicable legal obligation."]] },
  "/terms": { eyebrow: "Store terms", title: "Terms & conditions", intro: "The basic terms that apply when shopping with House of Nuts.", sections: [["Product information", "We work to present product descriptions, prices and availability accurately. Small variations in natural food products can occur."], ["Orders", "An order is confirmed only after our store accepts it. Payment and stock may need verification before dispatch."], ["Pricing", "Prices, promotions and availability can change. The final amount is shown before you place an order."], ["Contact", "For any concern about an order or these terms, contact us with your order ID and details."]] },
  "/contact": { eyebrow: "We’d love to hear from you", title: "Get in touch", intro: "Questions about an order, bulk buying or gifting? We’re here to help.", sections: [["Phone & WhatsApp", "+91 96525 26920"], ["Store address", "10-155/2, KK Street, Gandhi Road, Proddatur, Andhra Pradesh — 516360"], ["Order support", "For the fastest help, include your order ID and a short description of your question."], ["Business details", "Add your registered business name, working hours and FSSAI licence number here before publishing."]] },
};

const StoreInfo = () => {
  const { pathname } = useLocation();
  const page = PAGES[pathname] ?? PAGES["/faq"];
  return <div className="min-h-screen bg-background"><Header /><CartDrawer />
    <main className="px-6 py-14 md:px-12 md:py-20"><div className="mx-auto max-w-4xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent font-body">{page.eyebrow}</p>
      <h1 className="mt-3 font-display text-5xl leading-none md:text-6xl">{page.title}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground font-body">{page.intro}</p>
      <div className="mt-12 divide-y divide-border border-y border-border">{page.sections.map(([heading, body]) => <section key={heading} className="py-7"><h2 className="font-display text-2xl">{heading}</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground font-body">{body}</p></section>)}</div>
      {pathname === "/contact" && <div className="mt-12"><ContactMessageForm /></div>}
      <div className="mt-10 flex flex-wrap gap-3"><Link to="/shop" className="bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground font-body">Shop products</Link><a href="https://wa.me/919652526920" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] font-body hover:text-accent"><MessageCircle size={15} /> WhatsApp support</a></div>
    </div></main>
  </div>;
};

export default StoreInfo;
