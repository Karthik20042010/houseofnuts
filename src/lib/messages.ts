import { apiPost } from "./api";
import { readSession } from "./admin";

export type MessageStatus = "new" | "read" | "replied" | "archived";

export interface CustomerMessage {
  id: string;
  timestamp: string;
  type: string; // "enquiry" | "wholesale" | "support"
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  adminNote: string;
}

// Public: a shopper sends a message from the storefront.
export async function submitMessage(input: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  type?: string;
}): Promise<void> {
  const res = await apiPost<{ ok: boolean; error?: string }>("submitMessage", {
    type: input.type || "enquiry",
    ...input,
  });
  if (!res.ok) throw new Error(res.error || "Could not send your message");
}

function requirePassword(): string {
  const s = readSession();
  if (!s) throw new Error("Not logged in");
  return s.password;
}

export async function adminFetchMessages(): Promise<CustomerMessage[]> {
  const password = requirePassword();
  const res = await apiPost<{ ok: boolean; messages?: CustomerMessage[]; error?: string }>(
    "getMessages",
    { password },
  );
  if (!res.ok) throw new Error(res.error || "Failed to load messages");
  return res.messages || [];
}

export async function adminUpdateMessage(
  messageId: string,
  updates: { status?: MessageStatus; adminNote?: string },
): Promise<void> {
  const password = requirePassword();
  const res = await apiPost<{ ok: boolean; error?: string }>("updateMessage", {
    password,
    messageId,
    ...updates,
  });
  if (!res.ok) throw new Error(res.error || "Update failed");
}
