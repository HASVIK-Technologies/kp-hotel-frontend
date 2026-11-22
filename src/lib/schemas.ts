import { z } from "zod";
import { isBefore, parseISO, startOfDay } from "date-fns";

/**
 * Validation layer, Zod 4 schemas are the single source of truth for every
 * form (consumed by React Hook Form through @hookform/resolvers). Types are
 * inferred, never hand-written.
 */

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const todayStart = () => startOfDay(new Date());

const isoDate = (required: string) =>
  z.string({ error: required }).regex(ISO, required);

const futureDate = (required: string) =>
  isoDate(required).refine((v) => !isBefore(parseISO(v), todayStart()), "Date can't be in the past");

/* ------------------------------------------------------------- primitives */
export const name = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(80, "Name is too long")
  .regex(/^[\p{L}][\p{L}\s.'-]*$/u, "Name can only contain letters and spaces");

export const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

/** Indian mobile: optional +91/0 prefix, 10 digits starting 6-9. */
export const normaliseMobile = (v: string) => v.replace(/[\s()-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
export const mobile = z
  .string()
  .trim()
  .min(1, "Enter your mobile number")
  .refine((v) => /^[6-9]\d{9}$/.test(normaliseMobile(v)), "Enter a valid 10-digit Indian mobile number");

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const gstin = z
  .string()
  .trim()
  .toUpperCase()
  .refine((v) => v === "" || GSTIN.test(v), "Enter a valid 15-character GSTIN");

const message = (min = 10) => z.string().trim().min(min, `Please add a few details (at least ${min} characters)`).max(1000, "Please keep it under 1,000 characters");

/* ------------------------------------------------------------- stay search */
export const searchSchema = z
  .object({
    checkIn: futureDate("Select a check-in date"),
    checkOut: isoDate("Select a check-out date"),
    adults: z.number().int().min(1, "At least 1 adult").max(8),
    children: z.number().int().min(0).max(6),
    rooms: z.number().int().min(1).max(5),
  })
  .refine((v) => parseISO(v.checkOut) > parseISO(v.checkIn), {
    path: ["checkOut"],
    message: "Check-out must be after check-in",
  })
  .refine((v) => v.adults >= v.rooms, {
    path: ["rooms"],
    message: "Each room needs at least one adult",
  });
export type SearchValues = z.infer<typeof searchSchema>;

/* ---------------------------------------------------------------- checkout */
export const luhn = (digits: string) => {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const guestFields = {
  name,
  email,
  mobile,
  company: z.string().trim().max(120).optional().or(z.literal("")),
  gstin,
  requests: z.string().trim().max(400, "Please keep requests under 400 characters").optional().or(z.literal("")),
  promo: z.string().trim().toUpperCase().max(20).optional().or(z.literal("")),
  terms: z.literal(true, { error: "Please accept the booking terms to continue" }),
};

/**
 * Checkout collects contact + GST details only. Card / UPI / net-banking details are entered on
 * Cashfree's hosted page, so none of that is validated (or even seen) by this site.
 */
export const checkoutSchema = z
  .object({ ...guestFields, method: z.enum(["online", "hotel"]) })
  .superRefine((v, ctx) => {
    if (v.gstin && !v.company?.trim()) ctx.addIssue({ code: "custom", path: ["company"], message: "Enter the company name for the GST invoice" });
  });

/** Flat shape used by the form. */
export interface CheckoutFormValues {
  name: string;
  email: string;
  mobile: string;
  company?: string;
  gstin: string;
  requests?: string;
  promo?: string;
  terms: boolean;
  method: "online" | "hotel";
}

/* --------------------------------------------------------------- enquiries */
export const tableSchema = z.object({
  name,
  mobile,
  date: futureDate("Choose a date"),
  time: z.string().min(1, "Choose a time"),
  guests: z.number().int().min(1).max(20, "For parties above 20, please send a banquet enquiry"),
  occasion: z.string().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});
export type TableValues = z.infer<typeof tableSchema>;

export const banquetSchema = z.object({
  name,
  email,
  mobile,
  eventType: z.string().min(1, "Choose an event type"),
  date: futureDate("Choose your event date"),
  guests: z.number({ error: "Enter number of guests" }).int().min(20, "Minimum 20 guests").max(500, "Our largest hall seats 500 guests"),
  hall: z.string().min(1, "Choose a hall"),
  pkg: z.string().optional().or(z.literal("")),
  message: message(0).optional().or(z.literal("")),
});
export type BanquetValues = z.infer<typeof banquetSchema>;

export const conferenceSchema = z.object({
  name,
  company: z.string().trim().min(2, "Enter your company name").max(120),
  email,
  mobile,
  date: futureDate("Choose a preferred date"),
  attendees: z.number({ error: "Enter number of attendees" }).int().min(5, "Minimum 5 attendees").max(200, "Maximum capacity is 200"),
  layout: z.string().min(1, "Choose a layout"),
  duration: z.enum(["half", "full"], { error: "Choose half or full day" }),
  message: message(0).optional().or(z.literal("")),
});
export type ConferenceValues = z.infer<typeof conferenceSchema>;

export const contactSchema = z.object({
  name,
  email,
  mobile: mobile.optional().or(z.literal("")),
  subject: z.string().min(1, "Choose a subject"),
  message: message(10),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const lookupSchema = z.object({
  ref: z.string().trim().toUpperCase().regex(/^KPH-\d{5}$/, "Booking reference looks like KPH-20874"),
  email,
});
export type LookupValues = z.infer<typeof lookupSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const newsletterSchema = z.object({ email });
