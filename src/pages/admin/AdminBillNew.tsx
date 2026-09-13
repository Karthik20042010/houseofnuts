import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { generateBillPdf } from "@/lib/billPdf";
import { useNavigate } from "react-router-dom";

interface LineItem {
  product_id?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
}

export default function AdminBillNew() {
  const [stock, setStock] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [billType, setBillType] = useState<"final" | "estimate">("final");
  const [customerId, setCustomerId] = useState<string>("__new");
  const [cust, setCust] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("products_stock").select("*").order("name");
      const { data: c } = await supabase.from("customers").select("*").order("name");
      setStock(s || []);
      setCustomers(c || []);
    })();
  }, []);

  useEffect(() => {
    if (customerId === "__new") {
      setCust({ name: "", phone: "", address: "" });
    } else {
      const c = customers.find((x) => x.id === customerId);
      if (c) setCust({ name: c.name, phone: c.phone, address: c.address || "" });
    }
  }, [customerId, customers]);

  const addItem = (productId?: string) => {
    if (productId) {
      const p = stock.find((s) => s.id === productId);
      if (!p) return;
      setItems([...items, { product_id: p.id, name: p.name, unit: p.unit, quantity: 1, price: Number(p.price_per_unit) }]);
    } else {
      setItems([...items, { name: "", unit: "kg", quantity: 1, price: 0 }]);
    }
  };
  const updateItem = (i: number, patch: Partial<LineItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
  const total = Math.max(0, subtotal - discount);

  const save = async () => {
    if (!cust.name || !cust.phone) return toast.error("Customer name & phone required");
    if (items.length === 0) return toast.error("Add at least one item");
    if (items.some((i) => !i.name || i.quantity <= 0)) return toast.error("All items must have name & qty");

    setSaving(true);
    try {
      // Save customer if new
      let resolvedCustomerId: string | null = customerId === "__new" ? null : customerId;
      if (customerId === "__new") {
        const { data: newCust } = await supabase.from("customers").insert({
          name: cust.name, phone: cust.phone, address: cust.address || null,
        }).select().single();
        resolvedCustomerId = newCust?.id || null;
      }

      // Generate bill number with resilient fallback
      let billNumber = `${billType === "estimate" ? "EST" : "HON"}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      try {
        const { data: numData, error: numErr } = await supabase.rpc("generate_bill_number", { _type: billType });
        if (!numErr && numData) {
          billNumber = numData as string;
        }
      } catch {
        /* Fallback bill number used */
      }

      // Insert bill
      const { data: bill, error: billErr } = await supabase.from("bills").insert({
        bill_number: billNumber,
        bill_type: billType,
        customer_id: resolvedCustomerId,
        customer_name: cust.name,
        customer_phone: cust.phone,
        customer_address: cust.address || null,
        subtotal, discount, total,
        notes: notes || null,
      }).select().single();
      if (billErr) throw billErr;

      // Insert items
      await supabase.from("bill_items").insert(
        items.map((it) => ({
          bill_id: bill.id,
          product_id: it.product_id || null,
          product_name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          price_per_unit: it.price,
          line_total: it.quantity * it.price,
        }))
      );

      // Reduce stock for final bills
      if (billType === "final") {
        for (const it of items) {
          if (!it.product_id) continue;
          const p = stock.find((s) => s.id === it.product_id);
          if (!p) continue;
          await supabase.from("products_stock")
            .update({ stock_quantity: Number(p.stock_quantity) - it.quantity })
            .eq("id", it.product_id);
        }
      }

      // Generate PDF
      const pdfBlob = generateBillPdf({
        billNumber,
        billType,
        date: new Date().toLocaleDateString("en-IN"),
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        items: items.map((i) => ({ name: i.name, unit: i.unit, quantity: i.quantity, price: i.price, total: i.quantity * i.price })),
        subtotal, discount, total, notes,
      });

      // Upload to storage (resilient fallback if bucket/storage isn't enabled)
      try {
        const path = `${bill.id}.pdf`;
        const { error: upErr } = await supabase.storage.from("bills").upload(path, pdfBlob, { contentType: "application/pdf", upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from("bills").getPublicUrl(path);
          if (data?.publicUrl) {
            await supabase.from("bills").update({ pdf_url: data.publicUrl }).eq("id", bill.id);
          }
        }
      } catch {
        /* PDF can still be generated client-side on demand */
      }

      toast.success(`${billType === "final" ? "Bill" : "Estimate"} ${billNumber} created`);
      navigate(`/admin/bills/${bill.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-display mb-6">Create {billType === "final" ? "Bill" : "Estimate"}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 space-y-4">
            <h3 className="font-medium">Bill Type</h3>
            <div className="flex gap-2">
              <Button variant={billType === "final" ? "default" : "outline"} onClick={() => setBillType("final")}>Final Bill</Button>
              <Button variant={billType === "estimate" ? "default" : "outline"} onClick={() => setBillType("estimate")}>Estimate / Quotation</Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-medium">Customer</h3>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__new">+ New customer</SelectItem>
                {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} placeholder="10-digit number" /></div>
            </div>
            <div><Label>Address</Label><Input value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} /></div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Items</h3>
              <div className="flex gap-2">
                <Select onValueChange={(v) => addItem(v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="+ Add from stock" /></SelectTrigger>
                  <SelectContent>
                    {stock.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} (₹{s.price_per_unit}/{s.unit})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => addItem()}><Plus className="w-4 h-4 mr-1" />Custom</Button>
              </div>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4"><Label className="text-xs">Item</Label><Input value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} /></div>
                    <div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" step="0.001" value={it.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} /></div>
                    <div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={it.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} /></div>
                    <div className="col-span-2"><Label className="text-xs">Rate</Label><Input type="number" step="0.01" value={it.price} onChange={(e) => updateItem(i, { price: Number(e.target.value) })} /></div>
                    <div className="col-span-1 text-right text-sm font-medium pb-2">₹{(it.quantity * it.price).toFixed(2)}</div>
                    <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button></div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for the customer..." />
          </Card>
        </div>

        <div>
          <Card className="p-4 space-y-3 sticky top-6">
            <h3 className="font-medium">Summary</h3>
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center"><Label className="text-sm">Discount</Label>
              <Input type="number" step="0.01" className="w-24 text-right" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
            </div>
            <div className="flex justify-between text-lg font-display border-t pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <Button className="w-full" size="lg" onClick={save} disabled={saving}>
              {saving ? "Saving..." : `Create ${billType === "final" ? "Bill" : "Estimate"}`}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
