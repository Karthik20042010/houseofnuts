import { apiGet, apiPost, API_URL } from "./api";

export interface BackendHealthResponse {
  ok: boolean;
  timestamp?: string;
  service?: string;
  version?: string;
  sheets?: Record<string, { exists: boolean; rows: number }>;
  healthy?: boolean;
  error?: string;
}

/**
 * Check connectivity and sheet status of the Google Apps Script backend.
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  if (!API_URL) {
    return { ok: false, error: "API_URL not configured", healthy: false };
  }
  try {
    const res = await apiGet<BackendHealthResponse>("healthCheck");
    return res;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      healthy: false,
    };
  }
}

/**
 * Report client-side operational incidents (failed orders, payment gateway errors,
 * catalog sync conflicts) directly to the server AuditLogs.
 */
export async function reportOperationalError(
  context: string,
  error: unknown,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  if (!API_URL) {
    return false;
  }
  const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const details = JSON.stringify({
    error: errorMessage,
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    timestamp: new Date().toISOString(),
    ...metadata,
  });

  try {
    const res = await apiPost<{ ok: boolean; logged?: boolean }>("logIncident", {
      context,
      details,
      actor: metadata.actor || "storefront_client",
    });
    return Boolean(res && res.ok);
  } catch (loggingErr) {
    console.warn(`[Monitoring] Failed to record incident '${context}' to server:`, loggingErr);
    return false;
  }
}
