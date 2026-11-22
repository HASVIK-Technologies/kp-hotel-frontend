"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BedDouble, CalendarDays, Check, ChevronDown, Eye, Maximize2, ShieldCheck, Users, Wifi } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipList } from "@/components/ui/Chip";
import { Photo } from "@/components/ui/Photo";
import { Popover } from "@/components/ui/Popover";
import { Section, SectionHead } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stepper } from "@/components/ui/Stepper";
import { StarRating } from "@/components/ui/StarRating";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { SITE } from "@/config/site";
import { RangeCalendar } from "@/features/booking/RangeCalendar";
import { useCatalog } from "@/hooks/useCatalog";
import { useHydrated } from "@/hooks/useHydrated";
import { useQuote } from "@/hooks/useQuote";
import { useRoom, useRooms } from "@/hooks/useRooms";
import { cn } from "@/lib/cn";
import { fmtShort, inr, plural } from "@/lib/format";
import { searchSchema } from "@/lib/schemas";
import { publicApi } from "@/services/api";
import { useStore } from "@/store/booking-store";
import { RoomCard } from "./RoomCard";

/** Room details page (`/rooms/details?slug=…`): gallery, facts, live quote and reserve panel. */
export function RoomDetailClient() {
  const slug = useSearchParams().get("slug");
  const { room, loading, notFound, error } = useRoom(slug);

  if (loading) {
    return (
      <div className="container-x grid gap-8 pb-28 pt-28 lg:grid-cols-[1fr_24rem] lg:pt-32">
        <Skeleton className="h-[28rem]" />
        <Skeleton className="h-[30rem]" />
      </div>
    );
  }
  if (error || notFound || !room) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center pt-28 text-center">
        <div>
          <h1 className="text-4xl text-green">{error ? "We couldn't load this room" : "Room not found"}</h1>
          <p className="mt-2 text-muted">{error ? error.message : "It may have been removed or renamed."}</p>
          <ButtonLink href={routes.rooms} className="mt-6">Browse all rooms</ButtonLink>
        </div>
      </div>
    );
  }
  return <RoomDetail room={room} />;
}

