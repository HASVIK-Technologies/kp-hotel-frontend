import type {
  AuditEntry, Booking, Customer, Dashboard, Enquiry, Invoice, InvoiceDetail, InvoicePreview, InvoiceRow, Ledger, Payment, Room, RoomInput, SessionUser, StaffUser, TaxRule,
} from "@/types/api";
import { apiUrl, get, patch, post, put, qs } from "./client";

export interface GstSummary {
  from: string;
  to: string;
  byRate: { sac: string; rate: number; taxable: number; cgst: number; sgst: number; igst: number }[];
  b2b: { number: string; date: string; gstin: string; party: string; taxable: number; tax: number; total: number; docType: string }[];
  b2c: { taxablePaise: number; taxPaise: number };
  totalTaxablePaise: number;
  totalTaxPaise: number;
}

export interface OutstandingReport {
  buckets: Record<string, number>;
  totalPaise: number;
  rows: { invoiceId: string; number: string; party: string; type: string; dueDate: string; daysOverdue: number; totalPaise: number; balancePaise: number }[];
}

/** Endpoints used by the staff console. All require a signed-in session cookie. */
export const adminApi = {
  /* auth */
  login: (email: string, password: string) => post<{ user: SessionUser }>("/auth/login", { email, password }),
  logout: () => post<{ ok: true }>("/auth/logout"),
  me: () => get<{ user: SessionUser }>("/auth/me"),
  dashboard: () => get<Dashboard>("/admin/dashboard"),

  /* bookings */
  bookings: () => get<{ bookings: Booking[] }>("/admin/bookings"),
  createBooking: (body: unknown) => post<{ booking: Booking; invoice: { id: string; number: string } | null }>("/admin/bookings", body),
  setBookingStatus: (ref: string, status: string) => post<{ booking: Booking }>(`/admin/bookings/${ref}/status`, { status }),
  cancelBooking: (ref: string) => post<{ note: string }>(`/admin/bookings/${ref}/cancel`),

  /* invoices & payments */
  invoices: () => get<{ invoices: InvoiceRow[] }>("/admin/invoices"),
  invoice: (id: string) => get<InvoiceDetail>(`/admin/invoices/${id}`),
  previewInvoice: (body: unknown) => post<InvoicePreview>("/admin/invoices/preview", body),
  createInvoice: (body: unknown) => post<{ invoice: Invoice; ledger: Ledger }>("/admin/invoices", body),
  emailInvoice: (id: string, to?: string, message?: string) => post<{ ok: true; to: string }>(`/admin/invoices/${id}/email`, { to, message }),
  shareInvoice: (id: string) => get<{ url: string; payUrl?: string; text: string; whatsappUrl: string }>(`/admin/invoices/${id}/share`),
  payLink: (id: string) => post<{ url: string; expiresInDays: number }>(`/admin/invoices/${id}/pay-link`),
  recordPayment: (id: string, body: unknown) => post<{ payment: Payment; ledger: Ledger }>(`/admin/invoices/${id}/payments`, body),
  resolveCheque: (id: string, paymentId: string, outcome: "CLEARED" | "BOUNCED") =>
    post<{ ledger: Ledger }>(`/admin/invoices/${id}/payments/${paymentId}/resolve`, { outcome }),
  issueCreditNote: (id: string, reason: string) => post<{ creditNote: Invoice; ledger: Ledger }>(`/admin/invoices/${id}/credit-note`, { reason }),
  refund: (id: string, body: unknown) => post<{ payment: Payment }>(`/admin/invoices/${id}/refund`, body),
  invoicePdfUrl: (id: string, statement = false) => apiUrl(`/admin/invoices/${id}/pdf${statement ? "?statement=1" : ""}`),
  payments: () => get<{ payments: Payment[] }>("/admin/payments"),

  /* customers */
  customers: () => get<{ customers: Customer[] }>("/admin/customers"),
  customer: (id: string) => get<{ customer: Customer; invoices: InvoiceRow[]; outstandingPaise: number }>(`/admin/customers/${id}`),
  createCustomer: (body: unknown) => post<{ customer: Customer }>("/admin/customers", body),
  updateCustomer: (id: string, body: unknown) => patch<{ customer: Customer }>(`/admin/customers/${id}`, body),

  /* enquiries */
  enquiries: () => get<{ enquiries: Enquiry[] }>("/admin/enquiries"),
  setEnquiryStatus: (id: string, status: string) => patch<{ ok: true }>(`/admin/enquiries/${id}`, { status }),

  /* rooms & rates */
  rooms: () => get<{ rooms: Room[] }>("/admin/rooms"),
  room: (slug: string) => get<{ room: Room }>(`/admin/rooms/${encodeURIComponent(slug)}`),
  createRoom: (body: RoomInput) => post<{ room: Room }>("/admin/rooms", body),
  updateRoom: (slug: string, body: Partial<RoomInput>) => patch<{ room: Room }>(`/admin/rooms/${encodeURIComponent(slug)}`, body),

  /* tax & settings */
  taxRules: () => get<{ rules: TaxRule[] }>("/admin/tax-rules"),
  saveTaxRules: (rules: TaxRule[]) => put<{ ok: true }>("/admin/tax-rules", { rules }),
  settings: () => get<{ settings: Record<string, any> }>("/admin/settings"),
  saveSettings: (settings: unknown) => put<{ settings: Record<string, any> }>("/admin/settings", settings),

  /* reports */
  outstanding: () => get<OutstandingReport>("/admin/reports/outstanding"),
  gst: (from: string, to: string) => get<GstSummary>(`/admin/reports/gst${qs({ from, to })}`),
  collections: (from: string, to: string) => get<{ byMethod: Record<string, number>; totalPaise: number; count: number }>(`/admin/reports/collections${qs({ from, to })}`),
  runReminders: () => post<{ sent: number }>("/admin/jobs/reminders"),

  /* staff */
  users: () => get<{ users: StaffUser[] }>("/admin/users"),
  createUser: (body: unknown) => post<{ ok: true }>("/admin/users", body),
  updateUser: (email: string, body: unknown) => patch<{ ok: true }>(`/admin/users/${encodeURIComponent(email)}`, body),
  audit: () => get<{ entries: AuditEntry[] }>("/admin/audit"),
};
