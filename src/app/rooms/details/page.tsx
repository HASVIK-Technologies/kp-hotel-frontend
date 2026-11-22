import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomDetailClient } from "@/features/rooms/RoomDetailClient";

export const metadata: Metadata = {
  title: "Room details",
  description: "Photos, amenities and live pricing for your room at Hotel KP & Restaurant, Rasra.",
};

/** Static export can't pre-render rooms that admins add later, so the room is chosen with `?slug=` at runtime. */
export default function RoomDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <RoomDetailClient />
    </Suspense>
  );
}
