import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { adminUpdateInventory, isAdminLoggedIn } from "@/lib/admin";
import { fetchInventory, StockMap } from "@/lib/inventory";
import { products } from "@/data/products";

const UNTRACKED = -1;

const AdminInventory = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    fetchInventory(true).then((s: StockMap) => {
      const initial: Record<string, number> = {};
      for (const p of products) {
        for (const v of p.variants) {
          initial[v.id] = Object.prototype.hasOwnProperty.call(s, v.id) ? s[v.id] : UNTRACKED;
        }
      }
      setStock(initial);
      setLoading(false);
    });
  }, [navigate]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const items: Array<{ variantId: string; productId: string; size: string; stock: number }> = [];
      for (const p of products) {
        for (const v of p.variants) {
          const val = stock[v.id];
          if (val === UNTRACKED) continue; // skip untracked variants
          items.push({ variantId: v.id, productId: p.id, size: v.size, stock: Math.max(0, Math.floor(val)) });
        }
      }
      await adminUpdateInventory(items);
      sessionStorage.removeItem("hon-inventory");
      setMsg("Saved ✓");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-light">
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-display text-3xl">Inventory</h1>
          <div className="flex items-center gap-3">
            {msg && <span className="text-sm font-body text-muted-foreground">{msg}</span>}
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 uppercase tracking-[0.15em] text-xs font-medium font-body hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save All
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground font-body mb-6">
          Set stock per size. Leave as <span className="font-medium">Untracked</span> to let the item sell without limits.
          When stock hits <span className="font-medium">0</span>, the item shows as Out of Stock on the site.
        </p>

        <div className="bg-background border border-border">
          {products.map((p) => (
            <div key={p.id} className="border-b border-border last:border-b-0 p-4">
              <div className="flex items-center gap-4 mb-3">
                <img src={p.image} alt={p.name} className="size-12 object-cover" />
                <div>
                  <div className="font-body font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.category.replace("-", " ")}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {p.variants.map((v) => {
                  const val = stock[v.id];
                  const untracked = val === UNTRACKED;
                  return (
                    <div key={v.id} className="border border-border p-3">
                      <div className="text-xs text-muted-foreground font-body mb-2">{v.size}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          disabled={untracked}
                          value={untracked ? "" : val}
                          onChange={(e) =>
                            setStock((s) => ({ ...s, [v.id]: e.target.value === "" ? 0 : Number(e.target.value) }))
                          }
                          className="w-full border border-border px-2 py-1.5 text-sm font-body tabular-nums focus:outline-none focus:border-accent disabled:bg-clay-light disabled:text-muted-foreground"
                          placeholder={untracked ? "∞" : "0"}
                        />
                        <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-body cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={untracked}
                            onChange={(e) =>
                              setStock((s) => ({ ...s, [v.id]: e.target.checked ? UNTRACKED : 0 }))
                            }
                          />
                          ∞
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
