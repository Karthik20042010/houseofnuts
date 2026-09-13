import React, { useState, useEffect } from "react";
import { Terminal, Activity, Database, CheckCircle2, XCircle, RefreshCw, Cpu, Code2, Server, FileSpreadsheet, ExternalLink, Phone, Send } from "lucide-react";
import { fetchInventory } from "@/lib/inventory";
import { adminFetchOrders } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  OtpProvider,
  OtpChannel,
  OtpTelemetryLog,
  getActiveOtpProvider,
  setActiveOtpProvider,
  getOtpTelemetryLogs,
  sendOtp,
} from "@/lib/otpService";
import { toast } from "sonner";

export const DeveloperConsole: React.FC = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [inventoryJson, setInventoryJson] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"health" | "logs" | "payload" | "otp">("health");

  const oneDriveExcelUrl = (import.meta.env.VITE_ONEDRIVE_EXCEL_URL as string) || "";

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setStatus("testing");
    addLog("Initiating Google Apps Script API Health Check...");
    try {
      const startTime = performance.now();
      const map = await fetchInventory(true);
      const duration = Math.round(performance.now() - startTime);
      setInventoryJson(JSON.stringify(map, null, 2));
      addLog(`Inventory fetch successful: Response time ${duration}ms (${Object.keys(map).length} items)`);
      
      addLog("Testing admin authorization fetch...");
      const orders = await adminFetchOrders();
      addLog(`Admin getOrders payload OK: Received ${orders.length} orders`);
      setStatus("success");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog(`API Health Check Failed: ${errMsg}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Terminal className="h-6 w-6 text-accent" /> Developer Console
            </h1>
            <Badge variant="default" className="uppercase font-mono text-[10px]">
              {role} mode
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm font-body">
            System diagnostics, Google Apps Script API health, raw payload inspector, and environment logs.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Run System Diagnostics
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Backend Engine</p>
            <p className="text-lg font-semibold flex items-center gap-1.5 mt-1 font-body">
              <Server className="h-4 w-4 text-accent" /> Apps Script
            </p>
          </div>
          <Badge variant="outline">Web App v1.0</Badge>
        </div>

        <div className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Database Layer</p>
            <p className="text-lg font-semibold flex items-center gap-1.5 mt-1 font-body">
              <FileSpreadsheet className="h-4 w-4 text-accent" /> Google Sheets
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">Secure DB</Badge>
        </div>

        <div className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">API Connection</p>
            <div className="flex items-center gap-1.5 mt-1">
              {status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
              {status === "idle" && <Activity className="h-4 w-4 text-muted-foreground" />}
              <span className="font-semibold font-body capitalize">{status === "idle" ? "Ready" : status}</span>
            </div>
          </div>
          <Badge variant="secondary">JSON / CORS</Badge>
        </div>

        <div className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Runtime Environment</p>
            <p className="text-lg font-semibold flex items-center gap-1.5 mt-1 font-body">
              <Cpu className="h-4 w-4 text-accent" /> Vite React TS
            </p>
          </div>
          <Badge variant="outline">Production</Badge>
        </div>

        <div className="bg-card border border-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Active Permissions</p>
            <p className="text-lg font-semibold flex items-center gap-1.5 mt-1 font-body">
              <Code2 className="h-4 w-4 text-accent" /> Full Dev Access
            </p>
          </div>
          <Badge variant="default">Unlocked</Badge>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("health")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "health"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          API Endpoints & Health
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "logs"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Console Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab("payload")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "payload"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Raw Inventory Payload
        </button>
        <button
          onClick={() => setActiveTab("otp")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "otp"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone size={14} /> OTP Gateway & Telemetry
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 font-display">
              <Database className="h-4 w-4 text-accent" /> Backend Actions Endpoint Matrix
            </h3>
            <div className="divide-y divide-border text-xs font-mono">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-accent">getInventory</span> (doGet)
                  <p className="text-muted-foreground font-body text-xs">Fetches stock counts for all variants from Google Sheet</p>
                </div>
                <Badge variant="outline">GET</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-accent">placeOrder</span> (doPost)
                  <p className="text-muted-foreground font-body text-xs">Appends new customer order row & triggers email notification</p>
                </div>
                <Badge variant="outline">POST</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-accent">sendOtp / verifyOtp</span> (doPost)
                  <p className="text-muted-foreground font-body text-xs">Routes SMS / WhatsApp verification requests to DLT API / Webhook</p>
                </div>
                <Badge variant="outline">POST</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-accent">adminLogin</span> (doPost)
                  <p className="text-muted-foreground font-body text-xs">Validates admin password against Config sheet tab</p>
                </div>
                <Badge variant="outline">POST</Badge>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-accent">getOrders / updateOrder / updateInventory</span> (doPost)
                  <p className="text-muted-foreground font-body text-xs">Protected administration write operations</p>
                </div>
                <Badge variant="default">AUTH REQUIRED</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-zinc-950 text-zinc-200 font-mono text-xs rounded-sm p-4 h-80 overflow-y-auto space-y-1.5 border border-zinc-800">
          {logs.length === 0 ? (
            <p className="text-zinc-500 italic">No diagnostics logs captured yet. Click 'Run System Diagnostics' above.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-zinc-500 font-bold">&gt;</span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "payload" && (
        <div className="bg-zinc-950 text-emerald-400 font-mono text-xs rounded-sm p-4 h-96 overflow-y-auto border border-zinc-800">
          {inventoryJson ? (
            <pre>{inventoryJson}</pre>
          ) : (
            <p className="text-zinc-500 italic">No inventory payload fetched yet. Run diagnostics or trigger inventory fetch.</p>
          )}
        </div>
      )}

      {activeTab === "otp" && <OtpTelemetryConsolePanel />}
    </div>
  );
};

function OtpTelemetryConsolePanel() {
  const [provider, setProvider] = useState<OtpProvider>(getActiveOtpProvider());
  const [logs, setLogs] = useState<OtpTelemetryLog[]>(getOtpTelemetryLogs());
  const [testMobile, setTestMobile] = useState("9652526920");
  const [testChannel, setTestChannel] = useState<OtpChannel>("sms");
  const [testResult, setTestResult] = useState<string>("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const updateLogs = () => setLogs(getOtpTelemetryLogs());
    window.addEventListener("hon-otp-log-update", updateLogs);
    return () => window.removeEventListener("hon-otp-log-update", updateLogs);
  }, []);

  const handleSelectProvider = (val: OtpProvider) => {
    setProvider(val);
    setActiveOtpProvider(val);
    toast.success(`Active OTP Provider switched to "${val.toUpperCase()}"`);
  };

  const handleTestDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTestResult("Dispatching OTP request...");
    try {
      const res = await sendOtp(testMobile, testChannel);
      setTestResult(`Result: ${res.message} (Provider: ${res.provider})`);
      setLogs(getOtpTelemetryLogs());
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      setTestResult(`Error: ${String(err)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Provider Switcher Card */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-soft space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Phone className="text-accent h-5 w-5" /> OTP Provider & Gateway Architecture
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the active OTP dispatch gateway. Switch dynamically between Demo simulation, India DLT SMS (Fast2SMS / MSG91), Meta WhatsApp Business Cloud API, or Google Apps Script Webhooks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { id: "demo", name: "Demo / Staging", tag: "Simulation", desc: "Local OTP (Code: 1234)" },
            { id: "fast2sms", name: "Fast2SMS DLT", tag: "SMS (India)", desc: "DLT Sender ID: HONUTS" },
            { id: "msg91", name: "MSG91 Flow", tag: "SMS / WA", desc: "Indian DLT API Flow" },
            { id: "whatsapp", name: "WhatsApp Cloud", tag: "Meta Direct", desc: "WhatsApp OTP Template" },
            { id: "apps-script", name: "Apps Script API", tag: "Google Backend", desc: "Sheet Webhook Gateway" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectProvider(item.id as OtpProvider)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                provider === item.id
                  ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                  : "border-border bg-background hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">{item.name}</span>
                {provider === item.id && <CheckCircle2 size={14} className="text-accent" />}
              </div>
              <p className="text-[10px] text-accent font-mono mt-1">{item.tag}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Test Dispatch Form */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-soft space-y-4">
        <h4 className="font-display font-semibold text-base flex items-center gap-2">
          <Send size={16} className="text-accent" /> Live OTP Gateway Test Bench
        </h4>

        <form onSubmit={handleTestDispatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
              Mobile Number (+91)
            </label>
            <input
              type="text"
              value={testMobile}
              onChange={(e) => setTestMobile(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs font-mono"
              placeholder="9652526920"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-muted-foreground mb-1">
              Channel
            </label>
            <select
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value as OtpChannel)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs"
            >
              <option value="sms">SMS (DLT Template)</option>
              <option value="whatsapp">WhatsApp Business API</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-accent text-accent-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> Send Test OTP
            </button>
          </div>
        </form>

        {testResult && (
          <div className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-lg border border-zinc-800">
            {testResult}
          </div>
        )}
      </div>

      {/* Telemetry Logs Table */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-semibold text-base flex items-center gap-2">
            <Activity size={16} className="text-accent" /> OTP Dispatch Telemetry Logs ({logs.length})
          </h4>
          <a
            href="/docs/OTP_DEPLOYMENT_STRATEGY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium font-body"
          >
            <FileSpreadsheet size={13} /> View DLT & OTP Strategy Guide
          </a>
        </div>

        <div className="bg-zinc-950 text-zinc-200 font-mono text-xs rounded-xl p-4 h-72 overflow-y-auto space-y-2 border border-zinc-800">
          {logs.length === 0 ? (
            <p className="text-zinc-500 italic">No OTP telemetry logs captured yet. Use the test bench above or request OTP on login modal.</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="border-b border-zinc-800/60 pb-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="font-bold text-emerald-400">{log.mobile}</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] uppercase text-amber-300">{log.provider} ({log.channel})</span>
                  <span className={log.status === "VERIFIED" ? "text-emerald-400 font-bold" : log.status === "SENT" ? "text-blue-400 font-bold" : "text-rose-400 font-bold"}>
                    [{log.status}]
                  </span>
                  <span className="text-zinc-500">{log.latencyMs}ms</span>
                </div>
                <p className="text-zinc-300 text-[11px] font-body pl-2 border-l-2 border-accent/40">{log.details}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
