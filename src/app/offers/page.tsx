import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { IMAGES } from "@/config/images";
import { OFFERS } from "@/content/offers";
import { PageHero, Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Special Offers", description: "Exclusive offers on stays, dining and events at Hotel KP." };

export default function OffersPage() {
  return (
    <>
      <PageHero eyebrow="Special Offers" title="Exclusive offers for every occasion" sub="Weekend getaways, family dining and event deals." image={IMAGES.home.poolTropical} />
      <Section>
        <ul className="grid gap-6 md:grid-cols-3">
          {OFFERS.map((o) => (
            <li key={o.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line">
                <div className="relative">
                  <Photo src={o.image} alt="" className="aspect-[16/10]" sizes="(min-width:768px) 33vw, 100vw" />
                  <span className="absolute left-4 top-4 rounded-xl bg-brass px-3 py-1.5 text-sm font-bold text-ink shadow">{o.badge}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-3xl text-green">{o.title}</h2>
                  <p className="mt-2 text-muted">{o.desc}</p>
                  <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-brass bg-sand-soft px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-green">
                    <Tag className="size-4" aria-hidden /> {o.code}
                  </p>
                  <p className="mt-3 flex-1 text-xs text-muted">{o.terms}</p>
                  <ButtonLink href={o.href} className="mt-5 w-full">{o.cta}</ButtonLink>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
