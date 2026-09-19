import { downloadCsv } from "./adminCsv";

export type DateRangeFilter = "24h" | "7d" | "30d" | "12m" | "30m";

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  level: "info" | "warning" | "error" | "security";
  path?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ip?: string;
  location?: string;
  device?: string;
}

export interface PageHit {
  id: string;
  path: string;
  title: string;
  timestamp: string;
  userType: "member" | "guest";
  userEmail?: string;
  location: string;
  country: string;
  city: string;
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
}

export interface VisitorLocationStat {
  country: string;
  city: string;
  count: number;
  membersCount: number;
  guestsCount: number;
  flagEmoji?: string;
}

export interface PageVisitStat {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  membersViews: number;
}

export interface MonthTrendStat {
  monthKey: string; // e.g. "Jan 2024"
  dateLabel: string;
  totalViews: number;
  uniqueVisitors: number;
  memberViews: number;
  guestViews: number;
}

export interface VisitorSession {
  id: string;
  startedAt: string;
  lastSeenAt: string;
  durationSeconds: number;
  pageViews: number;
  userType: "member" | "guest";
  userEmail?: string;
  userName?: string;
  location: string;
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  entryPath: string;
  lastPath: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  memberViews: number;
  guestViews: number;
  topLocation: string;
  activeNow: number;
  pageStats: PageVisitStat[];
  locationStats: VisitorLocationStat[];
  monthlyTrends: MonthTrendStat[];
  deviceBreakdown: { device: string; count: number }[];
  recentLogs: ActivityLog[];
  sessions: VisitorSession[];
  totalSessions: number;
  avgSessionSeconds: number;
  totalTimeSeconds: number;
  avgPagesPerSession: number;
}

const STORAGE_KEY_LOGS = "hon_analytics_logs_v2";
const STORAGE_KEY_HITS = "hon_analytics_hits_v2";
const STORAGE_KEY_LOC = "hon_analytics_cached_location";
const STORAGE_KEY_SESSIONS = "hon_analytics_sessions_v1";
const SESSION_ID_KEY = "hon_analytics_active_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function readStoredSessions(): VisitorSession[] {
  const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as VisitorSession[];
  } catch {
    return [];
  }
}

function writeSessions(sessions: VisitorSession[]) {
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 500)));
}

/** Creates or continues the current visitor session and records elapsed time on site. */
export function touchSession(
  path: string,
  isPageView: boolean,
  userEmail?: string,
  userName?: string
): VisitorSession | null {
  try {
    const now = Date.now();
    const sessions = readStoredSessions();
    const activeId = sessionStorage.getItem(SESSION_ID_KEY);
    let current = activeId ? sessions.find((s) => s.id === activeId) : undefined;

    if (current && now - new Date(current.lastSeenAt).getTime() > SESSION_IDLE_MS) {
      current = undefined;
    }

    const locInfo = detectLocationFromTimezone();
    const isMember = Boolean(userEmail || localStorage.getItem("hon-google-user"));

    if (!current) {
      current = {
        id: "ses_" + now + "_" + Math.random().toString(36).substring(2, 7),
        startedAt: new Date(now).toISOString(),
        lastSeenAt: new Date(now).toISOString(),
        durationSeconds: 0,
        pageViews: isPageView ? 1 : 0,
        userType: isMember ? "member" : "guest",
        location: locInfo.location,
        device: detectDevice(),
        browser: detectBrowser(),
        entryPath: path || "/",
        lastPath: path || "/",
      };
      sessionStorage.setItem(SESSION_ID_KEY, current.id);
      writeSessions([current, ...sessions]);
      return current;
    }

    const elapsed = Math.min((now - new Date(current.lastSeenAt).getTime()) / 1000, 120);
    current.durationSeconds = Math.round(current.durationSeconds + elapsed);
    current.lastSeenAt = new Date(now).toISOString();
    current.lastPath = path || current.lastPath;
    if (isPageView) current.pageViews += 1;
    if (isMember) current.userType = "member";

    writeSessions([current, ...sessions.filter((s) => s.id !== current!.id)]);
    return current;
  } catch {
    return null;
  }
}

// Multi-provider IP location fetcher for resilient background location detection
async function fetchRealIpLocation(): Promise<{ country: string; city: string; location: string } | null> {
  const providers = [
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data && data.success) {
        const city = data.city || data.region || "India";
        const country = data.country || "India";
        return { country, city, location: `${city}, ${country}` };
      }
      return null;
    },
    async () => {
      const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data && data.cityName) {
        const city = data.cityName || "India";
        const country = data.countryName || "India";
        return { country, city, location: `${city}, ${country}` };
      }
      return null;
    },
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3500) });
      const data = await res.json();
      if (data && data.country_name) {
        const city = data.city || "India";
        const country = data.country_name || "India";
        return { country, city, location: `${city}, ${country}` };
      }
      return null;
    }
  ];

  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) return result;
    } catch {
      // try next provider
    }
  }
  return null;
}

