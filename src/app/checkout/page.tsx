import type { Metadata } from "next";
import { CheckoutClient } from "@/features/booking/CheckoutClient";

export const metadata: Metadata = { title: "Secure Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <CheckoutClient />
  );
}
