import { useEffect, useState } from "react";
import { ExternalLink, CheckCircle2, Circle, RotateCcw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { adminGetSeoChecklist, adminSaveSeoChecklist } from "@/lib/admin";

const STORAGE_KEY = "hon-seo-checklist";
const SITE = "https://houseofnuts.store";
const SITEMAP = `${SITE}/sitemap.xml`;

type Step = { id: string; title: string; detail: string; links?: { label: string; href: string }[]; copy?: string };
type Section = { title: string; intro: string; steps: Step[] };

const sections: Section[] = [
  {
    title: "1. Publish the website",
    intro: "Google can only find pages that are live on the internet.",
    steps: [
      { id: "publish", title: "Click Publish in the editor", detail: "Use the Publish button (top right). After later changes, click Update so they go live." },
      { id: "domain", title: "Connect houseofnuts.store", detail: "In Publish → Add custom domain, connect houseofnuts.store and wait until it shows Active." },
      { id: "live", title: "Open the live site on your phone", detail: "Check the homepage, a product page and checkout all load correctly.", links: [{ label: "Open site", href: SITE }] },
    ],
  },
  {
    title: "2. Connect Google Search Console",
    intro: "Search Console is Google's free tool that shows how your site appears in search.",
    steps: [
      { id: "gsc-add", title: "Add a property", detail: "Sign in with the shop's Google account and add a URL-prefix property for the address below.", copy: `${SITE}/`, links: [{ label: "Open Search Console", href: "https://search.google.com/search-console" }] },
      { id: "gsc-verify", title: "Verify ownership", detail: "Choose the HTML file method. The verification file is already on the site, so just click Verify.", links: [{ label: "Check verification file", href: `${SITE}/googlef2f89640a8494117.html` }] },
    ],
  },
  {
    title: "3. Submit the sitemap",
    intro: "The sitemap lists every product, category and guide page for Google.",
    steps: [
      { id: "sitemap-check", title: "Confirm the sitemap opens", detail: "It should show a list of page addresses.", links: [{ label: "Open sitemap", href: SITEMAP }, { label: "Open robots.txt", href: `${SITE}/robots.txt` }] },
      { id: "sitemap-submit", title: "Submit it in Search Console", detail: "Go to Indexing → Sitemaps, paste the address below and click Submit. Status should become Success.", copy: SITEMAP, links: [{ label: "Open Sitemaps", href: "https://search.google.com/search-console/sitemaps" }] },
    ],
  },
  {
    title: "4. Verify indexing",
    intro: "Indexing can take a few days to a few weeks. Check back weekly.",
    steps: [
      { id: "inspect", title: "Inspect the homepage", detail: "Paste your homepage address in the top search bar of Search Console, then click Request indexing. Repeat for your top 3 product pages.", links: [{ label: "URL Inspection", href: "https://search.google.com/search-console/inspect" }] },
      { id: "pages", title: "Review the Pages report", detail: "Indexing → Pages shows which pages are indexed and why others are not. Admin, checkout and account pages are meant to stay hidden.", links: [{ label: "Pages report", href: "https://search.google.com/search-console/index" }] },
      { id: "site-search", title: "Search Google directly", detail: "Search site:houseofnuts.store — your pages appear here once indexed.", links: [{ label: "Search now", href: "https://www.google.com/search?q=site%3Ahouseofnuts.store" }] },
      { id: "rich", title: "Test product snippets", detail: "Paste a product page address to confirm price and stock details are readable by Google.", links: [{ label: "Rich Results Test", href: "https://search.google.com/test/rich-results" }] },
    ],
  },
  {
    title: "5. Local visibility",
    intro: "These help you show up in “near me” searches in Proddatur.",
    steps: [
      { id: "gbp", title: "Create or claim a Google Business Profile", detail: "Use the exact same name, address, phone (+91 9652526920) and website as this site.", links: [{ label: "Business Profile", href: "https://business.google.com" }] },
      { id: "merchant", title: "Add free product listings (optional)", detail: "Merchant Center lets products appear in the Google Shopping tab for free.", links: [{ label: "Merchant Center", href: "https://merchants.google.com" }] },
      { id: "reviews", title: "Ask real customers for reviews", detail: "Never offer rewards for reviews or post fake ones." },
    ],
  },
];

const allIds = sections.flatMap((s) => s.steps.map((st) => st.id));

export default function AdminSeoChecklist() {
  const [done, setDone] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  });
  const [sync, setSync] = useState<"loading" | "synced" | "saving" | "offline">("loading");
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); }, [done]);
  useEffect(() => {
    adminGetSeoChecklist()
      .then((remote) => {
        const local = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } })();
        if (Object.keys(remote).length === 0 && Object.keys(local).length > 0) {
          adminSaveSeoChecklist(local).catch(() => {});
        } else setDone(remote);
        setSync("synced");
      })
      .catch(() => setSync("offline"));
  }, []);

  const save = (n: Record<string, string>) => {
    setDone(n);
    setSync("saving");
    adminSaveSeoChecklist(n)
      .then(() => setSync("synced"))
      .catch(() => { setSync("offline"); toast.error("Couldn't save to your Google Sheet. Saved on this device only."); });
  };
  const toggle = (id: string) => {
    const n = { ...done };
    if (n[id]) delete n[id]; else n[id] = new Date().toLocaleDateString("en-IN");
    save(n);
  };
  const count = allIds.filter((id) => done[id]).length;
  const pct = Math.round((count / allIds.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">SEO launch checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">Get houseofnuts.store live and found on Google. {sync === "loading" ? "Loading your saved progress…" : sync === "saving" ? "Saving…" : sync === "synced" ? "Progress is saved to your account and syncs across devices." : "Couldn't reach your Google Sheet — progress is saved on this device only."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { if (confirm("Reset all progress?")) save({}); }}>
          <RotateCcw className="size-4 mr-1" /> Reset
        </Button>
      </div>

      <Card className="p-4 space-y-2">
        <div className="flex justify-between text-sm"><span>{count} of {allIds.length} steps done</span><span className="font-medium">{pct}%</span></div>
        <Progress value={pct} />
      </Card>

      {sections.map((s) => (
        <Card key={s.title} className="p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.intro}</p>
          </div>
          <ul className="space-y-3">
            {s.steps.map((st) => {
              const isDone = !!done[st.id];
              return (
                <li key={st.id} className={`flex gap-3 rounded-lg border border-border p-3 ${isDone ? "bg-muted/50" : ""}`}>
                  <button onClick={() => toggle(st.id)} aria-label={isDone ? "Mark not done" : "Mark done"} className="shrink-0 mt-0.5 text-primary">
                    {isDone ? <CheckCircle2 className="size-5" /> : <Circle className="size-5 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>{st.title}</span>
                      {isDone && <span className="text-xs text-muted-foreground">Done {done[st.id]}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{st.detail}</p>
                    {st.copy && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate">{st.copy}</code>
                        <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(st.copy!); toast.success("Copied"); }}>
                          <Copy className="size-3.5" />
                        </Button>
                      </div>
                    )}
                    {st.links && (
                      <div className="flex flex-wrap gap-2">
                        {st.links.map((l) => (
                          <Button key={l.href} asChild size="sm" variant="secondary">
                            <a href={l.href} target="_blank" rel="noreferrer">{l.label} <ExternalLink className="size-3.5 ml-1" /></a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