// Location detector using local cache, background IP lookup, and timezone fallback
function detectLocationFromTimezone(): { country: string; city: string; location: string } {
  const cached = localStorage.getItem(STORAGE_KEY_LOC);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore invalid cache
    }
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  let country = "India";
  let city = "India";

  if (tz.includes("Kolkata") || tz.includes("Asia/Calcutta")) {
    country = "India";
    city = "India"; // Generic fallback while background IP lookup finishes
  } else if (tz.includes("Dubai") || tz.includes("Muscat")) {
    country = "United Arab Emirates";
    city = "Dubai";
  } else if (tz.includes("London") || tz.includes("Europe/London")) {
    country = "United Kingdom";
    city = "London";
  } else if (tz.includes("New_York") || tz.includes("America")) {
    country = "United States";
    city = "New York";
  } else if (tz.includes("Singapore")) {
    country = "Singapore";
    city = "Singapore";
  }

  const loc = { country, city, location: city === country ? country : `${city}, ${country}` };
  localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(loc));

  return loc;
}

/** Requests high-accuracy HTML5 browser GPS location and performs reverse geocoding */
export async function requestExactGPSLocation(): Promise<{ country: string; city: string; location: string; exactAddress?: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict;
            const city = addr.city || addr.town || addr.village || addr.county || "India";
            const country = addr.country || "India";
            const cityName = suburb ? `${suburb}, ${city}` : city;
            const loc = {
              country,
              city: cityName,
              location: `${cityName}, ${country}`,
              exactAddress: data.display_name
            };
            localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(loc));
            resolve(loc);
            return;
          }
        } catch {
          // ignore reverse geocoding errors
        }
        resolve(null);
      },
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

function detectDevice(): "Desktop" | "Mobile" | "Tablet" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Other Browser";
}

export function readStoredHits(): PageHit[] {
  const raw = localStorage.getItem(STORAGE_KEY_HITS);
  if (!raw) {
    const locInfo = detectLocationFromTimezone();
    const initialHit: PageHit = {
      id: "hit_init_" + Date.now(),
      path: "/",
      title: "House of Nuts Storefront",
      timestamp: new Date().toISOString(),
      userType: "guest",
      location: locInfo.location,
      country: locInfo.country,
      city: locInfo.city,
      device: detectDevice(),
      browser: detectBrowser(),
    };
    localStorage.setItem(STORAGE_KEY_HITS, JSON.stringify([initialHit]));
    return [initialHit];
  }
  try {
    return JSON.parse(raw) as PageHit[];
  } catch {
    return [];
  }
}

export function readStoredLogs(): ActivityLog[] {
  const raw = localStorage.getItem(STORAGE_KEY_LOGS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ActivityLog[];
  } catch {
    return [];
  }
}

export function trackPageView(path: string, title?: string, userEmail?: string): void {
  try {
    const hits = readStoredHits();
    const locInfo = detectLocationFromTimezone();
    const isMember = Boolean(userEmail || localStorage.getItem("hon-google-user"));

    const newHit: PageHit = {
      id: "hit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      path: path || "/",
      title: title || document.title || "House of Nuts Storefront",
      timestamp: new Date().toISOString(),
      userType: isMember ? "member" : "guest",
      location: locInfo.location,
      country: locInfo.country,
      city: locInfo.city,
      device: detectDevice(),
      browser: detectBrowser(),
    };

    // Keep up to 2,000 recent page hits in client storage
    const updated = [newHit, ...hits].slice(0, 2000);
    localStorage.setItem(STORAGE_KEY_HITS, JSON.stringify(updated));

    // Also record a silent activity log for route visit
    trackActivityLog(
      "Page Visit",
      `User viewed ${path} (${locInfo.location})`,
      "info",
      path,
      userEmail
    );
  } catch (e) {
    console.warn("Analytics tracking error:", e);
  }
}

export function trackActivityLog(
  action: string,
  details: string,
  level: ActivityLog["level"] = "info",
  path?: string,
  userEmail?: string
): void {
  try {
    const logs = readStoredLogs();
    const locInfo = detectLocationFromTimezone();
    const googleUser = localStorage.getItem("hon-google-user");
    let name = "Guest Visitor";

    if (googleUser) {
      try {
        const u = JSON.parse(googleUser);
        name = u.name || u.email || "Registered Member";
        if (!userEmail) userEmail = u.email;
      } catch {
        // ignore
      }
    }

    const newLog: ActivityLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      action,
      details,
      level,
      path: path || window.location.pathname,
      userEmail: userEmail || undefined,
      userName: name,
      location: locInfo.location,
      device: detectDevice(),
    };

    const updated = [newLog, ...logs].slice(0, 1000);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.warn("Activity log error:", e);
  }
}

