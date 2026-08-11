import { describe, it, expect } from "vitest";
import { stockOf, isOutOfStock, isLowStock, StockMap } from "@/lib/inventory";

describe("Inventory Stock Calculation Helpers", () => {
  const stockMap: StockMap = {
    "mamra-250": 10,
    "mamra-500": 3,
    "mamra-1kg": 0,
  };

  it("should correctly identify stock quantities", () => {
    expect(stockOf(stockMap, "mamra-250")).toBe(10);
    expect(stockOf(stockMap, "mamra-500")).toBe(3);
    expect(stockOf(stockMap, "mamra-1kg")).toBe(0);
    expect(stockOf(stockMap, "untracked-variant")).toBeNull();
  });

  it("should identify out-of-stock items", () => {
    expect(isOutOfStock(stockMap, "mamra-1kg")).toBe(true);
    expect(isOutOfStock(stockMap, "mamra-250")).toBe(false);
    expect(isOutOfStock(stockMap, "untracked-variant")).toBe(false);
  });

  it("should identify low-stock items (stock <= 5 and > 0)", () => {
    expect(isLowStock(stockMap, "mamra-500")).toBe(true);
    expect(isLowStock(stockMap, "mamra-250")).toBe(false);
    expect(isLowStock(stockMap, "mamra-1kg")).toBe(false);
  });
});
