import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Cloud, Image as ImageIcon, Link2, Loader2, RotateCcw, Search, Upload, Layers, X, CheckCircle2, AlertCircle, FileSpreadsheet, Download, ExternalLink } from "lucide-react";
import { products, categories } from "@/data/products";
import {
  clearProductImage,
  fileToDataUrl,
  setProductImage,
  useProductImage,
} from "@/lib/productImages";
import { adminUploadImage } from "@/lib/admin";
import { parseSkuMappingCsv, downloadCsv } from "@/lib/adminCsv";
import type { Product } from "@/data/products";


const MAX_INLINE_BYTES = 1_500_000; // ~1.5MB — beyond this we warn but still allow

// -------- Bulk matching --------
// Filenames are matched to product IDs by normalizing both sides: lowercased,
// non-alphanumerics stripped. Longest matching product wins so that
// "mamra-almonds-500.jpg" matches "mamra-almonds" and not "almonds".
function normalize(s: string): string {
  return s.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]/g, "");
}

function matchProduct(filename: string): Product | null {
  const key = normalize(filename);
  if (!key) return null;
  let best: Product | null = null;
  for (const p of products) {
    const pid = normalize(p.id);
    const pname = normalize(p.name);
    if (key === pid || key === pname || key.includes(pid) || key.includes(pname)) {
      if (!best || normalize(best.id).length < pid.length) best = p;
    }
  }
  return best;
}

type BulkTarget = "drive" | "local";
type BulkStatus = "pending" | "uploading" | "done" | "error" | "skipped";
interface BulkRow {
  file: File;
  match: Product | null;
  override?: string; // manually chosen product id
  status: BulkStatus;
  error?: string;
}

