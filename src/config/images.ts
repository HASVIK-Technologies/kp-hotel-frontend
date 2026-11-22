/**
 * ONE place that lists every picture on the website.
 *
 * HOW TO REPLACE A PHOTO
 *   1. Put your file in  public/images/<folder>/  with the SAME NAME as the one listed below
 *      (e.g. replace  public/images/home/hero.jpg  with your own hero.jpg).
 *   2. That's it. No code change. If your file has a different extension (hero.png), change the path here.
 *
 * Room photos are different: rooms are added in Admin → Rooms & rates, where you type the file names
 * (e.g. "deluxe-room-1.jpg") of files you placed in  public/images/rooms/.
 *
 * Recommended sizes: hero 2000×1200, page banners 1800×900, cards 1200×900. JPG/WebP, under ~400 KB.
 */
export const IMAGE_BASE = "/images";

export const IMAGES = {
  brand: {
    /** Round "KP" badge used in the header, footer, admin and 404 page. */
    logoMark: "brand/logo-mark.svg",
  },
  home: {
    hero: "home/hero.jpg",
    hotelExterior: "home/hotel-exterior.jpg",
    pool: "home/pool.jpg",
    poolTropical: "home/pool-tropical.jpg",
    lounge: "home/lounge.jpg",
    balcony: "home/balcony.jpg",
  },
  dining: {
    dishes: "dining/dishes.jpg",
    restaurant: "dining/restaurant.jpg",
    terrace: "dining/terrace.jpg",
  },
  events: {
    grandHall: "events/grand-hall.jpg",
    royalHall: "events/royal-hall.jpg",
    miniHall: "events/mini-hall.jpg",
    conferenceHall: "events/conference-hall.jpg",
  },
  offers: {
    weekend: "offers/weekend.jpg",
    dining: "offers/dining.jpg",
    events: "offers/events.jpg",
  },
} as const;

/** Full public URL for an image path from the registry above (or any absolute URL / root path). */
export function imageUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `${IMAGE_BASE}/${path}`;
}

/** Room photos live in public/images/rooms/. The API stores only the file name. */
export function roomImageUrl(name: string): string {
  if (/^(https?:)?\/\//.test(name) || name.startsWith("/")) return name;
  return `${IMAGE_BASE}/rooms/${name}`;
}
