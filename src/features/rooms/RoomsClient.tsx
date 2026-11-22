"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BedDouble, Eye, Flame, Maximize2, Pencil, SearchX, SlidersHorizontal, Users } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ChipList } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Field";
import { Photo } from "@/components/ui/Photo";
import { Popover } from "@/components/ui/Popover";
import { CardSkeletons, LoadError } from "@/components/ui/Skeleton";
import { StarRating } from "@/components/ui/StarRating";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { BookingWidget } from "@/features/booking/BookingWidget";
import { useHydrated } from "@/hooks/useHydrated";
import { useRooms } from "@/hooks/useRooms";
import { cn } from "@/lib/cn";
import { fmtRange, inr, nightsBetween, plural } from "@/lib/format";
import { useStore } from "@/store/booking-store";
import { AMENITY_FLAGS, ROOM_TYPES, ROOM_VIEWS, type Amenity, type PublicRoom, type RoomType, type RoomView } from "@/types/api";

interface Filters {
  /** null = no price limit */
  max: number | null;
  types: RoomType[];
  views: RoomView[];
  amenities: Amenity[];
}
const initial: Filters = { max: null, types: [], views: [], amenities: [] };
type Sort = "recommended" | "price-asc" | "price-desc" | "rating";

export function RoomsClient() {
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const { search, setSearch } = useStore();
  const { rooms, loading, error, reload } = useRooms();
  const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState<Sort>("recommended");
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(false);

  // URL → store (shareable search links)
  useEffect(() => {
    const ci = sp.get("ci"), co = sp.get("co");
    if (ci && co) setSearch({ checkIn: ci, checkOut: co, adults: Number(sp.get("a")) || 2, children: Number(sp.get("c")) || 0, rooms: Number(sp.get("r")) || 1 });
  }, [sp, setSearch]);

  const guests = search.adults + search.children;
  const nights = hydrated ? nightsBetween(search.checkIn, search.checkOut) : 0;

  // price slider bounds follow the real prices (rounded to ₹100)
  const bounds = useMemo(() => {
    const prices = rooms.map((r) => r.price);
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.floor(Math.min(...prices) / 100) * 100, max: Math.ceil(Math.max(...prices) / 100) * 100 };
  }, [rooms]);
  const maxPrice = filters.max ?? bounds.max;

  const list = useMemo(() => {
    const out = rooms.filter(
      (r) =>
        r.price <= maxPrice &&
        (!filters.types.length || filters.types.includes(r.type)) &&
        (!filters.views.length || filters.views.includes(r.view)) &&
        filters.amenities.every((a) => r.amenityFlags.includes(a)) &&
        r.maxGuests * search.rooms >= guests,
    );
    const by: Record<Sort, (a: PublicRoom, b: PublicRoom) => number> = {
      recommended: () => 0,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    return [...out].sort(by[sort]);
  }, [rooms, filters, maxPrice, sort, guests, search.rooms]);

  const activeCount = filters.types.length + filters.views.length + filters.amenities.length + (filters.max !== null && filters.max < bounds.max ? 1 : 0);
  const query =
    hydrated && search.checkIn && search.checkOut
      ? new URLSearchParams({ ci: search.checkIn, co: search.checkOut, a: String(search.adults), c: String(search.children), r: String(search.rooms) }).toString()
      : "";
  const panel = <FilterPanel filters={filters} setFilters={setFilters} bounds={bounds} maxPrice={maxPrice} />;

  return (
    <div className="bg-ivory pt-[4.25rem] lg:pt-[7rem]">
      {/* sticky search summary, p.4 of the deck */}
      <div className="sticky top-[4.25rem] z-30 border-b border-line bg-sand lg:top-[4.75rem]">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-[0.95rem] font-bold text-green">
            {hydrated && search.checkIn && search.checkOut ? fmtRange(search.checkIn, search.checkOut) : "Choose your dates"}
            <span className="mx-2 text-brass-deep">·</span>{plural(guests, "Guest")}
            <span className="mx-2 text-brass-deep">·</span>{plural(search.rooms, "Room")}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing((v) => !v)} aria-expanded={editing}><Pencil className="size-3.5" aria-hidden /> Edit search</Button>
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setSheet(true)}>
              <SlidersHorizontal className="size-3.5" aria-hidden /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
          </div>
        </div>
        {editing && <div className="container-x pb-4"><BookingWidget /></div>}
      </div>

      <div className="container-x grid gap-8 py-8 lg:grid-cols-[17rem_1fr] lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-44 rounded-2xl bg-white p-6 shadow-card ring-1 ring-line">{panel}</div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl text-green sm:text-4xl">Rooms &amp; Suites</h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted" aria-live="polite">{plural(list.length, "room")} available</p>
              <label className="sr-only" htmlFor="sort">Sort by</label>
              <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-11 w-auto py-0 text-sm font-semibold">
                <option value="recommended">Sort: Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Guest rating</option>
              </Select>
            </div>
          </div>

          {loading ? (
            <CardSkeletons count={3} className="sm:grid-cols-1 lg:grid-cols-1" />
          ) : error ? (
            <LoadError message={error.message} onRetry={reload} />
          ) : list.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card ring-1 ring-line">
              <SearchX className="mx-auto size-10 text-brass" aria-hidden />
              <h2 className="mt-4 text-2xl text-green">No rooms match these filters</h2>
              <p className="mt-2 text-muted">Try widening your price range or removing a filter.</p>
              <Button className="mt-5" onClick={() => setFilters(initial)}>Clear all filters</Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {list.map((r) => (
                <li key={r.slug}><RoomRow room={r} query={query} nights={nights} stayRooms={search.rooms} /></li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Popover open={sheet} onClose={() => setSheet(false)} title="Filters" className="lg:hidden">
        {panel}
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setFilters(initial)}>Clear</Button>
          <Button className="flex-1" onClick={() => setSheet(false)}>Show {list.length} rooms</Button>
        </div>
      </Popover>
    </div>
  );
}

/** One result row in the rooms list. */
function RoomRow({ room: r, query, nights, stayRooms }: { room: PublicRoom; query: string; nights: number; stayRooms: number }) {
  const href = routes.room(r.slug, query);
  return (
    <article className={cn("group grid overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition-shadow hover:shadow-lift sm:grid-cols-[17rem_1fr]", !r.active && "opacity-70")}>
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden>
        <Photo src={roomImageUrl(r.images[0])} alt="" sizes="(min-width:640px) 272px, 100vw" className="aspect-[16/10] size-full sm:absolute sm:inset-0 sm:aspect-auto" />
        {r.active && r.roomsLeft <= 3 && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-danger shadow"><Flame className="size-3.5" aria-hidden /> Only {r.roomsLeft} left</span>
        )}
      </Link>
      <div className="flex flex-col justify-between gap-4 p-5 md:flex-row">
        <div>
          <h2 className="text-[1.65rem] text-green"><Link href={href} className="hover:text-action">{r.name}</Link></h2>
          <ChipList className="mt-3" items={[{ Icon: BedDouble, label: r.beds }, { Icon: Eye, label: `${r.view} view` }, { Icon: Maximize2, label: `${r.size} sqm` }, { Icon: Users, label: `Sleeps ${r.maxGuests}` }]} />
          <StarRating rating={r.rating} reviews={r.reviews} className="mt-3 text-sm text-muted [&_svg]:size-4" />
          <p className="mt-2 hidden max-w-md text-sm text-muted lg:block">{r.blurb}</p>
        </div>
        <div className="flex items-end justify-between gap-4 md:flex-col md:items-end md:justify-between">
          <div className="md:text-right">
            <p className="price text-3xl leading-none text-green">{inr(r.price)}</p>
            <p className="mt-1 text-xs text-muted">per night + GST</p>
            {nights > 0 && <p className="mt-1 text-xs font-semibold text-green">{inr(r.price * nights * stayRooms)} for {plural(nights, "night")}</p>}
          </div>
          {r.active ? (
            <ButtonLink href={href}>Select Room</ButtonLink>
          ) : (
            <span className="inline-flex min-h-11 items-center rounded-full bg-sand px-5 text-sm font-semibold text-muted">Sold out</span>
          )}
        </div>
      </div>
    </article>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-green">{legend}</legend>
      <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function FilterPanel({ filters, setFilters, bounds, maxPrice }: { filters: Filters; setFilters: (f: Filters) => void; bounds: { min: number; max: number }; maxPrice: number }) {
  const toggle = <K extends "types" | "views" | "amenities">(k: K, v: Filters[K][number]) => {
    const arr = filters[k] as string[];
    setFilters({ ...filters, [k]: arr.includes(v as string) ? arr.filter((x) => x !== v) : [...arr, v] });
  };
  const span = Math.max(1, bounds.max - bounds.min);
  const pct = ((maxPrice - bounds.min) / span) * 100;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="eyebrow text-green">Filters</h2>
        <button onClick={() => setFilters(initial)} className="text-xs font-semibold text-brass-deep underline-offset-2 hover:underline">Reset</button>
      </div>
      {bounds.max > bounds.min && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-green">Max price / night</legend>
          <input
            type="range" min={bounds.min} max={bounds.max} step={100} value={maxPrice}
            onChange={(e) => setFilters({ ...filters, max: Number(e.target.value) })}
            aria-label="Maximum price per night"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-green"
            style={{ background: `linear-gradient(to right, var(--color-green) ${pct}%, var(--color-sand) ${pct}%)` }}
          />
          <p className="mt-2 text-xs text-muted">{inr(bounds.min)} – {inr(maxPrice)}</p>
        </fieldset>
      )}
      <FilterGroup legend="Room type">{ROOM_TYPES.map((t) => <Checkbox key={t} label={t} checked={filters.types.includes(t)} onChange={() => toggle("types", t)} />)}</FilterGroup>
      <FilterGroup legend="View">{ROOM_VIEWS.map((t) => <Checkbox key={t} label={t} checked={filters.views.includes(t)} onChange={() => toggle("views", t)} />)}</FilterGroup>
      <FilterGroup legend="Amenities">{AMENITY_FLAGS.map((t) => <Checkbox key={t} label={t === "WiFi" ? "Wi-Fi" : t} checked={filters.amenities.includes(t)} onChange={() => toggle("amenities", t)} />)}</FilterGroup>
    </div>
  );
}
