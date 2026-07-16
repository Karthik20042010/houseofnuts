import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Search, AlertCircle, Minus, Plus, Infinity as InfIcon } from "lucide-react";
import { adminUpdateInventory } from "@/lib/admin";
import { fetchInventory, StockMap } from "@/lib/inventory";
import { products, categories } from "@/data/products";
import { toast } from "sonner";

const UNTRACKED = -1;

const AdminInventory = () => {
  const [stock, setStock] = useState<Record<string, number>>({});
  const [initial, setInitial] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    fetchInventory(true).then((s: StockMap) => {
      const init: Record<string, number> = {};
      for (const p of products) {
        for (const v of p.variants) {
          init[v.id] = Object.prototype.hasOwnProperty.call(s, v.id) ? s[v.id] : UNTRACKED;
        }
      }
      setStock(init);
      setInitial({ ...init });
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (s && !p.name.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [q, cat]);

  const dirtyIds = useMemo(
    () => Object.keys(stock).filter((k) => stock[k] !== initial[k]),
    [stock, initial],
  );

  const setVal = (id: string, val: number) => setStock((s) => ({ ...s, [id]: val }));

  const setAllInView = (val: number) => {
    setStock((s) => {
      const next = { ...s };
      for (const p of filteredProducts) for (const v of p.variants) next[v.id] = val;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const items: Array<{ variantId: string; productId: string; size: string; stock: number }> = [];
      for (const p of products) {
        for (const v of p.variants) {
          const val = stock[v.id];
          if (val === UNTRACKED) continue;
          items.push({ variantId: v.id, productId: p.id, size: v.size, stock: Math.max(0, Math.floor(val)) });
        }
      }
      await adminUpdateInventory(items);
      sessionStorage.removeItem("hon-inventory");
      setInitial({ ...stock });
      toast.success(`Saved ${dirtyIds.length} change${dirtyIds.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const lowCount = Object.entries(stock).filter(([, v]) => v !== UNTRACKED && v > 0 && v <= 5).length;
  const outCount = Object.entries(stock).filter(([, v]) => v !== UNTRACKED && v <= 0).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 pb-24">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Summary label="Tracked variants" value={Object.values(stock).filter((v) => v !== UNTRACKED).length} />
        <Summary label="Low stock (≤5)" value={lowCount} tone="pending" />
        <Summary label="Out of stock" value={outCount} tone="cancelled" />
      </div>

      {/* Controls */}
      <div className="bg-background border border-border rounded-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-3 py-2 border border-border bg-background text-sm font-body focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none rounded-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setAllInView(UNTRACKED)}
          className="px-3 py-2 text-xs uppercase tracking-wider font-body border border-border rounded-sm hover:bg-clay-light"
          title="Untrack all visible"
        >
          Set all ∞
        </button>
        <button
          onClick={() => setAllInView(0)}
          className="px-3 py-2 text-xs uppercase tracking-wider font-body border border-border rounded-sm hover:bg-clay-light"
        >
          Set all 0
        </button>
      </div>

      <p className="text-xs text-muted-foreground font-body">
        Set stock per size. <span className="font-medium">Untracked (∞)</span> sells without limits. Stock <span className="font-medium">0</span> shows Out of Stock on the site.
      </p>

      {/* Product groups */}
      <div className="space-y-3">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-background border border-border rounded-sm overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b border-border bg-clay-light/40">
              <img src={p.image} alt={p.name} className="size-10 object-cover rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="font-body font-medium text-sm truncate">{p.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category.replace("-", " ")}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
              {p.variants.map((v) => {
                const val = stock[v.id];
                const untracked = val === UNTRACKED;
                const dirty = val !== initial[v.id];
                const low = !untracked && val > 0 && val <= 5;
                const out = !untracked && val <= 0;
                return (
                  <div
                    key={v.id}
                    className={`border rounded-sm p-3 transition-colors ${
                      dirty ? "border-accent bg-accent/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-body font-medium">{v.size}</div>
                      <div className="flex gap-1">
                        {out && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-status-cancelled/15 text-status-cancelled rounded-sm">
                            Out
                          </span>
                        )}
                        {low && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-status-pending/15 text-status-pending rounded-sm">
                            Low
                          </span>
                        )}
                        {dirty && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-accent/15 text-accent rounded-sm">
                            Edit
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setVal(v.id, Math.max(0, (untracked ? 0 : val) - 1))}
                        disabled={untracked}
                        className="p-1.5 border border-border rounded-sm hover:bg-clay-light disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        disabled={untracked}
                        value={untracked ? "" : val}
                        onChange={(e) => setVal(v.id, e.target.value === "" ? 0 : Number(e.target.value))}
                        className="flex-1 border border-border px-2 py-1.5 text-sm font-body tabular-nums text-center focus:outline-none focus:border-accent rounded-sm disabled:bg-clay-light disabled:text-muted-foreground"
                        placeholder={untracked ? "∞" : "0"}
                      />
                      <button
                        onClick={() => setVal(v.id, (untracked ? 0 : val) + 1)}
                        disabled={untracked}
                        className="p-1.5 border border-border rounded-sm hover:bg-clay-light disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => setVal(v.id, untracked ? 0 : UNTRACKED)}
                        title={untracked ? "Enable tracking" : "Untrack"}
                        className={`p-1.5 border rounded-sm ${
                          untracked ? "border-accent text-accent" : "border-border hover:bg-clay-light"
                        }`}
                      >
                        <InfIcon size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky save bar */}
      {dirtyIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border p-3 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-body">
              <AlertCircle size={14} className="text-accent" />
              <span>
                {dirtyIds.length} unsaved change{dirtyIds.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStock({ ...initial })}
                className="px-4 py-2 text-xs uppercase tracking-wider font-body border border-border rounded-sm hover:bg-clay-light"
              >
                Discard
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50 rounded-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save {dirtyIds.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({ label, value, tone }: { label: string; value: number; tone?: "pending" | "cancelled" }) => (
  <div className="bg-background border border-border rounded-sm p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">{label}</div>
    <div
      className={`font-display text-2xl mt-1 tabular-nums ${
        tone === "pending" ? "text-status-pending" : tone === "cancelled" ? "text-status-cancelled" : ""
      }`}
    >
      {value}
    </div>
  </div>
);

export default AdminInventory;
