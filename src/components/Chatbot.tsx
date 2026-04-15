import { useState } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

interface Message {
  from: "bot" | "user";
  text: string;
}

const FAQ_OPTIONS = [
  { label: "📦 Track my order", key: "track" },
  { label: "💰 Pricing & variants", key: "pricing" },
  { label: "🚚 Delivery info", key: "delivery" },
  { label: "🔄 Return policy", key: "returns" },
  { label: "📞 Contact support", key: "contact" },
  { label: "🎁 Wholesale inquiry", key: "wholesale" },
];

const RESPONSES: Record<string, string> = {
  track: "You can track your orders from the **My Orders** page. Go to the menu → My Orders → click on any order to see its status and tracking details.",
  pricing: "All our products come in multiple sizes (250g, 500g, 1 Kg). Prices start as low as ₹149. Visit any product page to see all size options and prices!",
  delivery: "We deliver across India! Standard delivery takes 3-5 business days. Orders above ₹999 get **free shipping**. Cash on delivery is not available — we accept UPI payments.",
  returns: "We accept returns within 7 days of delivery if the product is unopened and in original packaging. Please contact us via WhatsApp to initiate a return.",
  contact: "📞 Call us: **+91 9652526920**\n💬 WhatsApp: Click the green button at the bottom-left\n⏰ Available: Mon-Sat, 9 AM - 8 PM",
  wholesale: "We offer wholesale pricing for bulk orders! Minimum order: 10 Kg per product. Contact us via WhatsApp or call **+91 9652526920** for a custom quote.",
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! 👋 I'm Nutty, your House of Nuts assistant. How can I help you today?" },
  ]);

  const handleOption = (key: string) => {
    const label = FAQ_OPTIONS.find((o) => o.key === key)?.label || key;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: label },
      { from: "bot", text: RESPONSES[key] || "Sorry, I didn't understand that. Please try another option or contact us on WhatsApp!" },
    ]);
  };

  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-foreground text-background"
            : "bg-accent text-accent-foreground hover:shadow-xl"
        }`}
        aria-label="Chat support"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Pulse ring when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent/30 animate-ping pointer-events-none" />
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] bg-background border border-border shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center gap-3">
            <div className="bg-accent rounded-full p-1.5">
              <Bot size={18} className="text-accent-foreground" />
            </div>
            <div>
              <p className="font-display text-sm font-medium">Nutty</p>
              <p className="text-[10px] font-body text-primary-foreground/60 uppercase tracking-wider">House of Nuts Support</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-sm font-body leading-relaxed ${
                    msg.from === "user"
                      ? "bg-accent text-accent-foreground rounded-t-lg rounded-bl-lg"
                      : "bg-clay-light text-foreground rounded-t-lg rounded-br-lg"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
          </div>

          {/* Quick options */}
          <div className="border-t border-border px-4 py-3 space-y-2 bg-clay-light/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-medium">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {FAQ_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleOption(opt.key)}
                  className="text-[11px] font-body px-3 py-1.5 bg-background border border-border hover:border-accent hover:text-accent transition-colors duration-200 rounded-full"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
