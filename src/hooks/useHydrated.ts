"use client";

import { useEffect, useState } from "react";

/** True after the first client render. Use it to avoid server/client mismatches for values from localStorage. */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