function BulkUploader({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [target, setTarget] = useState<BulkTarget>("drive");
  const [running, setRunning] = useState(false);
  // Explicit filename -> SKU map from an uploaded CSV. Takes priority over
  // filename auto-matching, but a manual per-row override still wins.
  const [csvMap, setCsvMap] = useState<Record<string, string>>({});
  const [csvName, setCsvName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const validIds = useMemo(() => new Set(products.map((p) => p.id)), []);

  const fromCsv = (map: Record<string, string>, filename: string) => {
    const id = map[filename.toLowerCase()];
    return id && validIds.has(id) ? id : undefined;
  };

  const addFiles = (files: FileList | null, map = csvMap) => {
    if (!files) return;
    const next: BulkRow[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      next.push({ file: f, match: matchProduct(f.name), override: fromCsv(map, f.name), status: "pending" });
    }
    setRows((r) => [...r, ...next]);
  };

  const loadCsv = async (file: File) => {
    try {
      const text = await file.text();
      const { map, count } = parseSkuMappingCsv(text);
      if (!count) {
        toast.error("No filename/SKU pairs found in that CSV");
        return;
      }
      const unknown = Object.values(map).filter((id) => !validIds.has(id));
      setCsvMap(map);
      setCsvName(file.name);
      // Re-apply mapping to already-added files.
      setRows((r) => r.map((row) => ({ ...row, override: fromCsv(map, row.file.name) ?? row.override })));
      toast.success(`Mapping loaded · ${count} row${count === 1 ? "" : "s"}`, {
        description: unknown.length ? `${unknown.length} unknown SKU(s) ignored: ${unknown.slice(0, 3).join(", ")}` : undefined,
      });
    } catch {
      toast.error("Could not read that CSV");
    }
  };

  const clearCsv = () => {
    setCsvMap({});
    setCsvName(null);
  };

  const downloadTemplate = () => {
    const csv = ["filename,sku", ...products.slice(0, 5).map((p) => `${p.id}.jpg,${p.id}`)].join("\n");
    downloadCsv("sku-image-mapping-template.csv", csv);
  };

  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setOverride = (i: number, id: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, override: id || undefined } : row)));

  const matched = rows.filter((r) => r.override || r.match).length;
  const unmatched = rows.length - matched;


  const runAll = async () => {
    setRunning(true);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const productId = row.override || row.match?.id;
      if (!productId) {
        setRows((r) => r.map((x, idx) => (idx === i ? { ...x, status: "skipped" } : x)));
        continue;
      }
      setRows((r) => r.map((x, idx) => (idx === i ? { ...x, status: "uploading" } : x)));
      try {
        if (target === "drive") {
          const url = await adminUploadImage(productId, row.file, row.match?.category);
          setProductImage(productId, url);
        } else {
          const dataUrl = await fileToDataUrl(row.file);
          setProductImage(productId, dataUrl);
        }
        setRows((r) => r.map((x, idx) => (idx === i ? { ...x, status: "done" } : x)));
      } catch (e) {
        setRows((r) =>
          r.map((x, idx) => (idx === i ? { ...x, status: "error", error: (e as Error).message } : x)),
        );
      }
    }
    setRunning(false);
    toast.success("Bulk upload finished");
  };

  return (
    <div className="border border-border rounded-sm bg-background p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="text-accent" size={16} />
          <h3 className="font-display text-xl">Bulk Upload</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground font-body mb-4 leading-relaxed">
        Drop multiple images at once. We auto-match filenames to SKUs — e.g. <code className="text-foreground">mamra-almonds.jpg</code> maps to the Mamra Almonds product. Any unmatched file lets you pick the SKU manually or skip. Optionally upload a CSV mapping to match files explicitly.
      </p>

      <div className="border border-border rounded-sm p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileSpreadsheet className="text-accent shrink-0" size={15} />
          <div className="min-w-0">
            <div className="text-xs font-body font-medium">
              CSV mapping <span className="text-muted-foreground font-normal">(optional)</span>
            </div>
            <div className="text-[11px] text-muted-foreground font-body truncate">
              {csvName ? `${csvName} · ${Object.keys(csvMap).length} rows` : "Columns: filename, sku"}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <input
            ref={csvRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadCsv(f); e.target.value = ""; }}
          />
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors"
          >
            <Download size={13} /> Template
          </button>
          <button
            onClick={() => csvRef.current?.click()}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> {csvName ? "Replace" : "Upload CSV"}
          </button>
          {csvName && (
            <button
              onClick={clearCsv}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors disabled:opacity-50"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>



      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-foreground/40 transition-colors mb-4"
      >
        <Upload className="mx-auto mb-2 text-muted-foreground" size={22} />
        <p className="text-sm font-body">Drop images here or click to choose files</p>
        <p className="text-[11px] text-muted-foreground font-body mt-1">Filename should contain the product ID or name</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {rows.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3 text-[11px] uppercase tracking-[0.15em] font-body">
            <div className="flex gap-4 items-center">
              <span className="text-muted-foreground">Files: <span className="text-foreground font-medium">{rows.length}</span></span>
              <span className="text-muted-foreground">Matched: <span className="text-foreground font-medium">{matched}</span></span>
              {unmatched > 0 && <span className="text-destructive">Unmatched: {unmatched}</span>}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Save to:</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as BulkTarget)}
                disabled={running}
                className="text-[11px] uppercase tracking-[0.15em] px-2 py-1.5 border border-border bg-background font-body font-medium cursor-pointer focus:outline-none focus:border-foreground/40"
              >
                <option value="drive">Google Drive (public)</option>
                <option value="local">Local preview only</option>
              </select>
            </div>
          </div>

          <div className="border border-border rounded-sm max-h-96 overflow-auto divide-y divide-border">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <img
                  src={URL.createObjectURL(row.file)}
                  alt={row.file.name}
                  className="w-12 h-12 object-cover rounded-sm bg-clay-light shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-body truncate flex items-center gap-2">
                    <span className="truncate">{row.file.name}</span>
                    {fromCsv(csvMap, row.file.name) && (
                      <span className="shrink-0 text-[9px] uppercase tracking-wider bg-accent/15 text-accent px-1.5 py-0.5 rounded-sm">CSV</span>
                    )}
                  </div>

                  <div className="mt-1">
                    <select
                      value={row.override || row.match?.id || ""}
                      onChange={(e) => setOverride(i, e.target.value)}
                      disabled={running}
                      className="text-[11px] px-2 py-1 border border-border bg-background font-body max-w-full"
                    >
                      <option value="">— Skip (no match) —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} · {p.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="shrink-0 w-24 text-right text-[11px] font-body">
                  {row.status === "pending" && (row.override || row.match) && <span className="text-muted-foreground">Ready</span>}
                  {row.status === "pending" && !row.override && !row.match && <span className="text-destructive flex items-center gap-1 justify-end"><AlertCircle size={12} />No match</span>}
                  {row.status === "uploading" && <span className="flex items-center gap-1 justify-end text-accent"><Loader2 size={12} className="animate-spin" />Uploading</span>}
                  {row.status === "done" && <span className="flex items-center gap-1 justify-end text-green-700"><CheckCircle2 size={12} />Done</span>}
                  {row.status === "skipped" && <span className="text-muted-foreground">Skipped</span>}
                  {row.status === "error" && <span className="text-destructive" title={row.error}>Error</span>}
                </div>
                {!running && (
                  <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setRows([])}
              disabled={running}
              className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={runAll}
              disabled={running || matched === 0}
              className="flex items-center gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-primary text-primary-foreground hover:bg-accent transition-colors disabled:opacity-40"
            >
              {running ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {running ? "Uploading…" : `Upload ${matched} file${matched === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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
      const publicUrl = await adminUploadImage(product.id, file, product.category);
      setProductImage(product.id, publicUrl);
      toast.success(`Saved to Drive · ${product.name}`, { id: t });
    } catch (e) {
      toast.error((e as Error).message || "Drive upload failed", { id: t });
    } finally {
      setUploading(false);
    }
  };

  const onSyncBase64ToDrive = async () => {
    if (!currentSrc.startsWith("data:image/")) return;
    setUploading(true);
    const t = toast.loading(`Syncing base64 image to Google Drive…`);
    try {
      const commaIdx = currentSrc.indexOf(",");
      const dataBase64 = commaIdx >= 0 ? currentSrc.slice(commaIdx + 1) : currentSrc;
      const mimeMatch = currentSrc.match(/^data:(image\/[a-zA-Z0-9+-]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const ext = mimeType.split("/")[1] || "jpg";
      const filename = `${product.id}.${ext}`;

      const driveUrl = await adminUploadImage({
        productId: product.id,
        category: product.category,
        filename,
        mimeType,
        dataBase64,
      });

      setProductImage(product.id, driveUrl);
      setUrl("");
      toast.success(`Image uploaded to Drive & published!`, { id: t });
    } catch (e) {
      toast.error((e as Error).message || "Drive sync failed", { id: t });
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
            {currentSrc.startsWith("data:image/") ? "Local Base64" : "Custom"}
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
            {currentSrc.startsWith("data:image/") && (
              <button
                onClick={onSyncBase64ToDrive}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                title="Upload local base64 data to Google Drive & publish URL"
              >
                <Cloud size={13} /> Sync to Drive
              </button>
            )}
            <button
              onClick={() => driveRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 font-medium"
              title="Upload file directly to Google Drive & publish public link"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
              {uploading ? "Uploading..." : "Upload Image"}
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
  const [bulkOpen, setBulkOpen] = useState(false);

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
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-accent" size={18} />
          <h2 className="font-display text-2xl">Product Images</h2>
        </div>
        <div className="flex items-center gap-2">
          {import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_URL && (
            <a
              href={import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-body border border-border hover:border-foreground/40 transition-colors"
            >
              <Cloud size={13} className="text-accent" /> Google Drive Folder <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={() => setBulkOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-body bg-primary text-primary-foreground hover:bg-accent transition-colors"
          >
            <Layers size={13} />
            {bulkOpen ? "Close Bulk" : "Bulk Upload"}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-6">
        <span className="font-medium text-foreground">Bulk</span> matches filenames to SKUs and uploads many at once.
        <span className="font-medium text-foreground"> Drive</span> uploads a single file to your Google Drive and saves it for every visitor.
        <span className="font-medium text-foreground"> Local</span> previews on this browser only.
      </p>

      {bulkOpen && <BulkUploader onClose={() => setBulkOpen(false)} />}

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
