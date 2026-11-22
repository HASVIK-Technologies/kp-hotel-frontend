"use client";

import { publicApi } from "@/services/api";
import type { Catalog } from "@/types/api";
import { useCachedResource } from "./useCachedResource";

const EMPTY: Catalog = { ratePlans: [], addons: [], promos: {} };

/** Rate plans, add-ons and promo codes from the API (shared, cached for 5 min). */
export function useCatalog() {
  const { data, error, loading } = useCachedResource("catalog", () => publicApi.catalog(), 300_000);
  const catalog = data ?? EMPTY;
  return {
    ...catalog,
    loading,
    error,
    ratePlan: (id: string) => catalog.ratePlans.find((p) => p.id === id) ?? catalog.ratePlans[0],
  };
}
