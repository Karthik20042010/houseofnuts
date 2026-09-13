import { apiPost } from "./api";
import { logEvent } from "./logger";

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_modal" | "_self" | "_top" | "_blank";
      }) => Promise<{
        error?: { message: string; code?: string };
        redirect?: boolean;
        paymentDetails?: {
          paymentMessage?: string;
          paymentStatus?: string;
          cfPaymentId?: string;
        };
      }>;
    };
  }
}

export const CASHFREE_APP_ID =
  (import.meta.env.CASHFREE_APP_ID as string) ||
  (import.meta.env.VITE_CASHFREE_APP_ID as string) ||
  "141222992671a6448dce6df4eec9222141";

export const CASHFREE_MODE: "sandbox" | "production" =
  ((import.meta.env.CASHFREE_MODE || import.meta.env.VITE_CASHFREE_MODE) as "sandbox" | "production") ||
  "production";

let cashfreeInstance: ReturnType<NonNullable<Window["Cashfree"]>> | null = null;

export const getCashfree = () => {
  if (typeof window === "undefined" || !window.Cashfree) {
    return null;
  }
  if (!cashfreeInstance) {
    cashfreeInstance = window.Cashfree({ mode: CASHFREE_MODE });
  }
  return cashfreeInstance;
};

export interface CreateCashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notifyUrl?: string;
}

export interface CreateCashfreeOrderResponse {
  ok: boolean;
  paymentSessionId?: string;
  cfOrderId?: string;
  error?: string;
}

export async function createCashfreeOrderSession(
  params: CreateCashfreeOrderParams
): Promise<CreateCashfreeOrderResponse> {
  logEvent("cashfree", "info", `Initiating session creation for Order #${params.orderId} (₹${params.orderAmount})`, params);
  try {
    const backendRes = await apiPost<CreateCashfreeOrderResponse>("createCashfreeOrder", {
      orderId: params.orderId,
      orderAmount: params.orderAmount,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      notifyUrl:
        params.notifyUrl ||
        "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec",
    });

    if (backendRes && backendRes.ok && backendRes.paymentSessionId) {
      logEvent("cashfree", "info", `Session created successfully for Order #${params.orderId}`, {
        paymentSessionId: backendRes.paymentSessionId,
        cfOrderId: backendRes.cfOrderId,
      });
      return backendRes;
    }

    if (backendRes && !backendRes.ok) {
      const errorMsg = backendRes.error || "Failed to create Cashfree payment session via backend.";
      logEvent("cashfree", "error", `Session creation rejected for Order #${params.orderId}: ${errorMsg}`, backendRes);
      return {
        ok: false,
        error: errorMsg,
      };
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    logEvent("cashfree", "error", `Session creation network exception for Order #${params.orderId}: ${errMsg}`, e);
    return {
      ok: false,
      error: "Unable to reach Google Apps Script backend. Please verify your internet connection and backend deployment.",
    };
  }

  logEvent("cashfree", "error", `Session creation returned empty result for Order #${params.orderId}`);
  return {
    ok: false,
    error: "Failed to generate Cashfree payment session.",
  };
}

export interface TriggerCashfreePaymentOptions {
  paymentSessionId: string;
  orderId?: string;
  onSuccess?: (details?: { cfPaymentId?: string }) => void;
  onFailure?: (errorMsg: string) => void;
}

export const triggerCashfreeCheckout = async ({
  paymentSessionId,
  orderId = "UNKNOWN",
  onSuccess,
  onFailure,
}: TriggerCashfreePaymentOptions): Promise<boolean> => {
  logEvent("cashfree", "info", `Opening Cashfree Checkout Modal for Order #${orderId}`, { paymentSessionId });
  const cashfree = getCashfree();
  if (!cashfree) {
    const msg = "Cashfree SDK failed to load. Please refresh the page and try again.";
    logEvent("cashfree", "error", msg);
    onFailure?.(msg);
    return false;
  }

  try {
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.error) {
      const msg = result.error.message || "Payment was cancelled or not completed.";
      logEvent("cashfree", "warn", `Checkout Modal closed or errored for Order #${orderId}: ${msg}`, result.error);
      onFailure?.(msg);
      return false;
    }

    if (result.redirect) {
      logEvent("cashfree", "info", `Redirecting for Order #${orderId}`);
      return true;
    }

    if (result.paymentDetails) {
      logEvent("cashfree", "info", `Payment successful for Order #${orderId}`, result.paymentDetails);
      onSuccess?.({ cfPaymentId: result.paymentDetails.cfPaymentId });
      return true;
    }

    logEvent("cashfree", "info", `Modal closed for Order #${orderId}`);
    return true;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logEvent("cashfree", "error", `Cashfree SDK Exception for Order #${orderId}: ${errMsg}`, err);
    onFailure?.(errMsg);
    return false;
  }
};
