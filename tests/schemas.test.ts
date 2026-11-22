import { describe, expect, it } from "vitest";
import { addDays, format } from "date-fns";
import { banquetSchema, checkoutSchema, lookupSchema, mobile, normaliseMobile, searchSchema } from "@/lib/schemas";
import { gstinChecksumOk, paise } from "@/lib/gstin";
import { paymentSchema } from "@/lib/admin-schemas";

const d = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

describe("public form validation", () => {
  it("accepts Indian mobiles with prefixes and rejects bad ones", () => {
    expect(normaliseMobile("+91 98765-43210")).toBe("9876543210");
    expect(mobile.safeParse("9876543210").success).toBe(true);
    expect(mobile.safeParse("1234567890").success).toBe(false);
  });

  it("validates a stay search", () => {
    expect(searchSchema.safeParse({ checkIn: d(3), checkOut: d(5), adults: 2, children: 0, rooms: 1 }).success).toBe(true);
    expect(searchSchema.safeParse({ checkIn: d(-2), checkOut: d(5), adults: 2, children: 0, rooms: 1 }).success).toBe(false);
    expect(searchSchema.safeParse({ checkIn: d(5), checkOut: d(5), adults: 2, children: 0, rooms: 1 }).success).toBe(false);
    expect(searchSchema.safeParse({ checkIn: d(3), checkOut: d(5), adults: 1, children: 0, rooms: 2 }).success).toBe(false);
  });

  it("requires terms and a company name when a GSTIN is given at checkout", () => {
    const base = { name: "Asha Rao", email: "asha@example.com", mobile: "9876543210", gstin: "", method: "online" as const };
    expect(checkoutSchema.safeParse({ ...base, terms: false }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, terms: true }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, terms: true, gstin: "09AABCR1234F1ZQ" }).success).toBe(false);
  });

  it("checks booking lookup and banquet size limits", () => {
    expect(lookupSchema.safeParse({ ref: "kph-20874", email: "a@b.co" }).success).toBe(true);
    expect(lookupSchema.safeParse({ ref: "bad", email: "a@b.co" }).success).toBe(false);
    const ok = { name: "Asha Rao", email: "a@b.co", mobile: "9876543210", eventType: "Wedding", date: d(30), guests: 150, hall: "grand" };
    expect(banquetSchema.safeParse(ok).success).toBe(true);
    expect(banquetSchema.safeParse({ ...ok, guests: 900 }).success).toBe(false);
  });
});

describe("staff form validation", () => {
  it("validates the GSTIN checksum", () => {
    expect(gstinChecksumOk("09AABCR1234F1ZQ")).toBe(true);
    expect(gstinChecksumOk("09AABCR1234F1ZX")).toBe(false);
    expect(paise(1050.5)).toBe(105050);
  });

  it("requires a transaction id for UPI and a 6-digit number for cheques", () => {
    expect(paymentSchema.safeParse({ method: "CASH", amount: 100 }).success).toBe(true);
    expect(paymentSchema.safeParse({ method: "UPI", amount: 100 }).success).toBe(false);
    expect(paymentSchema.safeParse({ method: "UPI", amount: 100, upiTransactionId: "T2026101400112233" }).success).toBe(true);
    expect(paymentSchema.safeParse({ method: "CHEQUE", amount: 100, chequeNumber: "12", chequeBank: "SBI", chequeDate: d(0) }).success).toBe(false);
  });
});
