import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function AdminCustomers() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", email: "" });

  const load = async () => {
    const { data } = await supabase.from("customers").select("*").order("name");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Name and phone required");
    const { error } = await supabase.from("customers").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Customer added");
    setOpen(false);
    setForm({ name: "", phone: "", address: "", email: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("customers").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display">Customers</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <Button className="w-full" onClick={save}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <table className="w-full">
          <thead className="border-b border-border"><tr className="text-left text-sm text-muted-foreground">
            <th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Address</th><th></th>
          </tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-muted-foreground">{c.address}</td>
                <td className="p-3 text-right"><Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4" /></Button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
