"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarDays, ChevronDown, Presentation, Search, UtensilsCrossed, Users, PartyPopper, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/store/booking-store";
import { useHydrated } from "@/hooks/useHydrated";
import { searchSchema, tableSchema, banquetSchema, conferenceSchema } from "@/lib/schemas";
import { fmtShort, plural } from "@/lib/format";
import { EVENT_TYPES } from "@/content/events";
import { TABLE_TIMES } from "@/content/dining";
import { Popover } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Field";
import { RangeCalendar } from "@/features/booking/RangeCalendar";
import { Stepper } from "@/components/ui/Stepper";
import { routes } from "@/config/routes";

const TABS = [
  { id: "stay", label: "Hotel Stay", icon: BedDouble },
  { id: "dine", label: "Restaurant", icon: UtensilsCrossed },
  { id: "banquet", label: "Banquet", icon: PartyPopper },
  { id: "conf", label: "Conference", icon: Presentation },
] as const;
type Tab = (typeof TABS)[number]["id"];

const label = "text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted";
const trigger =
  "group flex min-h-[3.6rem] w-full flex-col justify-center rounded-xl border border-line bg-white px-4 py-2 text-left transition-colors hover:border-green focus-visible:border-green md:border-0 md:bg-transparent md:px-5 md:hover:bg-sand-soft/70";

