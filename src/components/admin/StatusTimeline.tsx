import { Check, Circle, X } from "lucide-react";
import type { Order } from "@/lib/orders";

const steps: Order["status"][] = ["pending", "confirmed", "shipped", "delivered"];
const labels: Record<Order["status"], string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const StatusTimeline = ({ status }: { status: Order["status"] }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 border border-status-cancelled/30 bg-status-cancelled/10 rounded-sm">
        <X size={16} className="text-status-cancelled" />
        <span className="font-body text-sm text-status-cancelled font-medium">Order cancelled</span>
      </div>
    );
  }
  const currentIdx = steps.indexOf(status);
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex-1 flex flex-col items-center relative">
            <div
              className={`size-8 rounded-full grid place-items-center border-2 z-10 bg-background transition-colors ${
                done
                  ? "border-status-delivered bg-status-delivered text-status-delivered-foreground"
                  : "border-border text-muted-foreground"
              } ${active ? "ring-2 ring-status-delivered/30" : ""}`}
            >
              {done ? <Check size={14} /> : <Circle size={10} />}
            </div>
            <div className={`text-[10px] uppercase tracking-wider mt-2 font-body ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {labels[s]}
            </div>
            {i < steps.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentIdx ? "bg-status-delivered" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
