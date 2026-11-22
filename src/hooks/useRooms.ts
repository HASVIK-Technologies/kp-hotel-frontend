"use client";

import { publicApi } from "@/services/api";
import { useCachedResource } from "./useCachedResource";

/** All room categories with live price and availability (shared, cached for 30 s). */
export function useRooms() {
  const { data, error, loading, reload } = useCachedResource("rooms", () => publicApi.rooms().then((r) => r.rooms));
  return { rooms: data ?? [], error, loading, reload };
}

/** One room by slug, served from the same cached list so the detail page opens instantly after the list. */
export function useRoom(slug: string | null) {
  const { rooms, error, loading } = useRooms();
  const room = slug ? rooms.find((r) => r.slug === slug) : undefined;
  return { room, error, loading, notFound: !loading && !error && !!slug && !room };
}
