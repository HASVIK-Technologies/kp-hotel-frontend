import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomsClient } from "@/features/rooms/RoomsClient";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description: "Compare Deluxe, Premium, Executive and Family rooms at Hotel KP. Filter by price, view and amenities and book instantly.",
};

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <RoomsClient />
    </Suspense>
  );
}
