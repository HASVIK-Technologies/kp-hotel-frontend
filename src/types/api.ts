/**
 * API contract types for the frontend.
 *
 * These mirror the JSON returned by the backend (see docs/API.md and the live Swagger UI at /api/docs).
 * They are maintained by hand on purpose: the frontend and backend share NO source code, only this contract.
 * All money fields ending in `Paise` are integer paise (₹1 = 100 paise); other price fields are rupees.
 */

export type Role = "owner" | "manager" | "accountant" | "frontdesk";
export interface SessionUser {
  email: string;
  name: string;
  role: Role;
}

/* ---------------------------------------------------------------- GST / tax */
/** GST domain types. All money is integer PAISE; rates are percentages. */

export type ServiceType = "ROOM" | "RESTAURANT" | "BANQUET" | "CONFERENCE" | "OTHER";

export interface TaxSlab {
  /** Applies when per-unit-per-day tariff (paise) is <= this value; null = no upper bound */
  upToPaise: number | null;
  rate: number;
}

export interface TaxRule {
  code: string;
  service: ServiceType;
  description: string;
  sac: string; // services use SAC (HSN for services)
  rate?: number; // flat rate
  slabs?: TaxSlab[]; // tariff slabs (accommodation)
  itcAllowed: boolean;
  /** Place of supply is the property (immovable-property related) → always CGST+SGST for a UP hotel */
  supplyAtProperty: boolean;
  verified: boolean;
  note?: string;
}

