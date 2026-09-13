import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, MessageCircle, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BUSINESS_INFO } from "@/lib/businessInfo";
import { toast } from "sonner";

export default function AdminBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "final" | "estimate">("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bills").select("*").order("created_at", { ascending: false });
      setBills(data || []);
    })();
  }, []);

  const filtered = bills.filter((b) => {
    if (filter !== "all" && b.bill_type !== filter) return false;
    if (search && !`${b.bill_number} ${b.customer_name} ${b.customer_phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    const created = new Date(b.created_at);
    if (fromDate) {
      const f = new Date(fromDate); f.setHours(0, 0, 0, 0);
      if (created < f) return false;
    }
    if (toDate) {
      const t = new Date(toDate); t.setHours(23, 59, 59, 999);
      if (created > t) return false;
    }
    return true;
  });

  const sendWhatsApp = (b: any) => {
    const phone = (b.customer_phone || "").replace(/\D/g, "");
    if (!phone) return toast.error("Customer phone number not available");
    const intl = phone.length === 10 ? `91${phone}` : phone;
    const msg = encodeURIComponent(
      `Hello ${b.customer_name},\n\nThank you for shopping with ${BUSINESS_INFO.name}!\n\n` +
      `${b.bill_type === "estimate" ? "Estimate" : "Bill"} #${b.bill_number}\n` +
      `Total: ₹${Number(b.total).toFixed(2)}\n\n` +
      (b.pdf_url ? `View / download: ${b.pdf_url}\n\n` : "") +
      `– ${BUSINESS_INFO.proprietor}\n${BUSINESS_INFO.name}`
    );
    window.open(`https://wa.me/${intl}?text=${msg}`, "_blank");
  };

  const clearDates = () => { setFromDate(undefined); setToDate(undefined); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display">All Bills</h2>
        <Link to="/admin/bills/new"><Button><Plus className="w-4 h-4 mr-2" />New Bill</Button></Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Input
          placeholder="Search by bill # / customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-1">
          {(["all", "final", "estimate"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "final" ? "Bills" : "Estimates"}
            </Button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn(!fromDate && "text-muted-foreground")}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              {fromDate ? format(fromDate, "dd MMM yyyy") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn(!toDate && "text-muted-foreground")}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              {toDate ? format(toDate, "dd MMM yyyy") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" onClick={clearDates}><X className="w-4 h-4 mr-1" />Clear dates</Button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <Card>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-3">Bill #</th>
              <th className="p-3">Type</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="p-3">
                  <Link to={`/admin/bills/${b.id}`} className="font-medium underline">{b.bill_number}</Link>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${b.bill_type === "estimate" ? "bg-accent/20 text-accent" : "bg-primary/10"}`}>
                    {b.bill_type}
                  </span>
                </td>
                <td className="p-3">{b.customer_name}</td>
                <td className="p-3 text-muted-foreground">{b.customer_phone}</td>
                <td className="p-3 text-sm">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-3 text-right font-medium">₹{Number(b.total).toFixed(2)}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    {b.pdf_url ? (
                      <a href={b.pdf_url} target="_blank" rel="noopener noreferrer" title="Download PDF">
                        <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                      </a>
                    ) : (
                      <Button variant="ghost" size="icon" disabled title="PDF not available"><Download className="w-4 h-4 opacity-30" /></Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => sendWhatsApp(b)}
                      title="Send via WhatsApp"
                      className="text-[hsl(142,70%,40%)] hover:text-[hsl(142,70%,35%)]"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No bills found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
