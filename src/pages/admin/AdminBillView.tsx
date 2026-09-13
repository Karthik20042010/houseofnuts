import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, MessageCircle, Printer } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/businessInfo";
import { toast } from "sonner";

export default function AdminBillView() {
  const { id } = useParams();
  const [bill, setBill] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: b } = await supabase.from("bills").select("*").eq("id", id).maybeSingle();
      const { data: it } = await supabase.from("bill_items").select("*").eq("bill_id", id);
      setBill(b);
      setItems(it || []);
    })();
  }, [id]);

  if (!bill) return <div className="p-6 space-y-6"><p>Loading...</p></div>;

  const sendWhatsApp = () => {
    if (!bill.pdf_url) return toast.error("PDF not yet ready");
    const phone = bill.customer_phone.replace(/\D/g, "");
    const intl = phone.length === 10 ? `91${phone}` : phone;
    const msg = encodeURIComponent(
      `Hello ${bill.customer_name},\n\nThank you for shopping with ${BUSINESS_INFO.name}!\n\n` +
      `${bill.bill_type === "estimate" ? "Estimate" : "Bill"} #${bill.bill_number}\n` +
      `Total: ₹${Number(bill.total).toFixed(2)}\n\n` +
      `View / download: ${bill.pdf_url}\n\n` +
      `– ${BUSINESS_INFO.proprietor}\n${BUSINESS_INFO.name}`
    );
    window.open(`https://wa.me/${intl}?text=${msg}`, "_blank");
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/admin/bills" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to bills
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h2 className="text-3xl font-display">{bill.bill_number}</h2>
          <p className="text-sm text-muted-foreground">
            {bill.bill_type === "estimate" ? "Estimate / Quotation" : "Final Bill"} · {new Date(bill.created_at).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {bill.pdf_url && (
            <>
              <a href={bill.pdf_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline"><Download className="w-4 h-4 mr-2" />PDF</Button>
              </a>
              <a href={bill.pdf_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline"><Printer className="w-4 h-4 mr-2" />Print</Button>
              </a>
            </>
          )}
          <Button onClick={sendWhatsApp} className="bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white">
            <MessageCircle className="w-4 h-4 mr-2" />Send via WhatsApp
          </Button>
        </div>
      </div>

      <Card className="p-6 max-w-3xl">
        <div className="border-b pb-3 mb-4">
          <p className="text-xs text-muted-foreground">Bill To</p>
          <p className="font-medium text-lg">{bill.customer_name}</p>
          <p className="text-sm">{bill.customer_phone}</p>
          {bill.customer_address && <p className="text-sm text-muted-foreground">{bill.customer_address}</p>}
        </div>

        <table className="w-full text-sm mb-4">
          <thead className="border-b"><tr className="text-left">
            <th className="py-2">Item</th><th className="text-right">Qty</th><th>Unit</th><th className="text-right">Rate</th><th className="text-right">Amount</th>
          </tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="py-2">{it.product_name}</td>
                <td className="text-right">{Number(it.quantity)}</td>
                <td>{it.unit}</td>
                <td className="text-right">₹{Number(it.price_per_unit).toFixed(2)}</td>
                <td className="text-right">₹{Number(it.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 max-w-xs ml-auto text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(bill.subtotal).toFixed(2)}</span></div>
          {Number(bill.discount) > 0 && <div className="flex justify-between"><span>Discount</span><span>- ₹{Number(bill.discount).toFixed(2)}</span></div>}
          <div className="flex justify-between text-lg font-display border-t pt-2"><span>Total</span><span>₹{Number(bill.total).toFixed(2)}</span></div>
        </div>

        {bill.notes && <p className="mt-4 text-sm"><span className="text-muted-foreground">Notes:</span> {bill.notes}</p>}
      </Card>
    </div>
  );
}
