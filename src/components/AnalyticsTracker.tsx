import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, touchSession } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function AnalyticsTracker() {
  const location = useLocation();
  const { isGoogleAuthenticated } = useAuth();

  useEffect(() => {
    // Only track privacy-preserving pseudonymous pageview/session telemetry without PII
    trackPageView(location.pathname, document.title, isGoogleAuthenticated);
    touchSession(location.pathname, true, isGoogleAuthenticated);
  }, [location.pathname, isGoogleAuthenticated]);

  // Heartbeat so time-on-site is measured while the visitor stays on a page
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        touchSession(window.location.pathname, false, isGoogleAuthenticated);
      }
    };
    const timer = window.setInterval(beat, 15000);
    window.addEventListener("visibilitychange", beat);
    window.addEventListener("beforeunload", beat);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("visibilitychange", beat);
      window.removeEventListener("beforeunload", beat);
    };
  }, [isGoogleAuthenticated]);

  return null; // Silent background component with 0 visual output on storefront
}

export default AnalyticsTracker;
