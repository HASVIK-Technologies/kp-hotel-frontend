import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationClient } from "@/features/booking/ConfirmationClient";

export const metadata: Metadata = { title: "Booking Confirmed", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-sand" />}>
      <ConfirmationClient />
    </Suspense>
  );
}
