import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <article className="container-x max-w-3xl pb-20 pt-32 sm:pt-40">
      <p className="eyebrow text-brass-deep">Legal</p>
      <h1 className="mt-2 text-5xl text-green">Terms &amp; Conditions</h1>
      <div className="mt-8 space-y-5 text-ink/80 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:text-green">
        <p>Placeholder booking terms for the design handover. Final terms will be supplied by Hotel KP before launch.</p>
        <h2>Check-in &amp; check-out</h2>
        <p>Check-in from 12:00 PM and check-out until 11:00 AM. A valid government photo ID is required for every adult guest.</p>
        <h2>Cancellation</h2>
        <p>Room-only rates may be cancelled free of charge up to 48 hours before check-in. Breakfast-inclusive rates are non-refundable.</p>
        <h2>Taxes</h2>
        <p>GST is charged at the prevailing rate and shown in the booking total before payment.</p>
      </div>
    </article>
  );
}
