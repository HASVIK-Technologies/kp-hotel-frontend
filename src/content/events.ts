import { IMAGES } from "@/config/images";

/** Banquet halls, packages and conference facilities. */

export const HALLS = [
  { slug: "grand", name: "Grand Banquet Hall", capacity: 500, seated: 350, sqft: 6000, ceiling: "16 ft", blurb: "Weddings & large events", image: IMAGES.events.grandHall },
  { slug: "royal", name: "Royal Banquet Hall", capacity: 200, seated: 150, sqft: 3000, ceiling: "14 ft", blurb: "Parties & family functions", image: IMAGES.events.royalHall },
  { slug: "mini", name: "Mini Hall", capacity: 80, seated: 60, sqft: 1200, ceiling: "12 ft", blurb: "Meetings & small events", image: IMAGES.events.miniHall },
];
export const PACKAGES = [
  { id: "silver", name: "Silver", price: 650, popular: false, perks: ["Plated 3-course vegetarian meal", "House mocktail service", "4-hour venue hire", "Basic floral décor"] },
  { id: "gold", name: "Gold", price: 950, popular: true, perks: ["Plated 4-course meal, veg & non-veg", "Welcome drinks & live counters", "6-hour venue hire", "Floral centrepieces & stage"] },
  { id: "platinum", name: "Platinum", price: 1350, popular: false, perks: ["Chef's tasting menu, 6 courses", "Premium bar & live music", "Full styling, lighting & AV", "Dedicated event manager"] },
];
export const EVENT_TYPES = ["Wedding", "Reception", "Engagement", "Birthday / Anniversary", "Corporate event", "Family function", "Other"] as const;

/* -------------------------------------------------------------- Conference */
export const CONF_LAYOUTS = [
  { name: "Theatre", seats: 120 },
  { name: "Classroom", seats: 80 },
  { name: "Boardroom", seats: 30 },
  { name: "U-Shape", seats: 40 },
];
export const CONF_AMENITIES = [
  "4K projector & screen", "Video-conferencing", "High-speed Wi-Fi", "Podium & PA system",
  "On-site AV technician", "Breakout rooms", "Catering & coffee breaks", "Dedicated event manager",
];
export const CONF_RATES = [
  { name: "Half day", note: "4 hours · tea/coffee & snacks", price: 12000 },
  { name: "Full day", note: "8 hours · lunch & two coffee breaks", price: 20000 },
];
