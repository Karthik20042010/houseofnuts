declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_modal" | "_self" | "_top" | "_blank";
      }) => Promise<{
        error?: { message: string; code?: string };
        redirect?: boolean;
        paymentDetails?: unknown;
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

export interface TriggerCashfreePaymentOptions {
  paymentSessionId: string;
  orderId: string;
  onSuccess?: () => void;
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
      onSuccess?.();
      return true;
    }

    return false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred during Cashfree payment.";
    onFailure?.(msg);
    return false;
  }
};
