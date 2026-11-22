/**
 * Every internal URL in one place. Use these helpers instead of hand-writing paths, so a route change is a
 * one-line edit.
 *
 * The site is exported as static files, so pages whose address depends on data (a room, an invoice) read the
 * identifier from the query string (`/rooms/details?slug=...`) instead of using a dynamic path segment.
 */
export const routes = {
  home: "/",
  rooms: "/rooms",
  room: (slug: string, query?: string) => `/rooms/details?slug=${encodeURIComponent(slug)}${query ? `&${query}` : ""}`,
  checkout: "/checkout",
  confirmation: (ref: string, token?: string) => `/confirmation?ref=${encodeURIComponent(ref)}${token ? `&t=${encodeURIComponent(token)}` : ""}`,
  manageBooking: "/manage-booking",
  dining: "/dining",
  banquets: "/banquets",
  conference: "/conference",
  gallery: "/gallery",
  offers: "/offers",
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",

  admin: {
    root: "/admin",
    login: "/admin/login",
    bookings: "/admin/bookings",
    newBooking: "/admin/bookings/new",
    invoices: "/admin/invoices",
    newInvoice: "/admin/invoices/new",
    invoice: (id: string) => `/admin/invoice?id=${encodeURIComponent(id)}`,
    payments: "/admin/payments",
    customers: "/admin/customers",
    events: "/admin/events",
    rooms: "/admin/rooms",
    newRoom: "/admin/rooms/new",
    editRoom: (slug: string) => `/admin/rooms/edit?slug=${encodeURIComponent(slug)}`,
    tax: "/admin/tax",
    reports: "/admin/reports",
    settings: "/admin/settings",
  },
} as const;
