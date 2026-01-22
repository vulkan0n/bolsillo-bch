import { describe, it, expect } from "vitest";
import { numDecimalPlaces, truncateDecimals } from "./currency";

describe("numDecimalPlaces", () => {
  it("returns 0 for integer strings", () => {
    expect(numDecimalPlaces("123")).toBe(0);
    expect(numDecimalPlaces("0")).toBe(0);
  });

  it("returns correct count for decimal strings", () => {
    expect(numDecimalPlaces("1.5")).toBe(1);
    expect(numDecimalPlaces("1.23")).toBe(2);
    expect(numDecimalPlaces("0.12345678")).toBe(8);
  });

  it("handles trailing decimal point", () => {
    expect(numDecimalPlaces("1.")).toBe(0);
  });
});

describe("truncateDecimals", () => {
  it("truncates to specified decimal places", () => {
    expect(truncateDecimals("1.23456", 2)).toBe("1.23");
    expect(truncateDecimals("1.99999", 2)).toBe("1.99");
  });

  it("rounds down, not up", () => {
    expect(truncateDecimals("1.999", 2)).toBe("1.99");
    expect(truncateDecimals("1.996", 2)).toBe("1.99");
  });

  it("preserves fewer decimals than max", () => {
    expect(truncateDecimals("1.2", 4)).toBe("1.2");
    expect(truncateDecimals("1", 4)).toBe("1");
  });

  it("handles zero max decimals", () => {
    expect(truncateDecimals("1.99", 0)).toBe("1");
    expect(truncateDecimals("9.99", 0)).toBe("9");
  });

  it("handles empty or invalid input", () => {
    expect(truncateDecimals("", 2)).toBe("0");
    expect(truncateDecimals("abc", 2)).toBe("0");
  });
});