export interface Line {
  description: string;
  ruleCode: string;
  service: ServiceType;
  sac: string;
  qty: number;
  unitPricePaise: number;
  grossPaise: number;
  discountPaise: number;
  taxablePaise: number;
  gstRate: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export interface Totals {
  grossPaise: number;
  discountPaise: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  taxPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
}



export interface Party {
  type: "B2C" | "B2B";
  name: string;
  email: string;
  mobile?: string;
  company?: string;
  gstin?: string;
  stateCode?: string;
  address?: string;
  customerId?: string;
}

/* --------------------------------------------------------------- invoice */
export type DocType = "TAX_INVOICE" | "CREDIT_NOTE";
export type PaymentMethod = "ONLINE" | "CASH" | "CARD" | "UPI" | "NET_BANKING" | "BANK_TRANSFER" | "CHEQUE";
export type LedgerStatus = "UNPAID" | "PARTIAL" | "PAID" | "CREDITED";

export interface Invoice {
  id: string;
  number: string; // KP/25-26/00001
  docType: DocType;
  issuedAt: string; // ISO
  dueDate: string; // yyyy-mm-dd
  party: Party;
  lines: Line[];
  totals: Totals;
  discountNote?: string;
  placeOfSupply: string;
  bookingRef?: string;
  relatesToInvoiceId?: string; // credit note → original
  reason?: string; // credit note reason
  notes?: string;
  seller: { name: string; gstin: string; address: string; stateCode: string; phone: string; email: string; bank?: { name?: string; account?: string; ifsc?: string; upiId?: string } };
  ruleSnapshot: { code: string; sac: string; rate: number; verified: boolean }[];
  pdfKey: string;
  pdfSha256: string;
  createdBy: string;
}

export interface Ledger {
  invoiceId: string;
  paidPaise: number;
  balancePaise: number;
  status: LedgerStatus;
  pendingChequePaise: number;
  refundDuePaise: number;
  version: number;
  updatedAt: string;
}

export type PaymentStatus = "SUCCESS" | "PENDING_CLEARANCE" | "BOUNCED" | "FAILED";
export type PaymentKind = "PAYMENT" | "REFUND";

export interface Payment {
  id: string;
  receiptNumber?: string;
  invoiceId: string;
  kind: PaymentKind;
  amountPaise: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  recordedBy: string; // staff email or "customer:online"
  // method details
  upiTransactionId?: string;
  upiVpa?: string;
  bankReference?: string; // UTR / net banking ref / card auth
  cardLast4?: string;
  chequeNumber?: string;
  chequeBank?: string;
  chequeDate?: string;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  note?: string;
}


export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "EXPIRED" | "NO_SHOW";

export interface Booking {
  ref: string;
  status: BookingStatus;
  roomSlug: string;
  roomName: string;
  image: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  ratePlan: string;
  addonIds: string[];
  promo?: string;
  guest: { name: string; email: string; mobile: string; company?: string; gstin?: string; requests?: string };
  payMode: "online" | "hotel" | "staff";
  totalPaise: number; // incl. GST, as quoted
  invoiceId?: string;
  invoiceNumber?: string;
  holdExpiresAt?: string;
  createdAt: string;
  source: "Website" | "Phone" | "Walk-in" | "OTA";
  cancelledAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  gstin: string;
  stateCode: string;
  email: string;
  mobile?: string;
  address?: string;
  creditDays: number;
  createdAt: string;
}


export interface Enquiry {
  id: string;
  kind: "Banquet" | "Conference" | "Table" | "Contact";
  name: string;
  email?: string;
  mobile?: string;
  date?: string;
  summary: string;
  details: Record<string, unknown>;
  status: "New" | "Contacted" | "Closed";
  createdAt: string;
}


/* -------------------------------------------------------------------- rooms */
export const ROOM_TYPES = ["Deluxe", "Premium", "Suite", "Family", "Twin"] as const;
export const ROOM_VIEWS = ["City", "Garden", "Pool"] as const;
export const AMENITY_FLAGS = ["WiFi", "Breakfast", "Balcony", "Bathtub"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];
export type RoomView = (typeof ROOM_VIEWS)[number];
export type Amenity = (typeof AMENITY_FLAGS)[number];

export interface Room {
  slug: string;
  name: string;
  type: RoomType;
  view: RoomView;
  headline: string;
  blurb: string;
  description: string;
  /** INR per night, excluding GST */
  price: number;
  mrp?: number;
  maxGuests: number;
  beds: string;
  size: number;
  rating: number;
  reviews: number;
  amenityFlags: Amenity[];
  amenities: string[];
  /** File names inside public/images/rooms/ (or absolute URLs) */
  images: string[];
  inventory: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** What the public website receives: a room plus live availability for tonight. */
export type PublicRoom = Room & { roomsLeft: number };

/** Body for creating/editing a room in the admin (server adds slug, rating, timestamps). */
export type RoomInput = Omit<Room, "slug" | "rating" | "reviews" | "sortOrder" | "createdAt" | "updatedAt"> & { sortOrder?: number };

/* ------------------------------------------------------------------ catalog */
export interface RatePlan {
  id: string;
  name: string;
  note: string;
  perNight: number;
  refundable: boolean;
}
export interface Addon {
  id: string;
  name: string;
  price: number;
  note: string;
  perNight?: boolean;
}
export interface Promo {
  label: string;
  percent: number;
}
export interface Catalog {
  ratePlans: RatePlan[];
  addons: Addon[];
  promos: Record<string, Promo>;
}

export interface QuoteLine {
  label: string;
  amount: number;
  note?: string;
}
export interface Quote {
  nights: number;
  roomCharge: number;
  planCharge: number;
  addons: number;
  discount: number;
  subtotal: number;
  tax: number;
  roundOff: number;
  total: number;
  lines: QuoteLine[];
  promoValid: boolean;
  totals: Totals;
}
export interface QuoteResponse {
  quote: Quote;
  available: number;
  soldOut: boolean;
}
export interface QuoteRequest {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  rooms?: number;
  ratePlan?: string;
  addonIds?: string[];
  promo?: string;
}

/* ------------------------------------------------------- payments / invoices */
export interface GatewaySession {
  orderId: string;
  paymentSessionId: string;
  mode: "mock" | "sandbox" | "production";
  amountPaise: number;
}
export interface InvoiceRow {
  invoice: Invoice;
  ledger: Ledger;
  overdue: boolean;
  daysOverdue: number;
}
export interface InvoiceDetail extends InvoiceRow {
  payments: Payment[];
  amountInWords: string;
}

export interface InvoicePreview {
  lines: Line[];
  totals: Totals;
}
export interface GuestInvoiceInfo {
  id: string;
  number: string;
  balancePaise: number;
  status: string;
  pdfUrl: string;
  payUrl?: string;
}

/* ---------------------------------------------------------------- dashboard */
export interface Dashboard {
  collectedTodayPaise: number;
  collectedMonthPaise: number;
  outstandingPaise: number;
  overduePaise: number;
  overdueCount: number;
  occupancyPct: number;
  arrivalsToday: number;
  departuresToday: number;
  openEnquiries: number;
  pendingCheques: number;
  revenue: { month: string; ROOM: number; RESTAURANT: number; BANQUET: number; CONFERENCE: number; OTHER: number }[];
  recentBookings: Booking[];
}

export interface StaffUser {
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
}
export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  target: string;
  detail?: unknown;
}
