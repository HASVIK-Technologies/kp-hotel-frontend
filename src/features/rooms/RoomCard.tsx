import Link from "next/link";
import { Eye, Users } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { StarRating } from "@/components/ui/StarRating";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { inr } from "@/lib/format";
import type { Room } from "@/types/api";

/** Compact room tile used on the homepage and the "you may also like" row. */
export function RoomCard({ room, className, query }: { room: Room; className?: string; query?: string }) {
  return (
    <Link
      href={routes.room(room.slug, query)}
      className={cn("group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift", className)}
    >
      <Photo
        src={roomImageUrl(room.images[0])}
        alt={`${room.name} interior`}
        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 80vw"
        className="aspect-[4/3] transition-transform duration-700 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
      />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-[1.45rem] text-green">{room.name}</h3>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-muted">
          <li className="flex items-center gap-1.5"><Users className="size-3.5 text-brass-deep" aria-hidden /> {room.maxGuests} Guests</li>
          <li className="flex items-center gap-1.5"><Eye className="size-3.5 text-brass-deep" aria-hidden /> {room.view} View</li>
          {room.rating > 0 && <li><StarRating rating={room.rating} /></li>}
        </ul>
        <p className="mt-auto pt-4 text-sm text-muted">
          <span className="price text-xl text-green">{inr(room.price)}</span> / night
        </p>
        <span className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border-[1.5px] border-brass text-sm font-semibold text-brass-deep transition-colors group-hover:bg-brass group-hover:text-ink">
          View Details
        </span>
      </div>
    </Link>
  );
}
