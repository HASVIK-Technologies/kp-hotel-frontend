import { IMAGES } from "@/config/images";

/** Gallery photos. `photo` is a path inside public/images/ (see config/images.ts). */

export type GalleryCat = "Rooms" | "Dining" | "Events";
export const GALLERY: { id: string; title: string; cat: GalleryCat; photo: string; tall?: boolean }[] = [
  { id: "g1", title: "Hotel exterior", cat: "Rooms", photo: IMAGES.home.hotelExterior, tall: true },
  { id: "g2", title: "Deluxe Room", cat: "Rooms", photo: "rooms/deluxe-room-1.jpg" },
  { id: "g3", title: "Executive Suite", cat: "Rooms", photo: "rooms/executive-suite-1.jpg", tall: true },
  { id: "g4", title: "Signature plates", cat: "Dining", photo: IMAGES.dining.dishes },
  { id: "g5", title: "Grand Banquet Hall", cat: "Events", photo: IMAGES.events.grandHall, tall: true },
  { id: "g6", title: "Premium Room", cat: "Rooms", photo: "rooms/premium-room-1.jpg" },
  { id: "g7", title: "The Restaurant", cat: "Dining", photo: IMAGES.dining.restaurant },
  { id: "g8", title: "Conference hall", cat: "Events", photo: IMAGES.events.conferenceHall },
  { id: "g9", title: "Terrace dining", cat: "Dining", photo: IMAGES.dining.terrace, tall: true },
  { id: "g10", title: "Poolside at dusk", cat: "Rooms", photo: IMAGES.home.hero },
  { id: "g11", title: "Garden balcony", cat: "Rooms", photo: IMAGES.home.balcony },
  { id: "g12", title: "Resort lounge", cat: "Events", photo: IMAGES.home.lounge },
];

