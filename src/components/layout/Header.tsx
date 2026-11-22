"use client";

import Link from "next/link";
import { usePath } from "@/hooks/usePath";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { Facebook, Instagram, WhatsApp, Youtube } from "@/components/ui/BrandIcons";
import { cn } from "@/lib/cn";
import { NAV, SITE } from "@/config/site";
import { routes } from "@/config/routes";
import { useRooms } from "@/hooks/useRooms";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

/** Routes whose first screen is a dark hero image, the header floats over it. */
const OVERLAY = ["/", "/dining", "/banquets", "/conference", "/gallery", "/offers", "/about", "/contact"];

export function Social({ className }: { className?: string }) {
  const items = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: WhatsApp, label: "WhatsApp", href: SITE.whatsapp },
    { Icon: Youtube, label: "YouTube" },
  ];
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {items.map(({ Icon, label, href }) => (
        <a key={label} href={href ?? "#"} aria-label={label} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-white/15">
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}

export function Header() {
  const pathname = usePath();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const overlay = OVERLAY.includes(pathname);
  const solid = !overlay || scrolled;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  if (pathname.startsWith("/admin") || pathname === "/checkout") return null;

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", solid ? "bg-ivory/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl" : "bg-transparent")}>
        <div className={cn("hidden bg-green-900 text-[0.76rem] text-white/85 transition-all duration-300 lg:block", scrolled && "-mt-9")}>
          <div className="container-x flex h-9 items-center justify-between">
            <div className="flex items-center gap-6">
              <a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-white"><Phone className="size-3.5" aria-hidden /> {SITE.phone}</a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="size-3.5" aria-hidden /> {SITE.email}</a>
              <a href={SITE.mapsHref} className="flex items-center gap-2 hover:text-white"><MapPin className="size-3.5" aria-hidden /> Pani Tanki Road, Rasra, Ballia – 221712, Uttar Pradesh</a>
            </div>
            <Social className="-mr-2 [&_a]:size-8" />
          </div>
        </div>

        <div className="container-x flex h-[4.25rem] items-center justify-between gap-6 lg:h-[4.75rem]">
          <Link href="/" aria-label="Hotel KP & Restaurant, home">
            <Logo light={!solid} compact />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
            {[{ href: "/", label: "Home" }, { href: "/about", label: "About" }, ...NAV, { href: "/contact", label: "Contact" }].map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[0.88rem] font-semibold transition-colors",
                    solid ? "text-ink/80 hover:text-green" : "text-white/90 hover:text-white",
                    active && (solid ? "text-green" : "text-white"),
                  )}
                >
                  {l.label}
                  {active && <span className={cn("absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full", solid ? "bg-brass" : "bg-brass-light")} />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/rooms" size="sm" className="hidden sm:inline-flex">Book Now</ButtonLink>
            <button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className={cn("grid size-11 place-items-center rounded-full transition-colors xl:hidden", solid ? "text-green hover:bg-sand" : "text-white hover:bg-white/15")}
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rooms, setRooms] = useState(false);
  const { rooms: roomList } = useRooms();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const link = "flex min-h-12 items-center justify-between rounded-xl px-4 text-[1.02rem] font-semibold text-ink hover:bg-sand-soft active:bg-sand-soft";

  return (
    <div className={cn("fixed inset-0 z-[80] xl:hidden", open ? "visible" : "invisible delay-300")} aria-hidden={!open}>
      <div onClick={onClose} className={cn("absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn("absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-ivory shadow-lift transition-transform duration-300 ease-out", open ? "translate-x-0" : "translate-x-full")}
      >
        <div className="flex h-[4.25rem] items-center justify-between px-5">
          <Logo compact />
          <button ref={closeRef} onClick={onClose} aria-label="Close menu" className="grid size-11 place-items-center rounded-full text-green hover:bg-sand">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Mobile">
          <Link href="/" className={link} onClick={onClose}>Home</Link>
          <Link href="/about" className={link} onClick={onClose}>About Us</Link>
          <button className={cn(link, "w-full")} aria-expanded={rooms} onClick={() => setRooms((v) => !v)}>
            Rooms &amp; Suites <ChevronDown className={cn("size-5 transition-transform", rooms && "rotate-180")} aria-hidden />
          </button>
          {rooms && (
            <div className="mb-1 ml-4 border-l-2 border-brass/40 pl-2">
              <Link href="/rooms" className="flex min-h-11 items-center rounded-lg px-3 text-[0.95rem] text-muted hover:text-green" onClick={onClose}>All rooms</Link>
              {roomList.map((r) => (
                <Link key={r.slug} href={routes.room(r.slug)} className="flex min-h-11 items-center rounded-lg px-3 text-[0.95rem] text-muted hover:text-green" onClick={onClose}>{r.name}</Link>
              ))}
            </div>
          )}
          <Link href="/dining" className={link} onClick={onClose}>Restaurant</Link>
          <Link href="/banquets" className={link} onClick={onClose}>Banquets &amp; Events</Link>
          <Link href="/conference" className={link} onClick={onClose}>Conference</Link>
          <Link href="/gallery" className={link} onClick={onClose}>Gallery</Link>
          <Link href="/offers" className={link} onClick={onClose}>Offers</Link>
          <Link href="/contact" className={link} onClick={onClose}>Contact</Link>
        </nav>
        <div className="space-y-4 border-t border-line bg-white p-5 pb-safe">
          <ButtonLink href="/rooms" size="lg" className="w-full" onClick={onClose}>Book Now</ButtonLink>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><a href={SITE.phoneHref} className="flex items-center gap-3"><Phone className="size-4 text-green" aria-hidden /> {SITE.phone}</a></li>
            <li><a href={SITE.mapsHref} className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-green" aria-hidden /> {SITE.address}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="flex items-center gap-3"><Mail className="size-4 text-green" aria-hidden /> {SITE.email}</a></li>
          </ul>
          <Social className="-ml-2 text-green [&_a:hover]:bg-sand" />
        </div>
      </aside>
    </div>
  );
}
