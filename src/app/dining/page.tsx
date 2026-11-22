import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { IMAGES } from "@/config/images";
import { DINING_HOURS } from "@/content/dining";
import { PageHero, Section } from "@/components/ui/Section";
import { Photo } from "@/components/ui/Photo";
import { MenuTabs } from "@/features/dining/MenuTabs";
import { TableForm } from "@/features/enquiries/TableForm";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Multi-cuisine all-day dining at Hotel KP. Explore the menu and reserve a table in one page.",
};

export default function DiningPage() {
  return (
    <>
      <PageHero eyebrow="Our Restaurant" title="All-Day Dining, Multi-Cuisine" sub="Fresh ingredients, generous plates and warm hospitality from breakfast through late dinner." image={IMAGES.dining.dishes} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
          <div>
            <MenuTabs />
            <Link href="/dining#menu" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-green hover:text-action">View full menu <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <aside className="space-y-5">
            <div id="reserve" className="scroll-mt-28 rounded-3xl bg-white p-6 shadow-lift ring-1 ring-line">
              <h2 className="eyebrow mb-5 text-brass-deep">Reserve a table</h2>
              <TableForm />
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-line">
              <h2 className="eyebrow mb-4 flex items-center gap-2 text-brass-deep"><Clock className="size-4" aria-hidden /> Hours</h2>
              <dl className="space-y-2.5 text-sm">
                {DINING_HOURS.map((h) => (
                  <div key={h.label} className="flex justify-between"><dt className="text-muted">{h.label}</dt><dd className="font-bold text-ink">{h.time}</dd></div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </Section>
      <section className="grid grid-cols-3 gap-1 sm:gap-3" aria-label="Restaurant photos">
        {[IMAGES.dining.restaurant, IMAGES.dining.terrace, IMAGES.dining.dishes].map((src, i) => <Photo key={i} src={src} alt="" className="aspect-[4/3]" sizes="33vw" />)}
      </section>
    </>
  );
}
