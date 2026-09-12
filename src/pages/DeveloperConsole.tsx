import React, { useState } from "react";
import { Terminal, Activity, Database, CheckCircle2, XCircle, RefreshCw, Cpu, Code2, Server, FileSpreadsheet, ExternalLink } from "lucide-react";
import { fetchInventory } from "@/lib/inventory";
import { adminFetchOrders } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export const DeveloperConsole: React.FC = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [inventoryJson, setInventoryJson] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"health" | "logs" | "payload">("health");

  const oneDriveExcelUrl = import.meta.env.VITE_ONEDRIVE_EXCEL_URL as string || "https://1drv.ms/x/c/4ce278ef9bf5ebd6/IQCN8-hhvvf5TYKdAOg6ULN1AR8N2otsJ772B2GiAgQqpUg?e=qKZOjX";

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
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">OneDrive Excel DB</p>
            <a
              href={oneDriveExcelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline flex items-center gap-1 mt-1 font-medium font-body"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Open Excel <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Badge variant="secondary" className="text-[10px]">OneDrive</Badge>
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
    </div>
  );
};

export default DeveloperConsole;
