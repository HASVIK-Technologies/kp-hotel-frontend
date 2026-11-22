import { z } from "zod";
import { AMENITY_FLAGS, ROOM_TYPES, ROOM_VIEWS, type Room, type RoomInput } from "@/types/api";

/** An image is a file name inside public/images/rooms/ (e.g. "deluxe-room-1.jpg") or an https:// URL. */
const imageRef = z
  .string()
  .trim()
  .regex(/^(https:\/\/\S+|[\w\-./]+\.(jpe?g|png|webp|avif|svg))$/i, "Use a file name like deluxe-room-1.jpg (or an https:// URL)");

/**
 * Form-friendly shape (strings/objects the inputs need). `toRoomInput()` converts it to the API body.
 * Mirrors the backend rules in docs/API.md → "Rooms".
 */
export const roomFormSchema = z
  .object({
    name: z.string().trim().min(3, "At least 3 characters").max(60, "Max 60 characters"),
    type: z.enum(ROOM_TYPES),
    view: z.enum(ROOM_VIEWS),
    headline: z.string().trim().min(5, "At least 5 characters").max(120),
    blurb: z.string().trim().min(5, "At least 5 characters").max(200),
    description: z.string().trim().min(20, "Describe the room in at least 20 characters").max(1000),
    price: z.number({ error: "Enter the nightly rate" }).min(500, "At least ₹500").max(100000, "At most ₹1,00,000"),
    mrp: z.number().min(500).max(100000).optional().or(z.nan().transform(() => undefined)),
    maxGuests: z.number({ error: "Enter a number" }).int().min(1).max(10),
    beds: z.string().trim().min(2, "e.g. King bed").max(60),
    size: z.number({ error: "Enter the size in sqm" }).min(8, "At least 8 sqm").max(300),
    inventory: z.number({ error: "Enter a number" }).int().min(0, "0–100").max(100, "0–100"),
    active: z.boolean(),
    amenityFlags: z.array(z.enum(AMENITY_FLAGS)),
    amenitiesText: z.string().trim().min(2, "Add at least one amenity (one per line)"),
    images: z.array(z.object({ name: imageRef })).min(1, "Add at least one image").max(8, "At most 8 images"),
  })
  .refine((r) => r.mrp === undefined || r.mrp >= r.price, { path: ["mrp"], message: "MRP must be at least the room price" })
  .refine((r) => r.amenitiesText.split("\n").filter((l) => l.trim()).length <= 20, { path: ["amenitiesText"], message: "At most 20 amenities" });

export type RoomFormValues = z.infer<typeof roomFormSchema>;

export const emptyRoomForm: RoomFormValues = {
  name: "", type: "Deluxe", view: "City", headline: "", blurb: "", description: "",
  price: 2500, mrp: undefined, maxGuests: 2, beds: "King bed", size: 28, inventory: 4, active: true,
  amenityFlags: ["WiFi"], amenitiesText: "Air conditioning\nFree high-speed Wi-Fi", images: [{ name: "" }],
};

export const roomToForm = (r: Room): RoomFormValues => ({
  name: r.name, type: r.type, view: r.view, headline: r.headline, blurb: r.blurb, description: r.description,
  price: r.price, mrp: r.mrp, maxGuests: r.maxGuests, beds: r.beds, size: r.size, inventory: r.inventory, active: r.active,
  amenityFlags: r.amenityFlags, amenitiesText: r.amenities.join("\n"), images: r.images.map((name) => ({ name })),
});

export const toRoomInput = (v: RoomFormValues): RoomInput => ({
  name: v.name.trim(), type: v.type, view: v.view, headline: v.headline.trim(), blurb: v.blurb.trim(), description: v.description.trim(),
  price: v.price, ...(v.mrp ? { mrp: v.mrp } : {}), maxGuests: v.maxGuests, beds: v.beds.trim(), size: v.size, inventory: v.inventory, active: v.active,
  amenityFlags: v.amenityFlags,
  amenities: v.amenitiesText.split("\n").map((l) => l.trim()).filter(Boolean),
  images: v.images.map((i) => i.name.trim()),
});
