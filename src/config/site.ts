/** Business identity and global navigation. Edit here, it updates the header, footer, emails links and contact page. */
export const SITE = {
  name: "Hotel KP & Restaurant",
  short: "KP Hotel",
  tagline: "Comfortable Stay. Delicious Food. Memorable Events.",
  phone: "+91 84679 88816",
  phoneHref: "tel:+918467988816",
  whatsapp: "https://wa.me/918467988816",
  email: "kpgrouprasra@gmail.com",
  address: "Pani Tanki Road, Hazir Bakhsh Nagar, Rasra, Ballia – 221712, Uttar Pradesh",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Hotel+KP+Rasra+Ballia",
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
  /** Shown on room cards as "+ 12% GST". The real rate is computed by the API per invoice line. */
  gstRate: 0.12,
} as const;

export const NAV = [
  { href: "/rooms", label: "Rooms" },
  { href: "/dining", label: "Dining" },
  { href: "/banquets", label: "Banquets" },
  { href: "/conference", label: "Conference" },
  { href: "/gallery", label: "Gallery" },
  { href: "/offers", label: "Offers" },
] as const;
