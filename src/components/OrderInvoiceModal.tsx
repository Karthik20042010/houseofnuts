import React from "react";
import { Order } from "@/lib/orders";
import { BUSINESS_INFO } from "@/lib/businessInfo";
import { generateBillPdf } from "@/lib/billPdf";
import { X, Printer, Download, MessageCircle, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const invoiceDate = order.timestamp
    ? new Date(order.timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const handleDownloadPdf = () => {
    try {
      const pdfBlob = generateBillPdf({
        billNumber: order.id,
        billType: "final",
        date: invoiceDate,
        customerName: order.name || "Valued Customer",
        customerPhone: order.phone || "",
        customerAddress: order.address || "",
        items: (order.items || []).map((item) => ({
          name: item.name,
          unit: item.size || "Pack",
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: order.total,
        discount: 0,
        total: order.total,
        notes: `Payment Method: ${(order.paymentMethod || "Online").toUpperCase()} | Ref: ${order.cashfreeOrderId || order.id}`,
      });

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Tax Invoice PDF downloaded!");
    } catch (err) {
      toast.error("Could not generate PDF. You can use Print Invoice instead.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const rawPhone = (order.phone || "").replace(/\D/g, "");
    const recipient = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone || BUSINESS_INFO.whatsappNumber;
    
    const itemsSummaryStr = (order.items || [])
      .map((it) => `• ${it.name} (${it.size}): ${it.quantity} x ₹${it.price} = ₹${it.price * it.quantity}`)
      .join("\n");

    const message = encodeURIComponent(
      `🧾 *TAX INVOICE — HOUSE OF NUTS*\n` +
      `----------------------------------------\n` +
      `*Invoice No:* ${order.id}\n` +
      `*Date:* ${invoiceDate}\n` +
      `*Customer:* ${order.name}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Delivery Address:* ${order.address}\n\n` +
      `*ORDER ITEMS:*\n${itemsSummaryStr || order.itemsSummary}\n\n` +
      `*GRAND TOTAL:* ₹${order.total}\n` +
      `*Payment:* ${(order.paymentMethod || "Confirmed").toUpperCase()} (${order.paymentStatus.toUpperCase()})\n` +
      `----------------------------------------\n` +
      `*Track Live Order:* https://houseofnuts.store/orders?order=${order.id}\n\n` +
      `_Thank you for choosing House of Nuts Proddatur!_`
    );

    window.open(`https://wa.me/${recipient}?text=${message}`, "_blank");
    toast.success("Opening WhatsApp with pre-filled Tax Invoice summary!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-clay-light/50">
          <div className="flex items-center gap-2 text-foreground font-display font-bold text-lg">
            <FileText size={20} className="text-accent" /> Tax Invoice #{order.id}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-body font-medium transition-colors cursor-pointer"
              title="Send bill to WhatsApp (100% Free)"
            >
              <MessageCircle size={14} /> Send WhatsApp Bill
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-accent text-accent-foreground hover:opacity-90 text-xs font-body font-medium transition-colors cursor-pointer"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border hover:bg-muted text-xs font-body font-medium transition-colors cursor-pointer"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-sm transition-colors ml-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Digital Invoice Content */}
        <div className="p-6 overflow-y-auto space-y-6 font-body text-xs print:p-0 print:border-none print:shadow-none">
          {/* Header Store Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{BUSINESS_INFO.name}</h2>
              <p className="text-muted-foreground text-xs font-medium">Proprietor: {BUSINESS_INFO.proprietor}</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-sm">{BUSINESS_INFO.address}</p>
              <p className="text-muted-foreground text-xs">Phone: {BUSINESS_INFO.mobiles.join(" / ")}</p>
              <p className="text-accent font-mono text-[11px] font-semibold mt-1">FSSAI No: {BUSINESS_INFO.fssai}</p>
            </div>
            <div className="text-right sm:text-right w-full sm:w-auto bg-clay-light/60 p-3 rounded-sm border border-border">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-mono font-bold text-[10px] uppercase tracking-wider mb-1">
                OFFICIAL TAX INVOICE
              </span>
              <p className="font-display font-bold text-base text-foreground">Invoice #{order.id}</p>
              <p className="text-muted-foreground text-xs">Date: {invoiceDate}</p>
              <p className="text-muted-foreground text-xs font-mono">
                Status: <span className="font-semibold text-emerald-600 uppercase">{order.paymentStatus}</span>
              </p>
            </div>
          </div>

          {/* Customer & Order Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-sm bg-muted/40 border border-border/80">
            <div>
              <p className="text-[10px] uppercase font-mono font-semibold text-muted-foreground tracking-wider mb-1">Billed To (Customer):</p>
              <p className="font-bold text-sm text-foreground">{order.name}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              {order.email && <p className="text-muted-foreground">{order.email}</p>}
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono font-semibold text-muted-foreground tracking-wider mb-1">Shipping Address:</p>
              <p className="text-foreground font-medium leading-relaxed">{order.address}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">
                Payment Method: <span className="uppercase font-semibold text-foreground">{order.paymentMethod || "Online"}</span>
              </p>
            </div>
          </div>

          {/* Itemized Invoice Table */}
          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-clay-light text-foreground text-[11px] font-mono uppercase tracking-wider border-b border-border">
                  <th className="p-3">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Unit / Pack</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-3 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-semibold text-foreground">{item.name}</td>
                    <td className="p-3 text-center font-mono text-muted-foreground">{item.size || "Standard"}</td>
                    <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">₹{item.price}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Terms */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-2">
            <div className="space-y-1 text-[11px] text-muted-foreground max-w-sm">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> 100% Quality Guaranteed
              </p>
              <p>This is a computer-generated tax invoice. Thank you for supporting small-batch artisanal harvest at House of Nuts.</p>
            </div>
            <div className="w-full sm:w-64 space-y-2 p-4 rounded-sm bg-clay-light/80 border border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.total}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Shipping:</span>
                <span className="font-mono text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between font-display text-lg font-bold text-foreground border-t border-border pt-2">
                <span>Invoice Total:</span>
                <span className="text-accent font-mono">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
