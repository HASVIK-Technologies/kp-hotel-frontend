import { IMAGES } from "@/config/images";

/** Gallery photos. `photo` is a path inside public/images/ (see config/images.ts). */

export type GalleryCat = "Rooms" | "Dining" | "Events";
// The first 7 also appear in the home page gallery strip, so the real hotel photos come first.
export const GALLERY: { id: string; title: string; cat: GalleryCat; photo: string; tall?: boolean }[] = [
  { id: "g5", title: "Grand Banquet Hall", cat: "Events", photo: IMAGES.events.grandHall, tall: true },
  { id: "g13", title: "Royal Banquet Hall stage", cat: "Events", photo: IMAGES.events.royalHall },
  { id: "g8", title: "Conference hall", cat: "Events", photo: IMAGES.events.conferenceHall },
  { id: "g14", title: "Mini Hall lounge", cat: "Events", photo: IMAGES.events.miniHall, tall: true },
  { id: "g15", title: "Celebration stage", cat: "Events", photo: IMAGES.offers.events },
  { id: "g12", title: "Resort lounge", cat: "Events", photo: IMAGES.home.lounge },
  { id: "g1", title: "Hotel exterior", cat: "Rooms", photo: IMAGES.home.hotelExterior, tall: true },
  { id: "g2", title: "Deluxe Room", cat: "Rooms", photo: "rooms/deluxe-room-1.jpg" },
  { id: "g3", title: "Executive Suite", cat: "Rooms", photo: "rooms/executive-suite-1.jpg", tall: true },
  { id: "g4", title: "Signature plates", cat: "Dining", photo: IMAGES.dining.dishes },
  { id: "g6", title: "Premium Room", cat: "Rooms", photo: "rooms/premium-room-1.jpg" },
  { id: "g7", title: "The Restaurant", cat: "Dining", photo: IMAGES.dining.restaurant },
  { id: "g9", title: "Terrace dining", cat: "Dining", photo: IMAGES.dining.terrace, tall: true },
  { id: "g10", title: "Poolside at dusk", cat: "Rooms", photo: IMAGES.home.hero },
  { id: "g11", title: "Garden balcony", cat: "Rooms", photo: IMAGES.home.balcony },
];

