"use client";

import { CardSkeletons, LoadError } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHead } from "@/components/ui/Section";
import { useRooms } from "@/hooks/useRooms";
import { RoomCard } from "@/features/rooms/RoomCard";

/** Homepage showcase: the first four active rooms, live from the API. */
export function RoomsSection() {
  const { rooms, loading, error, reload } = useRooms();
  const featured = rooms.filter((r) => r.active).slice(0, 4);
  return (
    <Section className="pt-16 sm:pt-24">
      <SectionHead title="Our Rooms & Suites" sub="Experience comfort and elegance with our well-appointed rooms." href="/rooms" linkLabel="View All Rooms" />
      {loading ? (
        <CardSkeletons />
      ) : error ? (
        <LoadError message={error.message} onRetry={reload} />
      ) : (
        // mobile: snap carousel · desktop: 4-col grid
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {featured.map((r, i) => (
            <li key={r.slug} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Reveal delay={i * 0.07} className="h-full">
                <RoomCard room={r} className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
