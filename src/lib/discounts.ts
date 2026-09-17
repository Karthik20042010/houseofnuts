export interface DiscountCode {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  description: string;
  active: boolean;
}

export const discountCodes: DiscountCode[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minOrder: 0,
    description: "10% off your first order",
    active: true,
  },
  {
    code: "BULK15",
    type: "percent",
    value: 15,
    minOrder: 0,
    description: "15% off on 3+ items",
    active: true,
  },
  {
    code: "FLAT100",
    type: "flat",
    value: 100,
    minOrder: 500,
    description: "₹100 off on orders above ₹500",
    active: true,
  },
  {
    code: "NUTS20",
    type: "percent",
    value: 20,
    minOrder: 1000,
    description: "20% off on orders above ₹1000",
    active: true,
  },
];

export function validateDiscount(
  code: string,
  subtotal: number,
  itemCount: number,
  isFirstOrder: boolean = true
): { valid: boolean; discount?: DiscountCode; error?: string } {
  const upper = code.trim().toUpperCase();
  const found = discountCodes.find((d) => d.code === upper && d.active);

  if (!found) return { valid: false, error: "Invalid discount code" };

  if (found.code === "WELCOME10" && !isFirstOrder) {
    return { valid: false, error: "WELCOME10 is strictly valid on your first order only" };
  }

  if (found.code === "BULK15" && itemCount < 3) {
    return { valid: false, error: "Add at least 3 items to use this code" };
  }

  if (subtotal < found.minOrder) {
    return { valid: false, error: `Minimum order ₹${found.minOrder} required` };
  }

  return { valid: true, discount: found };
}

export function calcDiscount(discount: DiscountCode, subtotal: number): number {
  if (discount.type === "percent") {
    return Math.round(subtotal * (discount.value / 100));
  }
  return discount.value;
}
