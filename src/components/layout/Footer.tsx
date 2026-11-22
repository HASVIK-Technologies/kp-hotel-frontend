"use client";

import Link from "next/link";
import { usePath } from "@/hooks/usePath";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SITE } from "@/config/site";
import { newsletterSchema } from "@/lib/schemas";
import { publicApi } from "@/services/api";
import { Social } from "@/components/layout/Header";

export function Footer() {
  const pathname = usePath();
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const links = [
    ["Home", "/"], ["About Us", "/about"], ["Rooms", "/rooms"], ["Restaurant", "/dining"], ["Banquets", "/banquets"],
    ["Conference", "/conference"], ["Gallery", "/gallery"], ["Offers", "/offers"], ["Contact", "/contact"],
  ] as const;

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = newsletterSchema.safeParse({ email: new FormData(e.currentTarget).get("email") });
    if (!r.success) return setErr(r.error.issues[0].message);
    setErr("");
    try {
      await publicApi.subscribeNewsletter(r.data.email);
      setOk(true);
    } catch (x) {
      setErr((x as Error).message);
    }
  };

  return (
    <footer className="bg-green-900 pb-24 text-white/80 md:pb-0">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1.3fr]">
        <div>
          <Link href="/"><Logo light /></Link>
          <p className="mt-5 max-w-xs text-[0.92rem] leading-relaxed text-white/70">
            Your trusted destination for comfortable stays, delicious food and memorable events in Rasra, Ballia.
          </p>
          <Social className="mt-5 gap-2 [&_a]:size-11 [&_a]:bg-white/10 [&_a]:ring-1 [&_a]:ring-white/15 [&_a:hover]:bg-brass [&_a:hover]:text-ink [&_svg]:size-5 text-white" />
        </div>

        <nav aria-label="Footer">
          <h3 className="font-display text-xl text-white">Quick Links</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 sm:block sm:space-y-1">
            {links.map(([l, h]) => (
              <li key={l}><Link href={h} className="inline-flex min-h-9 items-center text-[0.92rem] transition-colors hover:text-brass-light">{l}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-xl text-white">Contact Us</h3>
          <ul className="mt-4 space-y-3.5 text-[0.92rem]">
            <li><a href={SITE.mapsHref} className="flex gap-3 hover:text-brass-light"><MapPin className="mt-1 size-4 shrink-0 text-brass-light" aria-hidden /> {SITE.address}</a></li>
            <li><a href={SITE.phoneHref} className="flex gap-3 hover:text-brass-light"><Phone className="mt-1 size-4 shrink-0 text-brass-light" aria-hidden /> {SITE.phone}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="flex gap-3 break-all hover:text-brass-light"><Mail className="mt-1 size-4 shrink-0 text-brass-light" aria-hidden /> {SITE.email}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-white">Newsletter</h3>
          <p className="mt-4 text-[0.92rem]">Get updates on offers and events.</p>
          {ok ? (
            <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 p-3 text-sm text-white"><CheckCircle2 className="size-4 text-brass-light" aria-hidden /> Thank you, you&apos;re on the list.</p>
          ) : (
            <form onSubmit={subscribe} noValidate className="mt-4">
              <div className="flex overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20 focus-within:ring-brass">
                <label htmlFor="nl" className="sr-only">Email address</label>
                <input id="nl" name="email" type="email" autoComplete="email" placeholder="Your email address" aria-invalid={!!err} aria-describedby={err ? "nl-err" : undefined} className="min-h-12 min-w-0 flex-1 bg-transparent px-5 text-base text-white placeholder:text-white/50 focus:outline-none" />
                <button aria-label="Subscribe" className="m-1 grid size-10 place-items-center rounded-full bg-brass text-ink transition-colors hover:bg-brass-light"><ArrowRight className="size-5" aria-hidden /></button>
              </div>
              {err && <p id="nl-err" role="alert" className="mt-2 text-sm text-red-300">{err}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-[0.8rem] text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Hotel KP &amp; Restaurant. All Rights Reserved.</p>
          <p className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/manage-booking" className="hover:text-white">Manage Booking</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
