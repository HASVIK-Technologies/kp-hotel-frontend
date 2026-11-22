import { differenceInCalendarDays, format, parseISO } from "date-fns";

export const toISO = (d: Date) => format(d, "yyyy-MM-dd");
export const fmtDate = (iso?: string, pattern = "d MMM yyyy") => (iso ? format(parseISO(iso), pattern) : "");
export const fmtShort = (iso?: string) => fmtDate(iso, "EEE, d MMM");
export const fmtRange = (a?: string, b?: string) =>
  a && b ? `${fmtDate(a, "d MMM")} – ${fmtDate(b, "d MMM yyyy")}` : "";
export const plural = (n: number, s: string, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;
export const maskCard = (digits: string) => digits.slice(-4);

/** Today's date in India (IST) as yyyy-mm-dd, independent of the viewer's timezone. */
export const istToday = (offsetDays = 0) => new Date(Date.now() + 5.5 * 3600_000 + offsetDays * 86400_000).toISOString().slice(0, 10);

/** Whole-night count between two yyyy-mm-dd dates (0 if either is missing or the range is invalid). */
export const nightsBetween = (a?: string, b?: string) => (a && b ? Math.max(0, differenceInCalendarDays(parseISO(b), parseISO(a))) : 0);

/** ₹ amount in rupees, Indian digit grouping, no decimals: inr(2200) → "₹2,200". */
export const inr = (rupees: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);

/** ₹ amount from paise: inrPaise(150050) → "₹1,500.50" (decimals only when needed). */
export const inrPaise = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

/** Today (IST) as yyyy-mm-dd. */
export const todayISO = () => istToday();
/** First day of the current month (IST) as yyyy-mm-dd. */
export const monthStartISO = () => `${istToday().slice(0, 8)}01`;
