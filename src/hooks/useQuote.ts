"use client";

import { useEffect, useRef, useState } from "react";
import { publicApi } from "@/services/api";
import type { QuoteRequest, QuoteResponse } from "@/types/api";

/**
 * Live price from the server's pricing engine (`POST /quotes`), debounced while the guest edits dates/options.
 * The website never computes prices itself, so what is shown is exactly what will be charged.
 * Pass `null` to skip (e.g. no dates chosen yet).
 */
export function useQuote(req: QuoteRequest | null, debounceMs = 250) {
  const [data, setData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);
  const key = req ? JSON.stringify(req) : "";

  useEffect(() => {
    if (!key) {
      setData(null);
      setError(null);
      return;
    }
    const id = ++latest.current;
    setLoading(true);
    const t = setTimeout(() => {
      publicApi
        .quote(JSON.parse(key))
        .then((r) => id === latest.current && (setData(r), setError(null)))
        .catch((e: Error) => id === latest.current && (setData(null), setError(e.message)))
        .finally(() => id === latest.current && setLoading(false));
    }, debounceMs);
    return () => clearTimeout(t);
  }, [key, debounceMs]);

  return { quote: data?.quote ?? null, available: data?.available, soldOut: data?.soldOut ?? false, loading, error };
}
