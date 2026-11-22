import type { Booking, Catalog, GatewaySession, GuestInvoiceInfo, PublicRoom, QuoteRequest, QuoteResponse } from "@/types/api";
import { get, post, qs } from "./client";

/** How a guest proves they may see a booking: the signed token from booking time, or the booking e-mail. */
export interface BookingAuth {
  t?: string;
  email?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  invoice: { id: string; number: string } | null;
  payment: GatewaySession | null;
  accessToken: string;
}

export interface VerifyPaymentResponse {
  status: "PAID" | "PENDING" | "FAILED" | "NOT_FOUND";
  bookingRef?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amountPaise?: number;
  accessToken?: string;
}

/** Endpoints used by the public website (no staff login). */
export const publicApi = {
  rooms: () => get<{ rooms: PublicRoom[] }>("/rooms"),
  room: (slug: string) => get<{ room: PublicRoom }>(`/rooms/${encodeURIComponent(slug)}`),
  catalog: () => get<Catalog>("/catalog"),
  quote: (body: QuoteRequest) => post<QuoteResponse>("/quotes", body),

  createBooking: (body: unknown) => post<CreateBookingResponse>("/bookings", body),
  getBooking: (ref: string, auth: BookingAuth) =>
    get<{ booking: Booking; invoice: GuestInvoiceInfo | null }>(`/bookings/${encodeURIComponent(ref)}${qs({ ...auth })}`),
  cancelBooking: (ref: string, auth: BookingAuth) =>
    post<{ booking: Booking; refundable: boolean; message: string }>(`/bookings/${encodeURIComponent(ref)}/cancel${qs({ ...auth })}`),
  retryPayment: (ref: string, auth: BookingAuth) => post<{ payment: GatewaySession }>(`/bookings/${encodeURIComponent(ref)}/pay${qs({ ...auth })}`),

  verifyPayment: (orderId: string) => get<VerifyPaymentResponse>(`/payments/verify?order_id=${encodeURIComponent(orderId)}`),
  mockCompletePayment: (orderId: string, outcome: "SUCCESS" | "FAILED", method: "upi" | "card" | "net_banking") =>
    post<{ ok: true }>(`/payments/mock/${encodeURIComponent(orderId)}/complete`, { outcome, method }),

  invoiceSummary: (id: string, t: string) =>
    get<{ number: string; party: string; totalPaise: number; balancePaise: number; dueDate: string; status: string }>(`/invoices/${id}/summary${qs({ t })}`),
  payInvoice: (id: string, t: string) => post<{ payment: GatewaySession }>(`/invoices/${id}/pay${qs({ t })}`),

  sendEnquiry: (body: unknown) => post<{ id: string }>("/enquiries", body),
  subscribeNewsletter: (email: string) => post<{ ok: true }>("/newsletter", { email }),
};
