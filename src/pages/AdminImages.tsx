import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Cloud, Image as ImageIcon, Link2, Loader2, RotateCcw, Search, Upload } from "lucide-react";
import { products, categories } from "@/data/products";
import {
  clearProductImage,
  fileToDataUrl,
  setProductImage,
  useProductImage,
} from "@/lib/productImages";
import { adminUploadImage } from "@/lib/admin";
import type { Product } from "@/data/products";

const MAX_INLINE_BYTES = 1_500_000; // ~1.5MB — beyond this we warn but still allow

function ProductRow({ product }: { product: Product }) {
  const currentSrc = useProductImage(product);
  const isOverridden = currentSrc !== product.image;
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const driveRef = useRef<HTMLInputElement>(null);

  const onUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_INLINE_BYTES) {
      toast.message("Large image", {
        description: "Consider a hosted URL instead — big data URLs slow the site.",
      });
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setProductImage(product.id, dataUrl);
      toast.success(`Image updated · ${product.name}`);
    } catch {
      toast.error("Could not read that file");
    }
  };

  const onSaveUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/") && !trimmed.startsWith("data:")) {
      toast.error("Enter a full https:// URL");
      return;
    }
    setProductImage(product.id, trimmed);
    setUrl("");
    toast.success(`Image updated · ${product.name}`);
  };

  const onReset = () => {
    clearProductImage(product.id);
    toast.success(`Reset to default · ${product.name}`);
  };

  const onDriveUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    const t = toast.loading(`Uploading ${file.name} to Drive…`);
    try {
      const publicUrl = await adminUploadImage(product.id, file);
      setProductImage(product.id, publicUrl);
      toast.success(`Saved to Drive · ${product.name}`, { id: t });
    } catch (e) {
      toast.error((e as Error).message || "Drive upload failed", { id: t });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-sm p-4 flex flex-col sm:flex-row gap-4">
      <div className="relative shrink-0">
        <img
          src={currentSrc}
          alt={product.name}
          className="w-28 h-28 object-cover bg-clay-light rounded-sm"
        />
        {isOverridden && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] uppercase tracking-wider font-body px-1.5 py-0.5 rounded-sm">
            Custom
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div>
          <div className="font-body font-medium text-sm truncate">{product.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {product.category.replace("-", " ")} · {product.id}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSaveUrl()}
                placeholder="Paste image URL"
                className="w-full pl-8 pr-2 py-2 text-sm border border-border rounded-sm bg-background font-body focus:outline-none focus:border-foreground/40"
              />
            </div>
            <button
              onClick={onSaveUrl}
              disabled={!url.trim()}
              className="px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-primary text-primary-foreground disabled:opacity-40 hover:bg-accent transition-colors"
            >
              Save
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
              }}
            />
            <input
              ref={driveRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onDriveUpload(f);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => driveRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
              title="Upload to Google Drive & publish a public link"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
              {uploading ? "Uploading" : "Drive"}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors disabled:opacity-50"
              title="Preview locally on this browser only"
            >
              <Upload size={13} /> Local
            </button>
            <button
              onClick={onReset}
              disabled={!isOverridden || uploading}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Reset to default"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminImages = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!needle) return true;
      return p.name.toLowerCase().includes(needle) || p.id.toLowerCase().includes(needle);
    });
  }, [q, cat]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="text-accent" size={18} />
        <h2 className="font-display text-2xl">Product Images</h2>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-6">
        <span className="font-medium text-foreground">Drive</span> uploads the file to your Google Drive
        ("House of Nuts - Product Images" folder), publishes a public link, and saves it for this SKU so
        every visitor sees it. <span className="font-medium text-foreground">Local</span> previews on this
        browser only. You can also paste any hosted image URL.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-sm bg-background font-body focus:outline-none focus:border-foreground/40"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-sm bg-background font-body focus:outline-none focus:border-foreground/40"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground font-body py-12">
            No products match.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImages;
