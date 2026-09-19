import React, { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import {
  RecycledProduct,
  getRecycledProducts,
  restoreFromRecycleBin,
  permanentlyDeleteFromRecycleBin,
  clearRecycleBin,
} from "@/lib/recycleBin";
import { Product } from "@/data/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: (product: Product, restoredStock: Record<string, number>) => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  onRestored,
}) => {
  const [items, setItems] = useState<RecycledProduct[]>([]);
  const [search, setSearch] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadItems = () => {
    setItems(getRecycledProducts());
  };

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadItems();
    window.addEventListener("hon-recycle-bin-update", handleUpdate);
    return () => window.removeEventListener("hon-recycle-bin-update", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.product.name.toLowerCase().includes(q) ||
      (item.product.category && item.product.category.toLowerCase().includes(q)) ||
      (item.product.localName && item.product.localName.toLowerCase().includes(q))
    );
  });

  const handleRestore = async (recycled: RecycledProduct) => {
    setRestoringId(recycled.id);
    const res = await restoreFromRecycleBin(recycled.id, (restoredStock) => {
      onRestored(recycled.product, restoredStock);
    });
    setRestoringId(null);

    if (res.ok && res.product) {
      toast.success(`Restored "${res.product.name}" and its stock inventory!`);
      loadItems();
    } else {
      toast.error(res.error || "Failed to restore product");
    }
  };

  const handlePermanentDelete = (recycled: RecycledProduct) => {
    if (
      window.confirm(
        `Are you sure you want to PERMANENTLY delete "${recycled.product.name}"? This action cannot be undone.`
      )
    ) {
      permanentlyDeleteFromRecycleBin(recycled.id);
      toast.success(`Permanently deleted "${recycled.product.name}"`);
      loadItems();
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        `Are you sure you want to permanently empty the Recycle Bin (${items.length} items)? This cannot be undone.`
      )
    ) {
      clearRecycleBin();
      toast.success("Recycle Bin emptied");
      loadItems();
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-background border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center">
              <Trash2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Recycle Bin & Deleted Inventory
                </h2>
                <Badge variant="outline" className="text-xs font-mono">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Review deleted products and restore them along with their preserved stock levels.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close Recycle Bin"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-border bg-background flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deleted items by name..."
              className="w-full pl-9 pr-3 py-1.5 border border-border rounded-lg text-xs bg-muted/30 focus:outline-none focus:border-accent"
            />
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors font-semibold flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
            >
              <Trash2 size={13} /> Empty Recycle Bin
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="size-14 rounded-full bg-muted grid place-items-center mx-auto text-muted-foreground">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">
                Recycle Bin is empty
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-body">
                When products or stock items are deleted from Inventory, they will appear here safely so you can inspect or restore them at any time.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground font-body">
              No deleted products matched your search "{search}".
            </div>
          ) : (
            filtered.map((item) => {
              const p = item.product;
              const hasStock = Object.keys(item.stockSnapshot).length > 0;

              return (
                <div
                  key={item.id}
                  className="border border-border/80 rounded-xl p-4 bg-card hover:border-accent/30 transition-all space-y-3 shadow-2xs"
                >
                  {/* Top Product Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-14 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-muted-foreground">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {p.name}
                          </h4>
                          {p.badge && (
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-accent/20 text-accent font-semibold rounded">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-body mt-0.5">
                          <span className="uppercase tracking-wider font-semibold text-accent">
                            {p.category}
                          </span>
                          {p.localName && <span>• {p.localName}</span>}
                          <span>• ID: <span className="font-mono text-[10px]">{p.id}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 font-body mt-1">
                          <Calendar size={11} />
                          <span>Deleted on {formatDate(item.deletedAt)}</span>
                          {item.deletedBy && <span>by {item.deletedBy}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={restoringId === item.id}
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-accent transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <RotateCcw size={13} className={restoringId === item.id ? "animate-spin" : ""} />
                        Restore to Inventory
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="p-2 border border-border text-muted-foreground hover:text-destructive hover:border-destructive rounded-lg transition-colors"
                        title="Delete permanently"
                        aria-label={`Permanently delete ${p.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Stock Inventory Matrix at Deletion Time */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">
                      <Boxes size={12} className="text-accent" /> Preserved Stock Inventory at Deletion Time
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {p.variants.map((v) => {
                        const stockCount = item.stockSnapshot[v.id];
                        const isUntracked = stockCount === undefined || stockCount === -1;
                        const isOos = !isUntracked && stockCount <= 0;

                        return (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 text-xs font-body"
                          >
                            <div>
                              <span className="font-semibold text-foreground">{v.size}</span>
                              <span className="text-muted-foreground ml-1.5">₹{v.price}</span>
                            </div>
                            <div>
                              {isUntracked ? (
                                <span className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground rounded font-mono">
                                  Unlimited (∞)
                                </span>
                              ) : isOos ? (
                                <span className="text-[10px] px-2 py-0.5 bg-destructive/15 text-destructive rounded font-bold">
                                  0 in stock
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded font-bold font-mono">
                                  {stockCount} in stock
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length} of {items.length} deleted items shown
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-border bg-background hover:bg-secondary rounded-lg font-semibold text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecycleBinModal;
