"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { useDialog } from "@/hooks/useDialog";
import { X } from "lucide-react";

/**
 * Anchored dropdown on desktop, bottom sheet on mobile.
 * The parent must be `relative`.
 */
export function Popover({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  useDialog(open, onClose, { lockScroll: "mobile" });

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[68] bg-ink/50 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={title}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] max-h-[88dvh] animate-sheet overflow-y-auto rounded-t-3xl bg-white p-5 pb-safe shadow-lift",
          "md:absolute md:inset-x-auto md:bottom-auto md:left-0 md:top-[calc(100%+0.75rem)] md:max-h-none md:animate-pop md:rounded-2xl md:p-6 md:pb-6",
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="font-display text-xl font-semibold text-green">{title}</p>
          <button onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-sand-soft text-green">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