function RoomDetail({ room }: { room: NonNullable<ReturnType<typeof useRoom>["room"]> }) {
  const router = useRouter();
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const { search, setSearch, draft, setDraft } = useStore();
  const { ratePlans, ratePlan: findPlan } = useCatalog();
  const { rooms } = useRooms();
  const [checking, setChecking] = useState(false);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<"dates" | "guests" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ci = sp.get("ci"), co = sp.get("co");
    if (ci && co) setSearch({ checkIn: ci, checkOut: co, adults: Number(sp.get("a")) || 2, children: Number(sp.get("c")) || 0, rooms: Number(sp.get("r")) || 1 });
  }, [sp, setSearch]);

  const ci = hydrated ? search.checkIn : undefined;
  const co = hydrated ? search.checkOut : undefined;
  const planId = draft.ratePlan;
  const plan = findPlan(planId);
  const guests = search.adults + search.children;
  const overCapacity = guests > room.maxGuests * search.rooms;
  const available = room.active;

  const { quote, loading: quoting } = useQuote(ci && co ? { roomSlug: room.slug, checkIn: ci, checkOut: co, rooms: search.rooms, ratePlan: planId, addonIds: [] } : null);

  const reserve = async () => {
    const r = searchSchema.safeParse(search);
    const map: Record<string, string> = {};
    if (!r.success) for (const i of r.error.issues) map[String(i.path[0])] ??= i.message;
    if (overCapacity) map.adults = `This room sleeps ${room.maxGuests}. Add another room or choose a larger one.`;
    setErrors(map);
    if (Object.keys(map).length) {
      document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setChecking(true);
    try {
      const a = await publicApi.quote({ roomSlug: room.slug, checkIn: search.checkIn!, checkOut: search.checkOut!, rooms: search.rooms, ratePlan: planId });
      if (a.soldOut) {
        setErrors({ checkIn: a.available > 0 ? `Only ${a.available} room${a.available > 1 ? "s" : ""} left for these dates, reduce rooms or change dates.` : "Sold out for these dates. Please try different dates." });
        return;
      }
    } catch {
      /* API unreachable: let checkout report it */
    } finally {
      setChecking(false);
    }
    setDraft({ roomSlug: room.slug, ratePlan: planId, addonIds: [] });
    router.push(routes.checkout);
  };

  const others = rooms.filter((r) => r.slug !== room.slug && r.active).slice(0, 3);

  return (
    <>
      <div className="container-x pb-28 pt-[5.75rem] sm:pt-28 lg:pb-12 lg:pt-32">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href={routes.home} className="hover:text-green">Home</Link></li><li aria-hidden>/</li>
            <li><Link href={routes.rooms} className="hover:text-green">Rooms</Link></li><li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-green">{room.name}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-10">
          <div>
            {/* gallery */}
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <Photo src={roomImageUrl(room.images[active])} alt={`${room.name}, photo ${active + 1}`} priority sizes="(min-width:1024px) 640px, 100vw" className="aspect-[4/3] rounded-3xl shadow-card sm:aspect-[16/11]" />
              <ul className="flex gap-3 sm:flex-col">
                {room.images.map((name, i) => (
                  <li key={name + i} className="flex-1">
                    <button onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={active === i} className={cn("block size-full overflow-hidden rounded-2xl ring-2 transition-all", active === i ? "ring-brass" : "opacity-80 ring-transparent hover:opacity-100")}>
                      <Photo src={roomImageUrl(name)} alt="" sizes="144px" className="aspect-[4/3] size-full sm:aspect-auto sm:h-full" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow text-brass-deep">{room.name}</p>
                <StarRating rating={room.rating} reviews={room.reviews} variant="row" />
              </div>
              <h1 className="mt-2 text-4xl text-green sm:text-5xl">{room.headline}</h1>
              <ChipList
                size="md"
                className="mt-5"
                items={[
                  { Icon: Maximize2, label: `${room.size} sqm` },
                  { Icon: BedDouble, label: room.beds },
                  { Icon: Eye, label: `${room.view} view` },
                  { Icon: Users, label: `Sleeps ${room.maxGuests}` },
                  ...(room.amenityFlags.includes("WiFi") ? [{ Icon: Wifi, label: "Free Wi-Fi" }] : []),
                ]}
              />
              <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-ink/80">{room.description}</p>

              <h2 className="eyebrow mt-10 text-green">Amenities</h2>
              <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {room.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-3 text-[0.95rem] text-ink/85">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-green text-white"><Check className="size-3" strokeWidth={3} aria-hidden /></span> {a}
                  </li>
                ))}
              </ul>

              <div className="mt-10 grid gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-line sm:grid-cols-3">
                {[["Check-in", `From ${SITE.checkInTime}`], ["Check-out", `Until ${SITE.checkOutTime}`], ["Cancellation", "Free until 48h before (room only)"]].map(([k, v]) => (
                  <div key={k}><p className="eyebrow text-muted">{k}</p><p className="mt-1 text-sm font-semibold text-green">{v}</p></div>
                ))}
              </div>
            </div>
          </div>

          {/* booking panel */}
          <aside id="reserve" className="scroll-mt-28">
            <div className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-line lg:sticky lg:top-28">
              <p className="eyebrow text-muted">Your stay</p>

              <div className="relative mt-3">
                <button type="button" onClick={() => setOpen(open === "dates" ? null : "dates")} aria-haspopup="dialog" aria-expanded={open === "dates"} className={cn("flex min-h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition-colors hover:border-green", errors.checkIn || errors.checkOut ? "border-danger" : "border-line")}>
                  <span>
                    <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted">Dates</span>
                    <span className="text-[0.95rem] font-semibold">{ci && co ? `${fmtShort(ci)} → ${fmtShort(co)}` : "Select check-in & check-out"}</span>
                  </span>
                  <CalendarDays className="size-5 text-green" aria-hidden />
                </button>
                {(errors.checkIn || errors.checkOut) && <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{errors.checkIn ?? errors.checkOut}</p>}
                <Popover open={open === "dates"} onClose={() => setOpen(null)} title="Select your dates" className="md:left-auto md:right-0 md:w-[22rem]">
                  <RangeCalendar from={search.checkIn} to={search.checkOut} onChange={(v) => setSearch({ checkIn: v.from, checkOut: v.to })} onDone={() => setOpen(null)} />
                </Popover>
              </div>

              <div className="relative mt-3">
                <button type="button" onClick={() => setOpen(open === "guests" ? null : "guests")} aria-haspopup="dialog" aria-expanded={open === "guests"} className={cn("flex min-h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition-colors hover:border-green", errors.adults ? "border-danger" : "border-line")}>
                  <span>
                    <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted">Guests</span>
                    <span className="text-[0.95rem] font-semibold">{plural(guests, "Guest")} · {plural(search.rooms, "Room")}</span>
                  </span>
                  <ChevronDown className="size-5 text-green" aria-hidden />
                </button>
                {errors.adults && <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{errors.adults}</p>}
                <Popover open={open === "guests"} onClose={() => setOpen(null)} title="Rooms & guests" className="md:left-auto md:right-0 md:w-80">
                  <div className="divide-y divide-line">
                    <Stepper label="Rooms" min={1} max={5} value={search.rooms} onChange={(rooms) => setSearch({ rooms, adults: Math.max(search.adults, rooms) })} />
                    <Stepper label="Adults" min={Math.max(1, search.rooms)} max={8} value={search.adults} onChange={(adults) => setSearch({ adults })} />
                    <Stepper label="Children" min={0} max={6} value={search.children} onChange={(children) => setSearch({ children })} />
                  </div>
                  <Button type="button" className="mt-4 w-full" onClick={() => setOpen(null)}>Done</Button>
                </Popover>
              </div>

              <fieldset className="mt-6">
                <legend className="eyebrow mb-3 text-muted">Rate plan</legend>
                <div className="space-y-2.5">
                  {ratePlans.map((p) => (
                    <label key={p.id} className={cn("flex min-h-[4.25rem] cursor-pointer items-start gap-3 rounded-xl border-[1.5px] p-3.5 transition-colors", planId === p.id ? "border-brass bg-sand" : "border-line hover:border-green/40")}>
                      <input type="radio" name="plan" value={p.id} checked={planId === p.id} onChange={() => setDraft({ ratePlan: p.id })} className="peer sr-only" />
                      <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", planId === p.id ? "border-green" : "border-line")} aria-hidden>
                        {planId === p.id && <span className="size-2.5 rounded-full bg-green" />}
                      </span>
                      <span className="flex-1">
                        <span className="flex justify-between gap-2 font-semibold text-ink">{p.name}{p.perNight > 0 && <span className="text-sm text-green">+{inr(p.perNight)}/night</span>}</span>
                        <span className="text-xs text-muted">{p.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={cn("mt-6 rounded-xl bg-sand-soft p-4 text-sm transition-opacity", quoting && "opacity-60")} aria-live="polite">
                {quote && ci && co ? (
                  <dl className="space-y-1.5">
                    {quote.lines.map((l) => (
                      <div key={l.label} className="flex justify-between gap-3"><dt className="text-muted">{l.label}</dt><dd className="font-medium tabular-nums">{l.amount < 0 ? "−" : ""}{inr(Math.abs(l.amount))}</dd></div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-line pt-2.5 text-base font-bold text-green"><dt>Total</dt><dd className="tabular-nums">{inr(quote.total)}</dd></div>
                  </dl>
                ) : (
                  <p className="text-muted">Select dates to see your total, including taxes. From <b className="text-green">{inr(room.price)}</b> / night.</p>
                )}
              </div>

              <Button size="lg" className="mt-5 w-full" onClick={reserve} disabled={!available} loading={checking}>
                {available ? "Reserve Now" : "Sold out for now"}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs italic text-muted">
                <ShieldCheck className="size-3.5" aria-hidden /> {plan?.refundable ? "Free cancellation until 48h before check-in" : "Non-refundable rate · best price"}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {others.length > 0 && (
        <Section tone="sand">
          <SectionHead title="You may also like" href={routes.rooms} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r) => <li key={r.slug}><RoomCard room={r} className="h-full" /></li>)}
          </ul>
        </Section>
      )}

      {/* mobile sticky CTA, p.12 of the deck */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 pb-safe backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <p className="leading-tight"><span className="text-xs text-muted">From</span><span className="price block text-xl text-green">{inr(room.price)}<span className="font-sans text-xs font-normal text-muted"> / night</span></span></p>
          <Button onClick={() => document.getElementById("reserve")?.scrollIntoView({ behavior: "smooth" })} size="lg">Reserve Now</Button>
        </div>
      </div>
    </>
  );
}
