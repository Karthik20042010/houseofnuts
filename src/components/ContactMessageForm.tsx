import { useState } from "react";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { submitMessage } from "@/lib/messages";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").max(255).or(z.literal("")),
  subject: z.string().trim().max(120),
  message: z.string().trim().min(5, "Please write your message").max(1000),
});

const ContactMessageForm = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      await submitMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        type: "enquiry",
      });
      setSent(true);
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      setErrors({ message: (err as Error).message });
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="border border-border rounded-sm p-8 text-center">
        <h2 className="font-display text-2xl">Message sent</h2>
        <p className="mt-3 text-sm text-muted-foreground font-body">
          Thank you — we’ll get back to you on the number you shared.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] font-body hover:text-accent"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field =
    "w-full border border-border bg-background px-3 py-2.5 text-sm font-body rounded-sm focus:outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-border rounded-sm p-6 space-y-4">
      <h2 className="font-display text-2xl">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input className={field} placeholder="Your name" value={form.name} onChange={set("name")} />
          {errors.name && <p className="mt-1 text-xs text-destructive font-body">{errors.name}</p>}
        </div>
        <div>
          <input className={field} placeholder="Phone number" value={form.phone} onChange={set("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-destructive font-body">{errors.phone}</p>}
        </div>
        <div>
          <input className={field} placeholder="Email (optional)" value={form.email} onChange={set("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive font-body">{errors.email}</p>}
        </div>
        <div>
          <input className={field} placeholder="Subject (optional)" value={form.subject} onChange={set("subject")} />
        </div>
      </div>
      <div>
        <textarea
          className={`${field} min-h-[120px] resize-y`}
          placeholder="How can we help?"
          value={form.message}
          onChange={set("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-destructive font-body">{errors.message}</p>}
      </div>
      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground font-body disabled:opacity-60"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};

export default ContactMessageForm;
