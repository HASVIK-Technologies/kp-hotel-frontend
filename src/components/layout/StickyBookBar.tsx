"use client";

import { usePath } from "@/hooks/usePath";
import { useRooms } from "@/hooks/useRooms";
import { inr } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

const SHOW = ["/", "/rooms", "/dining", "/banquets", "/conference", "/gallery", "/offers", "/about"];

/** Mobile-only thumb-reach CTA, mirrors p.3 of the deck ("Best rate from …"). */
export function StickyBookBar() {
  const pathname = usePath();
  const { rooms } = useRooms();
  const prices = rooms.filter((r) => r.active).map((r) => r.price);
  const lowest = prices.length ? Math.min(...prices) : null;
  if (!SHOW.includes(pathname) || lowest === null) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-ink/95 py-2.5 pl-5 pr-2.5 text-white shadow-lift backdrop-blur-md">
        <p className="text-[0.82rem] leading-tight text-white/75">
          Best rate from
          <span className="block text-[1.05rem] font-bold text-white">{inr(lowest)}<span className="text-xs font-normal text-white/60"> /night</span></span>
        </p>
        <ButtonLink href="/rooms" size="md">Book Now</ButtonLink>
      </div>
    </div>
  );
}