// Aggregates actual tracked hits per month key (YYYY-MM) over past 30 months
function generateHistorical30MonthsTrend(actualHits: PageHit[]): MonthTrendStat[] {
  const months: MonthTrendStat[] = [];
  const now = new Date();

  const actualHitsByMonth: Record<string, { total: number; members: number; guests: number; users: Set<string> }> = {};
  actualHits.forEach((h) => {
    const d = new Date(h.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!actualHitsByMonth[key]) actualHitsByMonth[key] = { total: 0, members: 0, guests: 0, users: new Set() };
    actualHitsByMonth[key].total += 1;
    actualHitsByMonth[key].users.add(h.userEmail || (h.city + "_" + h.device));
    if (h.userType === "member") actualHitsByMonth[key].members += 1;
    else actualHitsByMonth[key].guests += 1;
  });

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const actual = actualHitsByMonth[key];
    const totalViews = actual ? actual.total : 0;
    const memberViews = actual ? actual.members : 0;
    const guestViews = actual ? actual.guests : 0;
    const uniqueVisitors = actual ? actual.users.size : 0;

    months.push({
      monthKey: dateLabel,
      dateLabel,
      totalViews,
      uniqueVisitors,
      memberViews,
      guestViews,
    });
  }

  return months;
}

export function getAnalyticsSummary(range: DateRangeFilter): AnalyticsSummary {
  const hits = readStoredHits();
  const logs = readStoredLogs();

  const now = Date.now();
  let timeLimitMs = Infinity;

  if (range === "24h") timeLimitMs = 24 * 60 * 60 * 1000;
  else if (range === "7d") timeLimitMs = 7 * 24 * 60 * 60 * 1000;
  else if (range === "30d") timeLimitMs = 30 * 24 * 60 * 60 * 1000;
  else if (range === "12m") timeLimitMs = 365 * 24 * 60 * 60 * 1000;
  else if (range === "30m") timeLimitMs = 900 * 24 * 60 * 60 * 1000;

  const filteredHits = hits.filter((h) => now - new Date(h.timestamp).getTime() <= timeLimitMs);

  const totalViews = filteredHits.length;
  const memberViews = filteredHits.filter((h) => h.userType === "member").length;
  const guestViews = totalViews - memberViews;
  const uniqueVisitors = new Set(filteredHits.map((h) => h.userEmail || (h.city + "_" + h.device))).size;

  // Page breakdown aggregation
  const pageMap: Record<string, { title: string; views: number; members: number; users: Set<string> }> = {};

  filteredHits.forEach((h) => {
    if (!pageMap[h.path]) {
      pageMap[h.path] = { title: h.title || h.path, views: 0, members: 0, users: new Set() };
    }
    pageMap[h.path].views += 1;
    pageMap[h.path].users.add(h.userEmail || (h.city + "_" + h.device));
    if (h.userType === "member") pageMap[h.path].members += 1;
  });

  const pageStats: PageVisitStat[] = Object.entries(pageMap)
    .map(([path, data]) => ({
      path,
      title: data.title,
      views: data.views,
      uniqueVisitors: data.users.size,
      membersViews: data.members,
    }))
    .sort((a, b) => b.views - a.views);

  // Location statistics aggregation
  const locMap: Record<string, { country: string; city: string; count: number; members: number; guests: number }> = {};

  filteredHits.forEach((h) => {
    const locKey = `${h.city}, ${h.country}`;
    if (!locMap[locKey]) {
      locMap[locKey] = { country: h.country, city: h.city, count: 0, members: 0, guests: 0 };
    }
    locMap[locKey].count += 1;
    if (h.userType === "member") locMap[locKey].members += 1;
    else locMap[locKey].guests += 1;
  });

  const locationStats: VisitorLocationStat[] = Object.values(locMap)
    .map((l) => ({
      country: l.country,
      city: l.city,
      count: l.count,
      membersCount: l.members,
      guestsCount: l.guests,
      flagEmoji: getCountryFlag(l.country),
    }))
    .sort((a, b) => b.count - a.count);

  const topLocation = locationStats[0] ? `${locationStats[0].city}, ${locationStats[0].country}` : "Proddatur, India";

  // Device Breakdown
  const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };
  filteredHits.forEach((h) => {
    if (deviceCounts[h.device] !== undefined) deviceCounts[h.device] += 1;
  });

  const deviceBreakdown = [
    { device: "Mobile", count: deviceCounts.Mobile },
    { device: "Desktop", count: deviceCounts.Desktop },
    { device: "Tablet", count: deviceCounts.Tablet },
  ];

  const monthlyTrends = generateHistorical30MonthsTrend(hits);

  // Session / time-on-site aggregation
  const allSessions = readStoredSessions();
  const filteredSessions = allSessions.filter(
    (s) => now - new Date(s.startedAt).getTime() <= timeLimitMs
  );
  const totalTimeSeconds = filteredSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalSessions = filteredSessions.length;
  const avgSessionSeconds = totalSessions ? Math.round(totalTimeSeconds / totalSessions) : 0;
  const avgPagesPerSession = totalSessions
    ? Math.round(
        (filteredSessions.reduce((sum, s) => sum + (s.pageViews || 0), 0) / totalSessions) * 10
      ) / 10
    : 0;
  const sessions = [...filteredSessions].sort(
    (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
  );

  // Active right now calculation (hits within last 15 minutes)
  const fifteenMinsAgo = now - 15 * 60 * 1000;
  const activeNowCount = hits.filter((h) => new Date(h.timestamp).getTime() >= fifteenMinsAgo).length;

  return {
    totalViews,
    uniqueVisitors,
    memberViews,
    guestViews,
    topLocation,
    activeNow: activeNowCount,
    pageStats,
    locationStats,
    monthlyTrends,
    deviceBreakdown,
    recentLogs: logs.slice(0, 100),
    sessions,
    totalSessions,
    avgSessionSeconds,
    totalTimeSeconds,
    avgPagesPerSession,
  };
}

