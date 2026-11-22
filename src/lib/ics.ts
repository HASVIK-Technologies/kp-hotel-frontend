import type { Booking } from "@/types/api";

const stamp = (iso: string) => iso.replace(/-/g, "");

/** Builds an RFC 5545 all-day event for a stay and triggers a download. */
export function downloadIcs(b: Booking) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KP Hotel//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.ref}@kphotel.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${stamp(b.checkIn)}`,
    `DTEND;VALUE=DATE:${stamp(b.checkOut)}`,
    `SUMMARY:Stay at Hotel KP & Restaurant (${b.roomName})`,
    `DESCRIPTION:Booking ${b.ref}. Check-in from 12:00 PM.`,
    "LOCATION:Pani Tanki Road\, Hazir Bakhsh Nagar\, Rasra\, Ballia 221712",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${b.ref}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
