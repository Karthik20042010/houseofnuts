import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MessageSquare, Phone, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  adminFetchMessages,
  adminUpdateMessage,
  type CustomerMessage,
  type MessageStatus,
} from "@/lib/messages";

const STATUSES: MessageStatus[] = ["new", "read", "replied", "archived"];

const statusClass: Record<MessageStatus, string> = {
  new: "bg-accent/20 text-accent-foreground border-accent/40",
  read: "bg-muted text-muted-foreground border-border",
  replied: "bg-primary/10 text-primary border-primary/30",
  archived: "bg-background text-muted-foreground border-border",
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | MessageStatus>("all");
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setMessages(await adminFetchMessages());
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return messages
      .filter((m) => (filter === "all" ? true : m.status === filter))
      .filter((m) =>
        !term
          ? true
          : [m.name, m.phone, m.email, m.subject, m.message, m.type]
              .join(" ")
              .toLowerCase()
              .includes(term),
      );
  }, [messages, q, filter]);

  const setStatus = async (m: CustomerMessage, status: MessageStatus) => {
    setSaving(m.id);
    try {
      await adminUpdateMessage(m.id, { status });
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status } : x)));
      toast.success(`Marked as ${status}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setSaving(null);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: messages.length };
    for (const s of STATUSES) c[s] = messages.filter((m) => m.status === s).length;
    return c;
  }, [messages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Customer messages</h1>
          <p className="text-sm text-muted-foreground font-body">
            Enquiries and wholesale requests sent from the website.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-border bg-background px-3 py-2 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`border rounded-sm p-4 text-left transition-colors ${
              filter === s ? "border-accent bg-accent/5" : "border-border bg-background hover:bg-clay-light"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">{s}</div>
            <div className="font-display text-2xl mt-1 tabular-nums">{counts[s] ?? 0}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, subject…"
            className="w-full border border-border bg-background pl-9 pr-3 py-2 text-sm font-body rounded-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-border bg-background px-3 py-2 text-sm font-body rounded-sm"
        >
          <option value="all">All ({counts.all})</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/5 text-destructive text-sm font-body p-4 rounded-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body py-12 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading messages…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <MessageSquare className="mx-auto text-muted-foreground" size={28} />
          <p className="text-sm text-muted-foreground font-body">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="border border-border rounded-sm bg-background p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-body text-sm font-medium">{m.name || "Unknown"}</span>
                <span className="text-[10px] uppercase tracking-wider border border-border rounded-sm px-2 py-0.5 font-body text-muted-foreground">
                  {m.type}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider border rounded-sm px-2 py-0.5 font-body ${statusClass[m.status] ?? statusClass.read}`}
                >
                  {m.status}
                </span>
                <span className="text-xs text-muted-foreground font-body ml-auto">
                  {m.timestamp ? new Date(m.timestamp).toLocaleString("en-IN") : ""}
                </span>
              </div>

              {m.subject && <div className="font-display text-lg">{m.subject}</div>}
              <p className="text-sm font-body whitespace-pre-line">{m.message}</p>

              <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-border/60">
                {m.phone && (
                  <>
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-1.5 text-xs font-body border border-border rounded-sm px-3 py-2 hover:bg-clay-light"
                    >
                      <Phone size={13} /> {m.phone}
                    </a>
                    <a
                      href={`https://wa.me/${m.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hello ${m.name || ""}, thank you for contacting House of Nuts.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-body border border-border rounded-sm px-3 py-2 hover:bg-clay-light"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  </>
                )}
                {m.email && (
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your enquiry"))}`}
                    className="flex items-center gap-1.5 text-xs font-body border border-border rounded-sm px-3 py-2 hover:bg-clay-light"
                  >
                    <Mail size={13} /> Email
                  </a>
                )}

                <select
                  value={m.status}
                  disabled={saving === m.id}
                  onChange={(e) => setStatus(m, e.target.value as MessageStatus)}
                  className="ml-auto border border-border bg-background px-3 py-2 text-xs font-body rounded-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
