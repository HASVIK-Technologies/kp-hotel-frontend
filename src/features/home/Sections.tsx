import Link from "next/link";
import { ArrowRight, Check, MapPin, BedDouble, UtensilsCrossed, PartyPopper, Presentation, Wifi, MonitorPlay, Armchair, Coffee, Star, Quote, Users, Calendar } from "lucide-react";
import { IMAGES } from "@/config/images";
import { HALLS } from "@/content/events";
import { OFFERS, type Offer } from "@/content/offers";
import { TESTIMONIALS, WHY } from "@/content/home";
import { GALLERY } from "@/content/gallery";
import { Section, SectionHead } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function RestaurantBand() {
  return (
    <section className="relative isolate overflow-hidden bg-green text-white">
      <Photo src={IMAGES.dining.dishes} alt="Plated dishes at our restaurant" sizes="100vw" className="absolute inset-y-0 right-0 -z-10 w-full opacity-40 lg:w-3/5 lg:opacity-100 [mask-image:linear-gradient(to_right,transparent,black_35%)]" />
      <div className="container-x py-16 sm:py-24">
        <Reveal className="max-w-lg">
          <p className="eyebrow mb-3 flex items-center gap-3 text-brass-light"><span className="h-px w-8 bg-brass-light" aria-hidden /> Multi-Cuisine</p>
          <h2 className="text-5xl text-white sm:text-6xl">Restaurant</h2>
          <p className="mt-4 text-lg text-white/80">Delicious food, great ambience and a memorable dining experience.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/dining#menu" variant="gold">View Menu</ButtonLink>
            <ButtonLink href="/dining#reserve" variant="light">Reserve a Table</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function BanquetsSection() {
  return (
    <Section>
      <SectionHead title="Banquets & Events" sub="Perfect venue for weddings, parties and special occasions." href="/banquets" linkLabel="View All Venues" />
      <ul className="grid gap-5 md:grid-cols-3">
        {HALLS.map((h, i) => (
          <li key={h.slug}>
            <Reveal delay={i * 0.08} className="h-full">
              <Link href="/banquets#halls" className="group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition-all hover:-translate-y-1 hover:shadow-lift">
                <Photo src={h.image} alt={h.name} className="aspect-[16/10] [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105" sizes="(min-width:768px) 33vw, 100vw" />
                <div className="p-5">
                  <h3 className="text-2xl text-green">{h.name}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted">
                    <li className="flex items-center gap-2"><Users className="size-4 text-brass-deep" aria-hidden /> Upto {h.capacity} Guests</li>
                    <li className="flex items-center gap-2"><PartyPopper className="size-4 text-brass-deep" aria-hidden /> {h.blurb}</li>
                  </ul>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ConferenceBand() {
  const items = [
    { Icon: MonitorPlay, t: "Modern AV Setup" },
    { Icon: Wifi, t: "High Speed Wi-Fi" },
    { Icon: Armchair, t: "Flexible Seating" },
    { Icon: Coffee, t: "Catering Support" },
  ];
  return (
    <section className="bg-sand-soft">
      <div className="grid lg:grid-cols-2">
        <Photo src={IMAGES.events.conferenceHall} alt="Conference hall set theatre-style" className="aspect-[16/10] lg:aspect-auto lg:min-h-[28rem]" sizes="(min-width:1024px) 50vw, 100vw" />
        <Reveal className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16">
          <p className="eyebrow mb-3 flex items-center gap-3 text-brass-deep"><span className="h-px w-8 bg-brass" aria-hidden /> Business &amp; Meetings</p>
          <h2 className="text-4xl text-green sm:text-5xl">Conference Facilities</h2>
          <p className="mt-3 max-w-md text-muted">Well-equipped conference hall for corporate meetings, seminars and business events.</p>
          <ul className="mt-7 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map(({ Icon, t }) => (
              <li key={t} className="flex flex-col items-center gap-2 text-center text-xs font-medium text-ink/80">
                <span className="grid size-12 place-items-center rounded-xl bg-white text-green shadow-card"><Icon className="size-6" aria-hidden /></span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8"><ButtonLink href="/conference">Know More</ButtonLink></div>
        </Reveal>
      </div>
    </section>
  );
}

export function WhySection() {
  const icons = [MapPin, BedDouble, UtensilsCrossed, PartyPopper];
  return (
    <Section>
      <SectionHead title="Why Choose Hotel KP?" sub="Your perfect destination for comfortable stays, delicious food and memorable events in Rasra, Ballia." />
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {WHY.map((w, i) => {
          const Icon = icons[i];
          return (
            <li key={w.title}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="h-full rounded-2xl bg-white p-5 text-center shadow-card ring-1 ring-line sm:p-7">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-sand text-brass-deep"><Icon className="size-6" aria-hidden /></span>
                  <h3 className="mt-4 text-xl text-green sm:text-2xl">{w.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{w.desc}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function GalleryStrip() {
  const items = GALLERY.slice(0, 7);
  return (
    <section className="bg-green py-14 text-white sm:py-20">
      <div className="container-x grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <h2 className="text-4xl text-white sm:text-5xl">Our Gallery</h2>
          <p className="mt-3 text-white/75">Take a glimpse of our rooms, restaurant and event venues.</p>
          <div className="mt-6"><ButtonLink href="/gallery" variant="gold">View Gallery</ButtonLink></div>
        </div>
        <ul className="-mr-4 flex snap-x gap-3 overflow-x-auto pb-2 scrollbar-none sm:-mr-6 lg:-mr-[max(2rem,calc((100vw-76rem)/2+2rem))]">
          {items.map((g) => (
            <li key={g.id} className="w-44 shrink-0 snap-start sm:w-52">
              <Link href="/gallery" className="group block overflow-hidden rounded-xl ring-1 ring-white/20">
                <Photo src={g.photo} alt={g.title} sizes="208px" className="aspect-[3/4] [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-110" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OffersSection() {
  return (
    <Section tone="white">
      <SectionHead title="Special Offers" sub="Enjoy exclusive offers on stays, dining and events." href="/offers" linkLabel="View All Offers" />
      <ul className="grid gap-5 md:grid-cols-3">
        {OFFERS.map((o, i) => (
          <li key={o.id}>
            <Reveal delay={i * 0.08} className="h-full">
              <OfferCard offer={o} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function OfferCard({ offer: o }: { offer: Offer }) {
  return (
    <article className="flex h-full overflow-hidden rounded-2xl bg-ivory shadow-card ring-1 ring-line">
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl text-green">{o.title}</h3>
        <p className="mt-1.5 text-sm text-muted">{o.desc}</p>
        <Link href={o.href} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-bold text-green hover:text-action">
          {o.cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="relative w-2/5 shrink-0">
        <Photo src={o.image} alt="" sizes="200px" className="absolute inset-0" />
        <span className="absolute right-2 top-2 rounded-lg bg-brass px-2.5 py-1 text-center text-xs font-bold leading-tight text-ink shadow">{o.badge}</span>
      </div>
    </article>
  );
}

export function Testimonials() {
  return (
    <Section tone="sand">
      <SectionHead title="What Our Guests Say" center />
      <ul className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <li key={t.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card ring-1 ring-line">
                <Quote className="size-8 text-brass" aria-hidden />
                <blockquote className="mt-3 flex-1 text-[0.98rem] text-ink/85">“{t.quote}”</blockquote>
                <div className="mt-4 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-brass text-brass" aria-hidden />)}
                </div>
                <figcaption className="mt-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-green font-display text-lg font-bold text-white" aria-hidden>{t.name[0]}</span>
                  <span className="text-sm"><b className="block text-green">{t.name}</b><span className="text-muted">{t.role}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function PlanCta() {
  return (
    <section className="relative isolate overflow-hidden bg-green-900 py-16 text-center text-white sm:py-24">
      <Photo src={IMAGES.home.pool} alt="" sizes="100vw" className="absolute inset-0 -z-10 opacity-30" />
      <Reveal className="container-x">
        <h2 className="mx-auto max-w-2xl text-4xl text-white sm:text-6xl">Plan Your Stay or Event With Us</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/80">We are here to make your experience special and memorable.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/rooms" size="lg">Book Now <ArrowRight className="size-4" aria-hidden /></ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="light">Talk to Us</ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}

export { Check, Calendar, cn };
