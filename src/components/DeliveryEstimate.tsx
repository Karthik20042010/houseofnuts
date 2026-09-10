import { useState } from "react";
import { MapPin, Truck, Loader2, RotateCcw, BadgeIndianRupee } from "lucide-react";

// Simple, offline delivery-time estimate based on the first two digits of the
// Indian PIN code. No API, no cost — good enough to set expectations.
const ZONES: Array<{ prefixes: string[]; label: string; days: [number, number] }> = [
  { prefixes: ["50", "51", "52", "53"], label: "Telangana / Andhra Pradesh", days: [1, 2] },
  { prefixes: ["56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69"], label: "South India", days: [2, 4] },
  { prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"], label: "West India", days: [3, 5] },
  { prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"], label: "East & North-East India", days: [4, 6] },
  { prefixes: ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "30", "31", "32", "33", "34", "36", "38", "39"], label: "North & Central India", days: [3, 6] },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const DeliveryEstimate = () => {
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ label: string; from: string; to: string } | null>(null);
  const [error, setError] = useState("");

  const check = () => {
    const clean = pin.replace(/\D/g, "");
    if (clean.length !== 6) {
      setError("Please enter a valid 6-digit PIN code");
      setResult(null);
      return;
    }
    setError("");
    setChecking(true);
    setTimeout(() => {
      const zone = ZONES.find((z) => z.prefixes.includes(clean.slice(0, 2)));
      const [min, max] = zone ? zone.days : [4, 7];
      const from = new Date();
      from.setDate(from.getDate() + min);
      const to = new Date();
      to.setDate(to.getDate() + max);
      setResult({
        label: zone ? zone.label : "Your area",
        from: formatDate(from),
        to: formatDate(to),
      });
      setChecking(false);
    }, 450);
  };

  return (
    <div className="border border-border rounded-sm p-4 space-y-3 bg-clay-light/50">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body flex items-center gap-2">
        <MapPin size={14} className="text-accent" /> Check delivery to your area
      </p>
      <div className="flex gap-2">
        <input
          value={pin}
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
            setResult(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Enter 6-digit PIN code"
          className="flex-1 border border-border bg-background px-3 min-h-[44px] font-body text-sm rounded-sm focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={check}
          disabled={checking || pin.length < 6}
          className="px-5 min-h-[44px] bg-accent text-accent-foreground text-xs uppercase tracking-wider font-body font-medium rounded-sm hover:bg-primary transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          {checking && <Loader2 size={13} className="animate-spin" />} Check
        </button>
      </div>

      {error && <p className="text-xs text-destructive font-body">{error}</p>}

      {result && (
        <div className="space-y-1.5 pt-1">
          <p className="text-sm font-body flex items-center gap-2">
            <Truck size={15} className="text-accent shrink-0" />
            Arrives <span className="font-semibold">{result.from} – {result.to}</span>
          </p>
          <p className="text-xs text-muted-foreground font-body pl-6">Delivering to {result.label} ({pin})</p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t border-border text-[11px] text-muted-foreground font-body">
        <span className="flex items-center gap-1.5"><BadgeIndianRupee size={13} className="text-accent" /> Pay by UPI on order</span>
        <span className="flex items-center gap-1.5"><RotateCcw size={13} className="text-accent" /> Easy replacement on damage</span>
      </div>
    </div>
  );
};

export default DeliveryEstimate;
