import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="container-x max-w-3xl pb-20 pt-32 sm:pt-40">
      <p className="eyebrow text-brass-deep">Legal</p>
      <h1 className="mt-2 text-5xl text-green">Privacy Policy</h1>
      <div className="mt-8 space-y-5 text-ink/80 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:text-green">
        <p>This is placeholder policy copy for the design handover. Final wording will be supplied by Hotel KP&apos;s legal advisor before launch.</p>
        <h2>What we collect</h2>
        <p>Name, contact details, stay dates and special requests that you provide when booking or enquiring.</p>
        <h2>Payments</h2>
        <p>Card and UPI details are handled by the payment gateway and are never stored on our servers.</p>
        <h2>Your choices</h2>
        <p>You may ask us to access, correct or delete your data by writing to kpgrouprasra@gmail.com.</p>
      </div>
    </article>
  );
}
