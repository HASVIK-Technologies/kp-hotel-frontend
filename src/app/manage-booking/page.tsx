import type { Metadata } from "next";
import { Suspense } from "react";
import { ManageBookingClient } from "@/features/booking/ManageBookingClient";

export const metadata: Metadata = { title: "Manage Booking", robots: { index: false } };

export default function ManageBookingPage() {
  return (
    <div className="bg-sand-soft px-4 pb-20 pt-32 sm:pt-40">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="eyebrow text-brass-deep">Your reservation</p>
        <h1 className="mt-3 text-5xl text-green sm:text-6xl">Manage Booking</h1>
      </div>
      <Suspense>
        <ManageBookingClient />
      </Suspense>
    </div>
  );
}
