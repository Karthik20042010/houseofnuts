import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Globe,
  Users,
  Eye,
  Activity,
  Download,
  RefreshCw,
  Search,
  Smartphone,
  Laptop,
  Tablet,
  ShieldAlert,
  Clock,
  MapPin,
  TrendingUp,
  UserCheck,
  UserX,
  FileText,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  getAnalyticsSummary,
  exportAnalyticsLogsToCsv,
  exportSessionsToCsv,
  formatDuration,
  DateRangeFilter,
  AnalyticsSummary,
  ActivityLog,
} from "@/lib/analytics";
import { toast } from "sonner";

const COLORS = ["#2b2419", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function AdminAnalytics() {
  const [range, setRange] = useState<DateRangeFilter>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [logQuery, setLogQuery] = useState("");
  const [logLevelFilter, setLogLevelFilter] = useState<string>("all");
  const [logPage, setLogPage] = useState(1);

  const loadMetrics = () => {
    setLoading(true);
    try {
      const data = getAnalyticsSummary(range);
      setSummary(data);
    } catch (e) {
      toast.error("Failed to load analytics metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [range]);

  const filteredLogs = useMemo(() => {
    if (!summary) return [];
    return summary.recentLogs.filter((log) => {
      if (logLevelFilter !== "all" && log.level !== logLevelFilter) return false;
      if (logQuery) {
        const q = logQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDetails = (log.details || "").toLowerCase().includes(q);
        const matchUser = (log.userName || "").toLowerCase().includes(q) || (log.userEmail || "").toLowerCase().includes(q);
        const matchLoc = (log.location || "").toLowerCase().includes(q);
        if (!matchAction && !matchDetails && !matchUser && !matchLoc) return false;
      }
      return true;
    });
  }, [summary, logLevelFilter, logQuery]);

  const LOG_PAGE_SIZE = 15;
  const logPageCount = Math.max(1, Math.ceil(filteredLogs.length / LOG_PAGE_SIZE));
  const currentLogPage = Math.min(logPage, logPageCount);
  const pagedLogs = filteredLogs.slice((currentLogPage - 1) * LOG_PAGE_SIZE, currentLogPage * LOG_PAGE_SIZE);

  if (loading || !summary) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="size-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">Loading Analytics & Logs...</p>
      </div>
    );
  }

  const memberVsGuestPieData = [
    { name: "Members (Logged-in)", value: summary.memberViews },
    { name: "Guest Visitors", value: summary.guestViews },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header bar & controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border rounded-sm p-4">
        <div>
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <BarChart3 className="size-5 text-accent" /> Storefront Analytics & System Logs
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Real-time trackings strictly restricted to Admin. Monitors visitors, member activity, locations & logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="flex border border-border rounded-sm overflow-hidden bg-background">
            {(
              [
                { id: "24h", label: "24h" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "12m", label: "12 Months" },
                { id: "30m", label: "30 Months" },
              ] as { id: DateRangeFilter; label: string }[]
            ).map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider font-body transition-colors ${
                  range === r.id ? "bg-primary text-primary-foreground" : "hover:bg-clay-light text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadMetrics()}
            className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm"
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <button
            onClick={() => exportAnalyticsLogsToCsv()}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 text-xs uppercase tracking-wider font-body hover:bg-primary/90 rounded-sm"
          >
            <Download size={13} /> Export Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Avg. Time On Site"
          value={formatDuration(summary.avgSessionSeconds)}
          subtext={`${summary.totalSessions.toLocaleString()} tracked sessions`}
          icon={<Clock className="size-4 text-amber-600" />}
        />
        <KpiCard
          label="Total Time Tracked"
          value={formatDuration(summary.totalTimeSeconds)}
          subtext={`${summary.avgPagesPerSession} pages per session`}
          icon={<Activity className="size-4 text-rose-600" />}
        />
        <KpiCard
          label="Total Page Views"
          value={summary.totalViews.toLocaleString()}
          subtext={`Range: ${range.toUpperCase()}`}
          icon={<Eye className="size-4 text-primary" />}
        />
        <KpiCard
          label="Unique Visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          subtext="Individual client sessions"
          icon={<Users className="size-4 text-blue-600" />}
        />
        <KpiCard
          label="Members Seen"
          value={summary.memberViews.toLocaleString()}
          subtext={`${Math.round((summary.memberViews / summary.totalViews) * 100)}% of total traffic`}
          icon={<UserCheck className="size-4 text-emerald-600" />}
        />
        <KpiCard
          label="Top Visitor Location"
          value={summary.topLocation.split(",")[0]}
          subtext={summary.topLocation}
          icon={<Globe className="size-4 text-purple-600" />}
        />
        <KpiCard
          label="Active Visitors Now"
          value={summary.activeNow.toString()}
          subtext="Live on storefront (15m)"
          tone="pulse"
          icon={<Activity className="size-4 text-emerald-500 animate-pulse" />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Trends Chart (spanning 2 cols) */}
        <div className="lg:col-span-2 bg-background border border-border rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" /> Visitor Traffic & Trends
                {range === "30m" && <span className="text-xs text-muted-foreground font-mono">(Past 30 Months Comparison)</span>}
              </h3>
              <p className="text-xs text-muted-foreground font-body">Historical breakdown of monthly page views and unique members</p>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrends}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b2419" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2b2419" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="memberColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#faf7f2", borderColor: "#e5e0d8", borderRadius: "4px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="totalViews" name="Total Views" stroke="#2b2419" fillOpacity={1} fill="url(#totalColor)" />
                <Area type="monotone" dataKey="memberViews" name="Member Views" stroke="#10b981" fillOpacity={1} fill="url(#memberColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member vs Guest Ratio Pie Chart */}
        <div className="bg-background border border-border rounded-sm p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium text-base flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-600" /> Member vs. Guest Ratio
            </h3>
            <p className="text-xs text-muted-foreground font-body">Logged-in members checked storefront vs anonymous guests</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberVsGuestPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#2b2419" />
                  <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#faf7f2", borderRadius: "4px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border text-xs font-body">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#2b2419]" /> Logged-in Members:
              </span>
              <span className="font-semibold tabular-nums">{summary.memberViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-400" /> Guest Visitors:
              </span>
              <span className="font-semibold tabular-nums">{summary.guestViews.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Location Breakdown & Most Visited Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Location Breakdown */}
        <div className="bg-background border border-border rounded-sm p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-medium text-base flex items-center gap-2">
                <Globe size={16} className="text-purple-600" /> Visitor Geolocation Stats
              </h3>
              <p className="text-xs text-muted-foreground font-body">Where your store visitors and members are browsing from</p>
            </div>
            <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border uppercase">
              Top: {summary.topLocation}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead className="bg-clay-light text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-2 px-3">Location</th>
                  <th className="text-right py-2 px-3">Total Views</th>
                  <th className="text-right py-2 px-3">Members</th>
                  <th className="text-right py-2 px-3">Guests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.locationStats.map((loc, idx) => (
                  <tr key={idx} className="hover:bg-clay-light/50 transition-colors">
                    <td className="py-2 px-3 font-medium flex items-center gap-2">
                      <span>{loc.flagEmoji || "🌐"}</span>
                      <span>{loc.city}, {loc.country}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold tabular-nums">{loc.count.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-medium tabular-nums">{loc.membersCount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground tabular-nums">{loc.guestsCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Checked & Visited Pages */}
        <div className="bg-background border border-border rounded-sm p-4 space-y-4">
          <div>
            <h3 className="font-display font-medium text-base flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Top Visited & Checked Pages
            </h3>
            <p className="text-xs text-muted-foreground font-body">Most active pages visited by users on House of Nuts</p>
          </div>

          <div className="space-y-3">
            {summary.pageStats.slice(0, 6).map((page, idx) => {
              const pct = Math.round((page.views / summary.totalViews) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-body">
                    <span className="font-medium truncate max-w-[260px]" title={page.title}>
                      {page.title} <span className="text-muted-foreground font-mono text-[10px]">({page.path})</span>
                    </span>
                    <span className="tabular-nums font-semibold">{page.views.toLocaleString()} views ({pct}%)</span>
                  </div>
                  <div className="w-full bg-clay-light h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visitor Session Time Tracking */}
      <div className="bg-background border border-border rounded-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-medium text-base flex items-center gap-2">
              <Clock size={16} className="text-amber-600" /> Visitor Sessions & Time Tracking
            </h3>
            <p className="text-xs text-muted-foreground font-body">
              Every visitor session with time spent on site, pages seen, device and location
            </p>
          </div>
          <button
            onClick={() => exportSessionsToCsv()}
            className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-wider font-body hover:bg-clay-light rounded-sm self-start"
          >
            <Download size={13} /> Export Sessions
          </button>
        </div>

        {summary.sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body py-6 text-center">
            No visitor sessions recorded yet. Sessions appear as soon as people browse the storefront.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="text-left border-b border-border text-muted-foreground uppercase tracking-wider text-[10px]">
                  <th className="py-2 pr-3">Visitor</th>
                  <th className="py-2 pr-3">Started</th>
                  <th className="py-2 pr-3">Time On Site</th>
                  <th className="py-2 pr-3">Pages</th>
                  <th className="py-2 pr-3">Last Page</th>
                  <th className="py-2 pr-3">Device</th>
                  <th className="py-2 pr-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {summary.sessions.slice(0, 25).map((s) => (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-clay-light/40">
                    <td className="py-2 pr-3">
                      <span className="font-medium">{s.userName || s.userEmail || "Guest Visitor"}</span>
                      <span className={`ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded border ${s.userType === "member" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border"}`}>
                        {s.userType}
                      </span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums whitespace-nowrap">
                      {new Date(s.startedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-semibold tabular-nums">{formatDuration(s.durationSeconds)}</td>
                    <td className="py-2 pr-3 tabular-nums">{s.pageViews}</td>
                    <td className="py-2 pr-3 font-mono text-[11px]">{s.lastPath}</td>
                    <td className="py-2 pr-3">{s.device} · {s.browser}</td>
                    <td className="py-2 pr-3">{s.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Activity & Visitor Logs Section */}
      <div className="bg-background border border-border rounded-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-display font-medium text-base flex items-center gap-2">
              <Activity size={16} className="text-amber-600" /> Real-time System & Activity Logs
            </h3>
            <p className="text-xs text-muted-foreground font-body">Audit trail of page visits, admin actions, and auth events</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={logQuery}
                onChange={(e) => {
                  setLogQuery(e.target.value);
                  setLogPage(1);
                }}
                placeholder="Search logs by action, user, location…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border bg-background font-body focus:outline-none focus:border-accent rounded-sm"
              />
            </div>

            <select
              value={logLevelFilter}
              onChange={(e) => {
                setLogLevelFilter(e.target.value);
                setLogPage(1);
              }}
              className="border border-border bg-background px-2.5 py-1.5 text-xs font-body focus:outline-none rounded-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {pagedLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs font-body">
            No activity logs match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead className="bg-clay-light text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-2.5 px-3">Timestamp</th>
                  <th className="text-left py-2.5 px-3">Action</th>
                  <th className="text-left py-2.5 px-3">Details</th>
                  <th className="text-left py-2.5 px-3">User</th>
                  <th className="text-left py-2.5 px-3">Location</th>
                  <th className="text-center py-2.5 px-3">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-clay-light/50 transition-colors">
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="py-2 px-3 font-medium">{log.action}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-[280px] truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium">{log.userName || "Guest"}</div>
                      {log.userEmail && <div className="text-[10px] text-muted-foreground">{log.userEmail}</div>}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{log.location || "Unknown"}</td>
                    <td className="py-2 px-3 text-center">
                      <LogLevelBadge level={log.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Logs Pagination */}
        {logPageCount > 1 && (
          <div className="flex items-center justify-between text-xs font-body pt-2">
            <span className="text-muted-foreground">
              Page {currentLogPage} of {logPageCount} ({filteredLogs.length} logs total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentLogPage === 1}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-border rounded-sm uppercase tracking-wider disabled:opacity-40 hover:bg-clay-light"
              >
                Prev
              </button>
              <button
                disabled={currentLogPage === logPageCount}
                onClick={() => setLogPage((p) => Math.min(logPageCount, p + 1))}
                className="px-2.5 py-1 border border-border rounded-sm uppercase tracking-wider disabled:opacity-40 hover:bg-clay-light"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  icon,
  tone,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  tone?: "pulse";
}) {
  return (
    <div className="bg-background border border-border rounded-sm p-4 space-y-1">
      <div className="flex justify-between items-center text-xs uppercase tracking-wider text-muted-foreground font-body">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`font-display text-2xl font-semibold tabular-nums ${tone === "pulse" ? "text-emerald-600" : ""}`}>
        {value}
      </div>
      {subtext && <div className="text-[11px] text-muted-foreground font-body truncate">{subtext}</div>}
    </div>
  );
}

function LogLevelBadge({ level }: { level: ActivityLog["level"] }) {
  const styles: Record<ActivityLog["level"], string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    security: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${styles[level] || styles.info}`}>
      {level}
    </span>
  );
}

export default AdminAnalytics;
