import type { Metadata } from "next";
import { Check } from "lucide-react";
import { IMAGES } from "@/config/images";
import { HALLS, PACKAGES } from "@/content/events";
import { inr } from "@/lib/format";
import { PageHero, Section, SectionHead } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { BanquetForm } from "@/features/enquiries/BanquetForm";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Banquets & Events",
  description: "Weddings, receptions and celebrations for up to 500 guests at the Grand Banquet Hall, with in-house catering.",
};

export default function BanquetsPage() {
  return (
    <>
      <PageHero eyebrow="Banquets & Events" title="Weddings & Celebrations" sub="Three elegant halls for up to 500 guests, with in-house catering and a dedicated events team." image={IMAGES.events.grandHall}>
        <ButtonLink href="#enquire" size="lg" variant="gold" className="mt-7">Check availability</ButtonLink>
      </PageHero>

      <Section id="halls">
        <SectionHead title="Choose your hall" sub="From intimate gatherings to grand weddings." />
        <ul className="grid gap-5 md:grid-cols-3">
          {HALLS.map((h, i) => (
            <li key={h.slug}>
              <Reveal delay={i * 0.08} className="h-full">
                <article className="h-full overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line">
                  <Photo src={h.image} alt={h.name} className="aspect-[16/10]" sizes="(min-width:768px) 33vw, 100vw" />
                  <div className="p-5">
                    <h3 className="text-2xl text-green">{h.name}</h3>
                    <p className="text-sm text-muted">{h.blurb}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                      {[["Reception", `${h.capacity}`], ["Seated", `${h.seated}`], ["Floor", `${h.sqft.toLocaleString("en-IN")} sqft`], ["Ceiling", h.ceiling]].map(([k, v]) => (
                        <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-display text-2xl font-bold text-green">{v}</dd></div>
                      ))}
                    </dl>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" id="packages">
        <SectionHead title="Catering packages" sub="Per-guest pricing, taxes extra. Customise any package with our events team." />
        <ul className="grid gap-5 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <li key={p.id}>
              <article className={cn("relative flex h-full flex-col rounded-2xl p-6 shadow-card ring-1", p.popular ? "bg-green text-white ring-green md:-translate-y-3" : "bg-white ring-line")}>
                {p.popular && <span className="absolute -top-3 right-5 rounded-full bg-brass px-4 py-1 text-xs font-bold uppercase tracking-wider text-ink">Popular</span>}
                <h3 className={cn("text-3xl", p.popular ? "text-white" : "text-green")}>{p.name}</h3>
                <p className={cn("mt-1 font-bold", p.popular ? "text-brass-light" : "text-green")}><span className="price text-3xl">{inr(p.price)}</span> / guest</p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-2.5"><Check className={cn("mt-0.5 size-4 shrink-0", p.popular ? "text-brass-light" : "text-action")} aria-hidden /> {perk}</li>
                  ))}
                </ul>
                <ButtonLink href="#enquire" variant={p.popular ? "gold" : "secondary"} className="mt-6 w-full">Enquire</ButtonLink>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="enquire">
        <div className="mx-auto max-w-3xl">
          <SectionHead title="Plan your event" sub="Tell us the date and guest count, our events team replies within 4 business hours." center />
          <div className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-line sm:p-8"><BanquetForm /></div>
        </div>
      </Section>
    </>
  );
}
