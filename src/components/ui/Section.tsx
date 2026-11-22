import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/ui/Photo";

export function Section({ children, className, tone = "ivory", id }: { children: ReactNode; className?: string; tone?: "ivory" | "sand" | "green" | "white"; id?: string }) {
  const tones = { ivory: "bg-ivory", sand: "bg-sand-soft", green: "bg-green text-white", white: "bg-white" };
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 sm:py-20", tones[tone], className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, sub, href, linkLabel, light, center }: { eyebrow?: string; title: string; sub?: string; href?: string; linkLabel?: string; light?: boolean; center?: boolean }) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10", center && "justify-center text-center")}>
      <div className={cn(center && "mx-auto max-w-2xl")}>
        {eyebrow && <p className={cn("eyebrow mb-3", light ? "text-brass-light" : "text-brass-deep")}>{eyebrow}</p>}
        <h2 className={cn("text-[2.1rem] sm:text-5xl", light ? "text-white" : "text-green")}>{title}</h2>
        {sub && <p className={cn("mt-3 max-w-xl text-[0.98rem]", light ? "text-white/75" : "text-muted")}>{sub}</p>}
      </div>
      {href && (
        <Link href={href} className={cn("group inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors", light ? "border-white/40 text-white hover:bg-white hover:text-green" : "border-line bg-white text-green hover:border-green")}>
          {linkLabel ?? "View all"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, sub, image, children }: { eyebrow: string; title: string; sub?: string; image: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-green-900 text-white">
      <Photo src={image} alt="" priority sizes="100vw" className="absolute inset-0 -z-10 opacity-50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-green-900 via-green-900/60 to-green-900/30" />
      <div className="container-x pb-14 pt-32 sm:pb-20 sm:pt-44">
        <p className="eyebrow mb-4 text-brass-light">{eyebrow}</p>
        <h1 className="max-w-3xl text-[2.6rem] text-white sm:text-6xl">{title}</h1>
        {sub && <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">{sub}</p>}
        {children}
      </div>
    </section>
  );
}
