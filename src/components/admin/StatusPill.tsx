import type { Order } from "@/lib/orders";

const orderMap: Record<Order["status"], string> = {
  pending: "bg-status-pending/15 text-status-pending border border-status-pending/30",
  confirmed: "bg-status-confirmed/15 text-status-confirmed border border-status-confirmed/30",
  shipped: "bg-status-shipped/15 text-status-shipped border border-status-shipped/30",
  delivered: "bg-status-delivered/15 text-status-delivered border border-status-delivered/30",
  cancelled: "bg-status-cancelled/15 text-status-cancelled border border-status-cancelled/30",
};

const payMap: Record<Order["paymentStatus"], string> = {
  pending: "bg-status-pending/15 text-status-pending border border-status-pending/30",
  paid: "bg-status-paid/15 text-status-paid border border-status-paid/30",
  refunded: "bg-status-refunded/15 text-status-refunded border border-status-refunded/30",
};

export const StatusPill = ({ status }: { status: Order["status"] }) => (
  <span className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium font-body ${orderMap[status]}`}>
    {status}
  </span>
);

export const PaymentPill = ({ status }: { status: Order["paymentStatus"] }) => (
  <span className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium font-body ${payMap[status]}`}>
    {status}
  </span>
);
