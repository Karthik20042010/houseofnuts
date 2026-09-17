import { useState, useEffect } from "react";
import { X, Tag, ChevronLeft, ChevronRight, Sparkles, Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface Promo {
  id: string;
  text: string;
  highlight?: string;
  code?: string;
}

const promos: Promo[] = [
  {
    id: "welcome",
    text: "New to House of Nuts? Enjoy 10% off your artisanal order",
    highlight: "Use promo code",
    code: "WELCOME10",
  },
  {
    id: "free-ship",
    text: "Free nationwide Express Shipping on orders above ₹999",
    highlight: "Limited period offer!",
  },
  {
    id: "bulk",
    text: "Custom Blend & Trail Mixes — Save 15% on 3+ packs",
    highlight: "Apply coupon",
    code: "BULK15",
  },
];

const PromoBanner = () => {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % promos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const promo = promos[current];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#8C3C1A] via-[#B85B24] to-[#732F13] text-amber-50 border-b border-amber-900/30 shadow-xs select-none">
      {/* Subtle top golden sheen line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrent((c) => (c - 1 + promos.length) % promos.length)}
          className="p-1 rounded-full text-amber-200/70 hover:text-white hover:bg-white/10 transition-all hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Previous announcement"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 text-xs font-body tracking-wide text-center py-0.5">
          <Tag size={13} className="text-amber-300 shrink-0 hidden sm:inline-block" />
          
          <span className="font-medium text-amber-50 font-body">{promo.text}</span>
          
          {promo.highlight && (
            <span className="text-amber-200/90 hidden md:inline font-normal">
              — {promo.highlight}
            </span>
          )}

          {promo.code && (
            <button
              type="button"
              onClick={() => handleCopyCode(promo.code!)}
              className="ml-1.5 inline-flex items-center gap-1 font-mono font-bold text-[11px] bg-black/25 hover:bg-black/40 text-amber-200 border border-amber-300/40 px-2.5 py-0.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title="Click to copy code"
            >
              {copiedCode ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} className="text-amber-300" />}
              <span>{promo.code}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrent((c) => (c + 1) % promos.length)}
          className="p-1 rounded-full text-amber-200/70 hover:text-white hover:bg-white/10 transition-all hidden sm:flex items-center justify-center cursor-pointer"
          aria-label="Next announcement"
        >
          <ChevronRight size={15} />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full text-amber-200/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer ml-2"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>

      {/* Modern pill pagination dots */}
      <div className="flex justify-center items-center gap-1.5 pb-1.5">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
              i === current ? "bg-amber-200 w-5 shadow-xs" : "bg-amber-100/30 hover:bg-amber-100/60 w-1.5"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
