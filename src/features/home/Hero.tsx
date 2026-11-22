import Link from "next/link";
import { BedDouble, Presentation, UtensilsCrossed, PartyPopper } from "lucide-react";
import { IMAGES } from "@/config/images";
import { SITE } from "@/config/site";
import { Photo } from "@/components/ui/Photo";
import { BookingWidget } from "@/features/booking/BookingWidget";

const FEATURES = [
  { href: "/rooms", label: "Comfortable Rooms", Icon: BedDouble },
  { href: "/dining", label: "Multi-Cuisine Restaurant", Icon: UtensilsCrossed },
  { href: "/banquets", label: "Banquet & Events", Icon: PartyPopper },
  { href: "/conference", label: "Conference Facilities", Icon: Presentation },
];

export function Hero() {
  return (
    <section className="relative">
      <div className="relative isolate overflow-hidden bg-green-900">
        <Photo src={IMAGES.home.hero} alt="Hotel KP & Restaurant at dusk with the pool in the foreground" priority sizes="100vw" className="absolute inset-0 -z-10 [&_img]:object-[50%_60%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-900/90 via-green-900/55 to-green-900/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-green-900/80 via-transparent to-green-900/40" />

        <div className="container-x pb-40 pt-32 sm:pb-44 sm:pt-44 lg:pb-52 lg:pt-52">
          <p className="eyebrow flex animate-fade-up items-center gap-3 text-brass-light">
            <span className="h-px w-8 bg-brass-light" aria-hidden /> Welcome to <span className="h-px w-8 bg-brass-light sm:hidden" aria-hidden />
          </p>
          <h1 className="mt-4 max-w-2xl animate-fade-up text-[3rem] leading-[1.02] text-white [animation-delay:80ms] sm:text-7xl lg:text-[5.5rem]">
            Hotel KP <span className="text-brass-light">&amp;</span> Restaurant
          </h1>
          <p className="mt-5 max-w-md animate-fade-up text-lg text-white/85 [animation-delay:160ms] sm:text-xl">
            {SITE.tagline.split(". ").slice(0, 2).join(". ")}.<br />
            {SITE.tagline.split(". ")[2]}
          </p>

          <ul className="mt-8 grid max-w-xl animate-fade-up grid-cols-4 gap-2 [animation-delay:240ms] sm:gap-4">
            {FEATURES.map(({ href, label, Icon }) => (
              <li key={label}>
                <Link href={href} className="group flex flex-col items-center gap-2 text-center text-[0.68rem] font-semibold leading-tight text-white/90 sm:text-xs">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur transition-all group-hover:bg-brass group-hover:text-ink sm:size-14">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x relative z-10 -mt-28 sm:-mt-32">
        <BookingWidget className="mx-auto max-w-5xl" />
      </div>
    </section>
  );
}
