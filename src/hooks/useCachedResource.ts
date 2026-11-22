"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Tiny shared cache for read-mostly API data (rooms, catalogue). Many components can call the same hook; the
 * request is made once, de-duplicated while in flight, and reused for `ttl` ms.
 *
 * Built on useSyncExternalStore so the server render and the first client render always agree (both start in
 * the "loading" state), which avoids hydration mismatches when the cache was filled by another component.
 */
interface Entry<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  at: number;
}

const LOADING: Entry<never> = { data: undefined, error: undefined, loading: true, at: 0 };
const entries = new Map<string, Entry<unknown>>();
const listeners = new Map<string, Set<() => void>>();
const inflight = new Map<string, Promise<unknown>>();

const emit = (key: string) => listeners.get(key)?.forEach((l) => l());
const set = <T>(key: string, entry: Entry<T>) => {
  entries.set(key, entry);
  emit(key);
};

/** Forget cached data (all keys, or one) so the next render re-fetches, e.g. after an admin edit. */
export function invalidateResource(key?: string) {
  if (key) entries.delete(key);
  else entries.clear();
}

async function fetchInto<T>(key: string, fetcher: () => Promise<T>) {
  let p = inflight.get(key) as Promise<T> | undefined;
  if (!p) {
    p = fetcher().finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  try {
    set(key, { data: await p, error: undefined, loading: false, at: Date.now() });
  } catch (e) {
    const prev = entries.get(key) as Entry<T> | undefined;
    set(key, { data: prev?.data, error: e as Error, loading: false, at: 0 });
  }
}

export function useCachedResource<T>(key: string, fetcher: () => Promise<T>, ttl = 30_000) {
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(cb);
      return () => void listeners.get(key)?.delete(cb);
    },
    [key],
  );
  const entry = useSyncExternalStore(
    subscribe,
    () => (entries.get(key) as Entry<T> | undefined) ?? (LOADING as Entry<T>),
    () => LOADING as Entry<T>,
  );

  useEffect(() => {
    const cur = entries.get(key);
    if (!cur || Date.now() - cur.at >= ttl) void fetchInto(key, () => fetchRef.current());
  }, [key, ttl, entry.at]);

  return { data: entry.data, error: entry.error, loading: entry.loading, reload: () => fetchInto(key, () => fetchRef.current()) };
}