function getCountryFlag(country: string): string {
  if (country.includes("India")) return "🇮🇳";
  if (country.includes("United Arab Emirates") || country.includes("UAE")) return "🇦🇪";
  if (country.includes("United Kingdom") || country.includes("UK")) return "🇬🇧";
  if (country.includes("United States") || country.includes("USA")) return "🇺🇸";
  if (country.includes("Singapore")) return "🇸🇬";
  if (country.includes("Canada")) return "🇨🇦";
  if (country.includes("Australia")) return "🇦🇺";
  return "🌐";
}

export function exportSessionsToCsv(): void {
  const sessions = readStoredSessions();
  const csvRows = [
    ["Session ID", "Started", "Last Seen", "Time On Site (s)", "Time On Site", "Page Views", "Visitor Type", "Email", "Name", "Location", "Device", "Browser", "Entry Page", "Last Page"],
    ...sessions.map((s) => [
      s.id,
      s.startedAt,
      s.lastSeenAt,
      String(s.durationSeconds),
      formatDuration(s.durationSeconds),
      String(s.pageViews),
      s.userType,
      s.userEmail || "",
      s.userName || "",
      s.location || "",
      s.device,
      s.browser,
      s.entryPath,
      s.lastPath,
    ]),
  ].join("\n");

  downloadCsv(`houseofnuts-visitor-sessions-${new Date().toISOString().slice(0, 10)}.csv`, csvRows);
}

export function exportAnalyticsLogsToCsv(): void {
  const logs = readStoredLogs();
  if (logs.length === 0) {
    logs.push({
      id: "log_sample",
      timestamp: new Date().toISOString(),
      action: "Export Logs",
      details: "Admin initiated analytics log export",
      level: "info",
      path: "/admin/analytics",
      userName: "Admin User",
      location: "Mumbai, India",
    });
  }

  const csvRows = [
    ["ID", "Timestamp", "Action", "Level", "Details", "User Name", "User Email", "Location", "Device", "Path"],
    ...logs.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      l.level,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      l.userName || "Guest",
      l.userEmail || "",
      l.location || "",
      l.device || "",
      l.path || "",
    ]),
  ].join("\n");

  downloadCsv(`houseofnuts-analytics-logs-${new Date().toISOString().slice(0, 10)}.csv`, csvRows);
}

export const CONSENT_KEY = "hon_analytics_consent";

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "granted";
}

export function setAnalyticsConsent(granted: boolean): void {
  localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  if (!granted) {
    clearAnalyticsData();
  }
}

export function clearAnalyticsData(): void {
  localStorage.removeItem(STORAGE_KEY_LOGS);
  localStorage.removeItem(STORAGE_KEY_HITS);
  localStorage.removeItem(STORAGE_KEY_LOC);
  localStorage.removeItem(STORAGE_KEY_SESSIONS);
  sessionStorage.removeItem(SESSION_ID_KEY);
}
