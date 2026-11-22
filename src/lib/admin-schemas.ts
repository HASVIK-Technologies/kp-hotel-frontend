import { z } from "zod";
import { email, gstin, mobile, name, normaliseMobile, searchSchema } from "@/lib/schemas";
import { gstinChecksumOk } from "@/lib/gstin";

/**
 * Validation for the staff console forms. These mirror the backend DTOs (docs/API.md) for instant feedback;
 * the API is the source of truth and re-validates everything.
 */
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd");
const gstinChecked = gstin.refine((v) => v === "" || gstinChecksumOk(v), "This GSTIN failed the checksum, please re-check it");

const money = z
  .number()
  .positive("Must be greater than 0")
  .max(10_000_000)
  .refine((n) => Math.round(n * 100) / 100 === n, "Max 2 decimal places");

/* ----------------------------------------------------------------- bookings */
export const staffBookingSchema = z
  .object({
    roomSlug: z.string().min(1),
    checkIn: z.string(),
    checkOut: z.string(),
    rooms: z.number().int().min(1).max(5),
    adults: z.number().int().min(1).max(8),
    children: z.number().int().min(0).max(6),
    ratePlan: z.string().default("room-only"),
    addonIds: z.array(z.string()).max(8).default([]),
    promo: z.string().trim().max(20).optional().or(z.literal("")),
    source: z.enum(["Phone", "Walk-in", "OTA"]).default("Phone"),
    guest: z.object({
      name,
      email,
      mobile: mobile.transform(normaliseMobile),
      company: optionalText(120),
      gstin: gstinChecked,
      requests: optionalText(400),
    }),
  })
  .superRefine((v, ctx) => {
    const r = searchSchema.safeParse({ checkIn: v.checkIn, checkOut: v.checkOut, adults: v.adults, children: v.children, rooms: v.rooms });
    if (!r.success) for (const i of r.error.issues) ctx.addIssue({ code: "custom", message: i.message, path: i.path });
  });

/* ---------------------------------------------------------------- customers */
export const customerSchema = z.object({
  name,
  company: z.string().trim().min(2).max(120),
  gstin: gstinChecked.refine((v) => v !== "", "GSTIN is required"),
  email,
  mobile: optionalText(15),
  address: optionalText(300),
  creditDays: z.number().int().min(0).max(120).default(7),
});

/* ----------------------------------------------------------------- invoices */
export const invoiceSchema = z
  .object({
    party: z.object({
      type: z.enum(["B2C", "B2B"]),
      name,
      email,
      mobile: optionalText(15),
      company: optionalText(120),
      gstin: gstinChecked.optional(),
      address: optionalText(300),
      customerId: z.string().optional(),
    }),
    items: z
      .array(
        z.object({
          description: z.string().trim().min(2).max(200),
          ruleCode: z.string().min(2),
          qty: z.number().positive().max(10_000),
          unitPrice: money,
          tariff: money.optional(),
        }),
      )
      .min(1, "Add at least one line item")
      .max(40),
    discount: z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("percent"), value: z.number().min(0).max(100) }),
        z.object({ type: z.literal("flat"), value: z.number().min(0) }),
      ])
      .optional(),
    discountNote: optionalText(80),
    dueDate: isoDate.optional(),
    notes: optionalText(300),
    bookingRef: z.string().optional(),
    sendEmail: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.party.type === "B2B") {
      if (!v.party.gstin) ctx.addIssue({ code: "custom", path: ["party", "gstin"], message: "GSTIN is required for B2B invoices" });
      if (!v.party.company) ctx.addIssue({ code: "custom", path: ["party", "company"], message: "Company name is required for B2B invoices" });
    }
  });

/* ----------------------------------------------------------------- payments */
const paymentCommon = { amount: money, paidAt: z.string().datetime({ offset: true }).optional(), note: optionalText(200) };
const txn = z.string().trim().regex(/^[A-Za-z0-9._-]{6,40}$/, "Enter the transaction / reference ID (6–40 letters or digits)");

export const paymentSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("CASH"), ...paymentCommon }),
  z.object({ method: z.literal("CARD"), ...paymentCommon, cardLast4: z.string().regex(/^\d{4}$/, "Last 4 digits").optional(), bankReference: optionalText(40) }),
  z.object({ method: z.literal("UPI"), ...paymentCommon, upiTransactionId: txn, upiVpa: z.string().trim().regex(/^[\w.-]{2,64}@[A-Za-z]{2,32}$/, "Enter a valid UPI ID").optional().or(z.literal("")) }),
  z.object({ method: z.literal("NET_BANKING"), ...paymentCommon, bankReference: txn }),
  z.object({ method: z.literal("BANK_TRANSFER"), ...paymentCommon, bankReference: txn }),
  z.object({
    method: z.literal("CHEQUE"),
    ...paymentCommon,
    chequeNumber: z.string().regex(/^\d{6}$/, "6-digit cheque number"),
    chequeBank: z.string().trim().min(2).max(60),
    chequeDate: isoDate,
  }),
]);
