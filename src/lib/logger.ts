export interface LogEntry {
  id: string;
  timestamp: string;
  category: "cashfree" | "order" | "auth" | "inventory" | "system";
  level: "info" | "warn" | "error";
  message: string;
  payload?: unknown;
}

const STORAGE_KEY = "hon_system_logs";
const MAX_LOGS = 200;

export function getSystemLogs(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

export function logEvent(
  category: LogEntry["category"],
  level: LogEntry["level"],
  message: string,
  payload?: unknown
): LogEntry {
  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    category,
    level,
    message,
    payload,
  };

  try {
    const current = getSystemLogs();
    const updated = [entry, ...current].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  // Always output to browser developer console
  const consolePrefix = `[HON LOG - ${category.toUpperCase()}]`;
  if (level === "error") console.error(consolePrefix, message, payload ?? "");
  else if (level === "warn") console.warn(consolePrefix, message, payload ?? "");
  else console.log(consolePrefix, message, payload ?? "");

  return entry;
}

export function clearSystemLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
