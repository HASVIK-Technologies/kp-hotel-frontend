import { describe, expect, it } from "vitest";
import { fmtRange, inr, inrPaise, nightsBetween, plural } from "@/lib/format";

describe("format helpers", () => {
  it("formats rupees with Indian grouping", () => {
    expect(inr(2200)).toBe("₹2,200");
    expect(inr(1234567)).toBe("₹12,34,567");
  });

  it("formats paise, showing decimals only when needed", () => {
    expect(inrPaise(588000)).toBe("₹5,880");
    expect(inrPaise(150050)).toBe("₹1,500.50");
  });

  it("counts nights and guards bad input", () => {
    expect(nightsBetween("2026-11-10", "2026-11-12")).toBe(2);
    expect(nightsBetween("2026-11-12", "2026-11-10")).toBe(0);
    expect(nightsBetween(undefined, "2026-11-10")).toBe(0);
  });

  it("pluralises and formats ranges", () => {
    expect(plural(1, "Guest")).toBe("1 Guest");
    expect(plural(3, "night")).toBe("3 nights");
    expect(plural(2, "child", "children")).toBe("2 children");
    expect(fmtRange("2026-11-10", "2026-11-12")).toBe("10 Nov – 12 Nov 2026");
  });
});
