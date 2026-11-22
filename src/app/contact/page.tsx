import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { IMAGES } from "@/config/images";
import { SITE } from "@/config/site";
import { PageHero, Section } from "@/components/ui/Section";
import { ContactForm } from "@/features/enquiries/ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with Hotel KP & Restaurant, Rasra, Ballia." };

export default function ContactPage() {
  const items = [
    { Icon: Phone, label: "Call us", value: SITE.phone, href: SITE.phoneHref },
    { Icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { Icon: MapPin, label: "Visit", value: SITE.address, href: SITE.mapsHref },
    { Icon: Clock, label: "Front desk", value: "Open 24 hours · Check-in 12 PM · Check-out 11 AM" },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" sub="Questions about a stay, an event or a table? Our team replies within one business day." image={IMAGES.home.pool} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
          <ul className="space-y-4">
            {items.map(({ Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sand text-green"><Icon className="size-5" aria-hidden /></span>
                  <span className="text-sm"><b className="block text-ink">{label}</b><span className="break-words text-muted">{value}</span></span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line transition-shadow hover:shadow-lift">{body}</a>
                  ) : (
                    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-line sm:p-8">
            <h2 className="mb-6 text-3xl text-green">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
