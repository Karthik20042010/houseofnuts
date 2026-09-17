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

const SENSITIVE_KEYS = [
  "password", "pass", "secret", "secretkey", "appid", "clientsecret",
  "token", "auth", "authorization", "drivefolderid", "parentfolderid",
  "folderid", "cvv", "creditcard", "cardnumber", "pin"
];

function sanitizeLogPayload(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") {
    if (SENSITIVE_KEYS.some((k) => data.toLowerCase().includes(k))) return "[REDACTED]";
    return data;
  }
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogPayload(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (lowerKey.includes("email") && typeof value === "string") {
      const parts = value.split("@");
      sanitized[key] = parts.length === 2 ? `${parts[0].slice(0, 2)}***@${parts[1]}` : "[REDACTED_EMAIL]";
    } else if ((lowerKey.includes("phone") || lowerKey.includes("mobile")) && typeof value === "string") {
      sanitized[key] = value.length >= 10 ? `${value.slice(0, 2)}*****${value.slice(-3)}` : "[REDACTED_PHONE]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logEvent(
  category: LogEntry["category"],
  level: LogEntry["level"],
  message: string,
  payload?: unknown
): LogEntry {
  const sanitizedPayload = sanitizeLogPayload(payload);
  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    category,
    level,
    message,
    payload: sanitizedPayload,
  };

  try {
    const current = getSystemLogs();
    const updated = [entry, ...current].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  // Always output to browser developer console (only in non-production or for error logs)
  if (import.meta.env.DEV || level === "error") {
    const consolePrefix = `[HON LOG - ${category.toUpperCase()}]`;
    if (level === "error") console.error(consolePrefix, message, sanitizedPayload ?? "");
    else if (level === "warn") console.warn(consolePrefix, message, sanitizedPayload ?? "");
    else console.log(consolePrefix, message, sanitizedPayload ?? "");
  }

  return entry;
}

export function clearSystemLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
