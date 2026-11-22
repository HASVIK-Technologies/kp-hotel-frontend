import { IMAGES } from "@/config/images";

/** Special offers. `code` must match a promo code known to the API (see backend domain/pricing/catalog.ts). */

export const OFFERS = [
  { id: "weekend", title: "Weekend Stay Offer", badge: "20% OFF", desc: "Get up to 20% off on weekend bookings.", cta: "Book Now", href: "/rooms", image: IMAGES.offers.weekend, code: "WEEKEND20", terms: "Valid on Friday–Sunday stays, subject to availability. Not combinable with other offers." },
  { id: "dining", title: "Dining Special", badge: "10% OFF", desc: "Flat 10% off on family dining.", cta: "Reserve Now", href: "/dining", image: IMAGES.offers.dining, code: "FAMILY10", terms: "Valid on dine-in for groups of 4 or more, Monday–Thursday." },
  { id: "event", title: "Event Booking Offer", badge: "Best Deal", desc: "Special rates for weddings and corporate events.", cta: "Enquire Now", href: "/banquets#enquire", image: IMAGES.offers.events, code: "EVENTS", terms: "Complimentary décor upgrade on bookings of 150+ guests, confirmed 30 days ahead." },
];
export type Offer = (typeof OFFERS)[number];
