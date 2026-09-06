import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, touchSession } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function AnalyticsTracker() {
  const location = useLocation();
  const { googleUser } = useAuth();

  useEffect(() => {
    // Only track visitor/pageview analytics silently in the background
    trackPageView(location.pathname, document.title, googleUser?.email);
    touchSession(location.pathname, true, googleUser?.email, googleUser?.name);
  }, [location.pathname, googleUser]);

  // Heartbeat so time-on-site is measured while the visitor stays on a page
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        touchSession(window.location.pathname, false, googleUser?.email, googleUser?.name);
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
  }, [googleUser]);

  return null; // Silent background component with 0 visual output on storefront
}

export default AnalyticsTracker;
