import { useState, useEffect } from "react";
import { X, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface Promo {
  id: string;
  text: string;
  highlight?: string;
  code?: string;
  bg: string;
}

const promos: Promo[] = [
  {
    id: "welcome",
    text: "New here? Get 10% off your first order",
    highlight: "Use code",
    code: "WELCOME10",
    bg: "bg-accent",
  },
  {
    id: "free-ship",
    text: "Free delivery on orders above ₹999",
    highlight: "Limited time!",
    bg: "bg-primary",
  },
  {
    id: "bulk",
    text: "Buy 3+ items and save 15%",
    highlight: "Use code",
    code: "BULK15",
    bg: "bg-accent",
  },
];

const PromoBanner = () => {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  const promo = promos[current];

  return (
    <div className={`${promo.bg} text-accent-foreground relative overflow-hidden`}>
      <div className="max-w-[1600px] mx-auto px-6 py-2.5 flex items-center justify-center gap-3">
        <button
          onClick={() => setCurrent((c) => (c - 1 + promos.length) % promos.length)}
          className="opacity-60 hover:opacity-100 transition-opacity hidden sm:block"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-2 text-xs font-body tracking-wide text-center">
          <Tag size={13} className="shrink-0" />
          <span className="font-medium">{promo.text}</span>
          {promo.highlight && (
            <span className="opacity-80">
              — {promo.highlight}
              {promo.code && (
                <span className="ml-1 font-bold bg-background/20 px-2 py-0.5 tracking-widest">
                  {promo.code}
                </span>
              )}
            </span>
          )}
        </div>

        <button
          onClick={() => setCurrent((c) => (c + 1) % promos.length)}
          className="opacity-60 hover:opacity-100 transition-opacity hidden sm:block"
        >
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-1.5">
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1 h-1 rounded-full transition-all ${i === current ? "bg-accent-foreground w-3" : "bg-accent-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
