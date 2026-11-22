import type { Metadata } from "next";
import { BedDouble, MapPin, PartyPopper, UtensilsCrossed } from "lucide-react";
import { IMAGES } from "@/config/images";
import { WHY } from "@/content/home";
import { PageHero, Section, SectionHead } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { FaqList } from "@/features/about/FaqList";

export const metadata: Metadata = { title: "About Us", description: "The story of Hotel KP & Restaurant, Rasra, comfortable stays, delicious food and memorable events." };

export default function AboutPage() {
  const icons = [MapPin, BedDouble, UtensilsCrossed, PartyPopper];
  return (
    <>
      <PageHero eyebrow="About Us" title="A warm welcome in the heart of Rasra" sub="Hotel KP & Restaurant brings together comfortable rooms, a multi-cuisine kitchen and spacious halls under one roof." image={IMAGES.home.lounge} />
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Photo src={IMAGES.home.hotelExterior} alt="Hotel KP exterior" className="aspect-[4/3] rounded-3xl shadow-lift" sizes="(min-width:1024px) 50vw, 100vw" />
          <div>
            <p className="eyebrow text-brass-deep">Our story</p>
            <h2 className="mt-3 text-4xl text-green sm:text-5xl">Hospitality that feels like home</h2>
            <div className="mt-5 space-y-4 text-ink/80">
              <p>Hotel KP & Restaurant was built on a simple idea: a traveller, a family or a wedding party should find everything they need in one place, and be looked after like a guest in our own home.</p>
              <p>From a quiet night&apos;s sleep and a hearty breakfast to a 500-guest celebration, our team handles every detail so you can simply enjoy the moment.</p>
            </div>
            <div className="mt-7"><ButtonLink href="/contact">Get in touch</ButtonLink></div>
          </div>
        </div>
      </Section>
      <Section tone="sand">
        <SectionHead title="Why guests choose us" center />
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {WHY.map((w, i) => {
            const Icon = icons[i];
            return (
              <li key={w.title} className="rounded-2xl bg-white p-6 text-center shadow-card ring-1 ring-line">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-sand text-brass-deep"><Icon className="size-6" aria-hidden /></span>
                <h3 className="mt-4 text-2xl text-green">{w.title}</h3>
                <p className="mt-1 text-sm text-muted">{w.desc}</p>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionHead title="Frequently asked questions" center />
          <FaqList />
        </div>
      </Section>
    </>
  );
}
