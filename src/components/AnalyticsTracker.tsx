import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function AnalyticsTracker() {
  const location = useLocation();
  const { googleUser } = useAuth();

  useEffect(() => {
    // Only track visitor/pageview analytics silently in the background
    trackPageView(location.pathname, document.title, googleUser?.email);
  }, [location.pathname, googleUser]);

  return null; // Silent background component with 0 visual output on storefront
}

export default AnalyticsTracker;
