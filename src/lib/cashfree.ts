import { apiPost } from "./api";

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
  (import.meta.env.VITE_CASHFREE_APP_ID as string) ||
  (import.meta.env.CASHFREE_APP_ID as string) ||
  "";

export const CASHFREE_SECRET_KEY =
  (import.meta.env.VITE_CASHFREE_SECRET_KEY as string) ||
  (import.meta.env.CASHFREE_SECRET_KEY as string) ||
  "";

export const CASHFREE_MODE: "sandbox" | "production" =
  ((import.meta.env.VITE_CASHFREE_MODE || import.meta.env.CASHFREE_MODE) as "sandbox" | "production") ||
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
  // 1. Try Backend Order Session endpoint first
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
      return backendRes;
    }
  } catch (e) {
    console.warn("Backend createCashfreeOrder notice, checking frontend environment keys:", e);
  }

  // 2. Strict check: verify environment credentials exist before calling Cashfree PG API
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    return {
      ok: false,
      error: "Cashfree API credentials missing. Please set VITE_CASHFREE_APP_ID and VITE_CASHFREE_SECRET_KEY in your .env file.",
    };
  }

  // 3. Direct Cashfree PG Order API Session call with environment variables
  try {
    const cleanPhone = (params.customerPhone || "9652526920").replace(/\D/g, "").slice(-10) || "9652526920";
    const endpoint =
      CASHFREE_MODE === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: params.orderId,
        order_amount: params.orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: `CUST_${cleanPhone}`,
          customer_name: params.customerName || "House of Nuts Customer",
          customer_email: params.customerEmail || "houseofnutsproddatur@gmail.com",
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: `${window.location.origin}/orders?order_id={order_id}`,
          notify_url:
            params.notifyUrl ||
            "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec",
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data && data.payment_session_id) {
      return {
        ok: true,
        paymentSessionId: data.payment_session_id,
        cfOrderId: String(data.cf_order_id || params.orderId),
      };
    } else {
      console.error("Cashfree API Order Error:", data);
      return {
        ok: false,
        error: data.message || "Failed to generate Cashfree payment session.",
      };
    }
  } catch (err) {
    console.error("Failed to create Cashfree order session:", err);
    return { ok: false, error: "Network error initiating Cashfree payment session." };
  }
}

export interface TriggerCashfreePaymentOptions {
  paymentSessionId: string;
  orderId: string;
  onSuccess?: (details?: { cfPaymentId?: string }) => void;
  onFailure?: (errorMsg: string) => void;
}

export const triggerCashfreeCheckout = async ({
  paymentSessionId,
  onSuccess,
  onFailure,
}: TriggerCashfreePaymentOptions): Promise<boolean> => {
  const cashfree = getCashfree();
  if (!cashfree) {
    onFailure?.("Cashfree SDK failed to load. Please refresh the page and try again.");
    return false;
  }

  try {
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.error) {
      onFailure?.(result.error.message || "Payment was cancelled or not completed.");
      return false;
    }

    if (result.redirect) {
      return true;
    }

    if (result.paymentDetails) {
      onSuccess?.({ cfPaymentId: result.paymentDetails.cfPaymentId });
      return true;
    }

    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred during Cashfree payment.";
    onFailure?.(msg);
    return false;
  }
};
