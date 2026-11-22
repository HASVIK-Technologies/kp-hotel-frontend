"use client";

import { useEffect } from "react";

/**
 * Shared behaviour for anything that behaves like a dialog: close on Escape and (optionally) lock page scroll.
 * Used by Popover, Modal and the gallery lightbox so they all feel identical.
 */
export function useDialog(open: boolean, onClose: () => void, opts: { lockScroll?: boolean | "mobile" } = {}) {
  const { lockScroll = true } = opts;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const lock = lockScroll === "mobile" ? window.matchMedia("(max-width: 767px)").matches : lockScroll;
    if (lock) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, lockScroll]);
}
