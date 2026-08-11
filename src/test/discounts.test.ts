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

  it("should enforce minimum spend threshold", () => {
    const res = validateDiscount("HON500", 1000, 2);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Minimum spend");
  });

  it("should correctly calculate percentage and fixed discounts", () => {
    const welcomeCode = discountCodes.find((d) => d.code === "WELCOME10")!;
    expect(calcDiscount(welcomeCode, 2000)).toBe(200);

    const fixedCode = discountCodes.find((d) => d.code === "HON500")!;
    expect(calcDiscount(fixedCode, 3000)).toBe(500);
  });
});
