"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Client-only UX state (search + in-progress booking + form prefill).
 * Bookings, invoices, payments and enquiries live in the backend, never here.
 */
export interface SearchState {
  checkIn?: string;
  checkOut?: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface Draft {
  roomSlug?: string;
  ratePlan: string;
  addonIds: string[];
  promo?: string;
}

export interface Prefill {
  date?: string;
  time?: string;
  guests?: number;
  eventType?: string;
}

interface State {
  search: SearchState;
  draft: Draft;
  prefill: Prefill;
  setSearch: (s: Partial<SearchState>) => void;
  setDraft: (d: Partial<Draft>) => void;
  resetDraft: () => void;
  setPrefill: (p: Prefill) => void;
}

const emptyDraft: Draft = { ratePlan: "room-only", addonIds: [] };

export const useStore = create<State>()(
  persist(
    (set) => ({
      search: { adults: 2, children: 0, rooms: 1 },
      draft: emptyDraft,
      prefill: {},
      setSearch: (s) => set((st) => ({ search: { ...st.search, ...s } })),
      setDraft: (d) => set((st) => ({ draft: { ...st.draft, ...d } })),
      resetDraft: () => set({ draft: emptyDraft }),
      setPrefill: (prefill) => set({ prefill }),
    }),
    {
      name: "kp-hotel-v2",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }
          : window.localStorage,
      ),
      partialize: (s) => ({ search: s.search, draft: s.draft }),
    },
  ),
);
