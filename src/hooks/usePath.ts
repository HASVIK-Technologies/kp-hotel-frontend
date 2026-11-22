"use client";

import { usePathname } from "next/navigation";

/** pathname without the trailing slash added by `trailingSlash: true` (static hosting). */
export function usePath() {
  const p = usePathname() ?? "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}