export function BookingWidget({ className }: { className?: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { search, setSearch, setPrefill } = useStore();
  const [tab, setTab] = useState<Tab>("stay");
  const [open, setOpen] = useState<"dates" | "guests" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // non-stay local state
  const [single, setSingle] = useState<string | undefined>();
  const [time, setTime] = useState("20:00");
  const [guests, setGuests] = useState(2);
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);

  const close = () => setOpen(null);
  const showErr = (r: { error: { issues: { path: PropertyKey[]; message: string }[] } }) => {
    const map: Record<string, string> = {};
    for (const i of r.error.issues) map[String(i.path[0])] ??= i.message;
    setErrors(map);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (tab === "stay") {
      const r = searchSchema.safeParse(search);
      if (!r.success) return showErr(r);
      const q = new URLSearchParams({ ci: r.data.checkIn, co: r.data.checkOut, a: String(r.data.adults), c: String(r.data.children), r: String(r.data.rooms) });
      router.push(`${routes.rooms}?${q}`);
    } else if (tab === "dine") {
      const r = tableSchema.pick({ date: true, time: true, guests: true }).safeParse({ date: single, time, guests });
      if (!r.success) return showErr(r);
      setPrefill({ date: r.data.date, time: r.data.time, guests: r.data.guests });
      router.push("/dining#reserve");
    } else if (tab === "banquet") {
      const r = banquetSchema.pick({ eventType: true, date: true, guests: true }).safeParse({ eventType, date: single, guests: Math.max(guests, 20) });
      if (!r.success) return showErr(r);
      setPrefill({ date: r.data.date, guests: r.data.guests, eventType: r.data.eventType });
      router.push("/banquets#enquire");
    } else {
      const r = conferenceSchema.pick({ date: true, attendees: true }).safeParse({ date: single, attendees: Math.max(guests, 5) });
      if (!r.success) return showErr(r);
      setPrefill({ date: r.data.date, guests: r.data.attendees });
      router.push("/conference#enquiry");
    }
  };

  const ci = hydrated ? search.checkIn : undefined;
  const co = hydrated ? search.checkOut : undefined;
  const totalGuests = search.adults + search.children;

  const dateButton = (which: "in" | "out") => {
    const v = which === "in" ? ci : co;
    const err = errors[which === "in" ? "checkIn" : "checkOut"];
    return (
      <div className="flex-1">
        <button type="button" className={cn(trigger, err && "border-danger")} onClick={() => setOpen(open === "dates" ? null : "dates")} aria-haspopup="dialog" aria-expanded={open === "dates"}>
          <span className={label}>{which === "in" ? "Check In" : "Check Out"}</span>
          <span className={cn("flex items-center justify-between gap-2 text-[0.95rem] font-semibold", v ? "text-ink" : "text-muted")}>
            {v ? fmtShort(v) : "Select date"}
            <CalendarDays className="size-4 text-green" aria-hidden />
          </span>
        </button>
        {err && <p role="alert" className="mt-1 px-1 text-xs font-medium text-danger">{err}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className={cn("rounded-3xl bg-white shadow-lift ring-1 ring-line", className)} aria-label="Search and book">
      <div role="tablist" aria-label="What would you like to book?" className="flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setErrors({}); setOpen(null); }}
            className={cn(
              "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] font-semibold transition-colors sm:flex-row sm:gap-2 sm:text-sm",
              tab === t.id ? "text-green" : "text-muted hover:text-green",
            )}
          >
            <t.icon className="size-[1.15rem]" aria-hidden />
            <span>{t.label}</span>
            {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-green" />}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4">
        {tab === "stay" ? (
          <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch md:gap-0 md:divide-x md:divide-line">
            <div className="relative flex flex-1 flex-col gap-2.5 md:flex-row md:gap-0 md:divide-x md:divide-line">
              {dateButton("in")}
              {dateButton("out")}
              <Popover open={open === "dates"} onClose={close} title="Select your dates" className="md:w-[41rem]">
                <RangeCalendar
                  from={search.checkIn}
                  to={search.checkOut}
                  onChange={(v) => setSearch({ checkIn: v.from, checkOut: v.to })}
                  onDone={close}
                />
              </Popover>
            </div>
            <div className="relative flex-1">
              <button type="button" className={trigger} onClick={() => setOpen(open === "guests" ? null : "guests")} aria-haspopup="dialog" aria-expanded={open === "guests"}>
                <span className={label}>Rooms &amp; Guests</span>
                <span className="flex items-center justify-between gap-2 text-[0.95rem] font-semibold text-ink">
                  {plural(search.rooms, "Room")} · {plural(totalGuests, "Guest")}
                  <ChevronDown className="size-4 text-green" aria-hidden />
                </span>
              </button>
              {errors.rooms && <p role="alert" className="mt-1 px-1 text-xs font-medium text-danger">{errors.rooms}</p>}
              <Popover open={open === "guests"} onClose={close} title="Rooms & guests" className="md:w-80">
                <div className="divide-y divide-line">
                  <Stepper label="Rooms" min={1} max={5} value={search.rooms} onChange={(rooms) => setSearch({ rooms, adults: Math.max(search.adults, rooms) })} />
                  <Stepper label="Adults" sub="Age 13+" min={Math.max(1, search.rooms)} max={8} value={search.adults} onChange={(adults) => setSearch({ adults })} />
                  <Stepper label="Children" sub="Age 0–12" min={0} max={6} value={search.children} onChange={(children) => setSearch({ children })} />
                </div>
                <Button type="button" className="mt-4 w-full" onClick={close}>Done</Button>
              </Popover>
            </div>
            <Button type="submit" size="lg" className="md:ml-3 md:min-w-52">
              Search Availability <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 md:flex-row md:items-stretch md:gap-0 md:divide-x md:divide-line">
            {tab === "banquet" && (
              <div className="flex-1">
                <div className={trigger}>
                  <label htmlFor="w-event" className={label}>Event type</label>
                  <Select id="w-event" value={eventType} onChange={(e) => setEventType(e.target.value)} className="min-h-0 border-0 bg-transparent px-0 py-0 text-[0.95rem] font-semibold focus:ring-0">
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </div>
              </div>
            )}
            <div className="relative flex-1">
              <button type="button" className={cn(trigger, (errors.date) && "border-danger")} onClick={() => setOpen(open === "dates" ? null : "dates")} aria-haspopup="dialog" aria-expanded={open === "dates"}>
                <span className={label}>{tab === "dine" ? "Date" : "Event date"}</span>
                <span className={cn("flex items-center justify-between text-[0.95rem] font-semibold", single ? "text-ink" : "text-muted")}>
                  {single ? fmtShort(single) : "Select date"}
                  <CalendarDays className="size-4 text-green" aria-hidden />
                </span>
              </button>
              {errors.date && <p role="alert" className="mt-1 px-1 text-xs font-medium text-danger">{errors.date}</p>}
              <Popover open={open === "dates"} onClose={close} title="Select a date" className="md:w-[21rem]">
                <RangeCalendar mode="single" from={single} onChange={(v) => setSingle(v.from)} onDone={close} />
              </Popover>
            </div>
            {tab === "dine" && (
              <div className="flex-1">
                <div className={trigger}>
                  <label htmlFor="w-time" className={label}>Time</label>
                  <Select id="w-time" value={time} onChange={(e) => setTime(e.target.value)} className="min-h-0 border-0 bg-transparent px-0 py-0 text-[0.95rem] font-semibold focus:ring-0">
                    {TABLE_TIMES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className={cn(trigger, errors.guests && "border-danger")}>
                <label htmlFor="w-guests" className={label}>{tab === "conf" ? "Attendees" : "Guests"}</label>
                <Input id="w-guests" type="number" inputMode="numeric" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="min-h-0 border-0 bg-transparent p-0 text-[0.95rem] font-semibold focus:ring-0" />
              </div>
              {errors.guests && <p role="alert" className="mt-1 px-1 text-xs font-medium text-danger">{errors.guests}</p>}
            </div>
            <Button type="submit" size="lg" className="md:ml-3 md:min-w-52">
              {tab === "dine" ? "Find a Table" : "Check Availability"} <Search className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
