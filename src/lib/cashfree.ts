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

export const CASHFREE_MODE: "sandbox" | "production" =
  (import.meta.env.VITE_CASHFREE_MODE as "sandbox" | "production") || "sandbox";

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
  try {
    const response = await apiPost<CreateCashfreeOrderResponse>("createCashfreeOrder", {
      orderId: params.orderId,
      orderAmount: params.orderAmount,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      notifyUrl:
        params.notifyUrl ||
        "https://script.google.com/macros/s/AKfycbzOt0eUwPlTbge4ZdzfvkJd3sxmDwG-2J9vqt3JAjV79agTJV9ZGgX4YRzFVpSa2P0/exec",
    });
    return response;
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
    onFailure?.("Cashfree SDK failed to load. Please check your internet connection and refresh.");
    return false;
  }

  try {
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_modal",
    });

    if (result.error) {
      onFailure?.(result.error.message || "Payment was not completed.");
      return false;
    }

    if (result.redirect) {
      return true;
    }

    if (result.paymentDetails) {
      onSuccess?.({ cfPaymentId: result.paymentDetails.cfPaymentId });
      return true;
    }

    return false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred during Cashfree payment.";
    onFailure?.(msg);
    return false;
  }
};
