import type { Metadata } from "next";
import { Check } from "lucide-react";
import { IMAGES } from "@/config/images";
import { CONF_AMENITIES, CONF_LAYOUTS, CONF_RATES } from "@/content/events";
import { inr } from "@/lib/format";
import { PageHero, Section } from "@/components/ui/Section";
import { ConferenceForm } from "@/features/enquiries/ConferenceForm";

export const metadata: Metadata = {
  title: "Conference & Meetings",
  description: "Corporate-ready meeting spaces from boardroom to auditorium with modern AV, Wi-Fi and catering support.",
};

export default function ConferencePage() {
  return (
    <>
      <PageHero eyebrow="Conference & Meetings" title="Corporate-ready, from boardroom to auditorium" sub="Flexible spaces for meetings, seminars and offsites, with an on-site AV technician." image={IMAGES.events.conferenceHall} />
      <Section>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CONF_LAYOUTS.map((l) => (
            <li key={l.name} className="rounded-2xl bg-sand p-5 ring-1 ring-line">
              <h2 className="text-2xl text-green">{l.name}</h2>
              <p className="mt-1 text-sm font-bold text-ink">{l.seats} seats</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <h2 className="eyebrow text-green">Amenities</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {CONF_AMENITIES.map((a) => (
                <li key={a} className="flex items-center gap-3 text-[0.95rem]"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-green text-white"><Check className="size-3" strokeWidth={3} aria-hidden /></span> {a}</li>
              ))}
            </ul>
            <div className="mt-10 divide-y divide-line rounded-2xl bg-white shadow-card ring-1 ring-line">
              {CONF_RATES.map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-4 p-5">
                  <div><h3 className="font-sans text-lg font-bold text-ink">{r.name}</h3><p className="text-sm text-muted">{r.note}</p></div>
                  <p className="price text-2xl text-green">{inr(r.price)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Rates exclude 18% GST. Multi-day corporate packages on request.</p>
          </div>

          <aside id="enquiry" className="scroll-mt-28 h-fit rounded-3xl bg-green p-6 text-white shadow-lift sm:p-8">
            <p className="eyebrow text-brass-light">Plan your event</p>
            <h2 className="mt-2 text-4xl text-white">Corporate Enquiry</h2>
            <p className="mb-6 mt-2 text-sm text-white/75">Tell us your date and headcount, and our events team replies within 4 business hours.</p>
            <ConferenceForm />
          </aside>
        </div>
      </Section>
    </>
  );
}
