import { describe, it, expect } from "vitest";
import { validateDiscount, calcDiscount, discountCodes } from "@/lib/discounts";

describe("Discount & Promo Code System", () => {
  it("should validate active promo codes", () => {
    const welcomeRes = validateDiscount("WELCOME10", 1000, 2);
    expect(welcomeRes.valid).toBe(true);
    expect(welcomeRes.discount?.code).toBe("WELCOME10");

    const invalidRes = validateDiscount("INVALIDCODE", 1000, 2);
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.error).toBe("Invalid discount code");
  });

  it("should enforce minimum order threshold", () => {
    const res = validateDiscount("NUTS20", 500, 2);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Minimum order");
  });

  it("should enforce bulk item count requirement", () => {
    const res = validateDiscount("BULK15", 1000, 1);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Add at least 3 items");
  });

  it("should enforce WELCOME10 strictly for first-time orders", () => {
    const validWelcome = validateDiscount("WELCOME10", 1000, 2, true);
    expect(validWelcome.valid).toBe(true);

    const rejectedWelcome = validateDiscount("WELCOME10", 1000, 2, false);
    expect(rejectedWelcome.valid).toBe(false);
    expect(rejectedWelcome.error).toContain("first order only");
  });

  it("should correctly calculate percentage and flat discounts", () => {
    const welcomeCode = discountCodes.find((d) => d.code === "WELCOME10")!;
    expect(calcDiscount(welcomeCode, 2000)).toBe(200);

    const flatCode = discountCodes.find((d) => d.code === "FLAT100")!;
    expect(calcDiscount(flatCode, 3000)).toBe(100);
  });
});
