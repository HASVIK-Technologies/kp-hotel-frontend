"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useDialog } from "@/hooks/useDialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Labelled admin form field with accessible error wiring. */
export function AField({ label, error, hint, className, children }: {
  label: string; error?: string; hint?: string; className?: string;
  children: (p: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const desc = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": desc })}
      {error ? <p id={`${id}-e`} role="alert" className="mt-1 text-xs font-medium text-rose-600">{error}</p>
        : hint ? <p id={`${id}-h`} className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(open, onClose);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cn("max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl focus:outline-none sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "success"; children: ReactNode }) {
  const t = { info: "bg-blue-50 text-blue-800", warn: "bg-amber-50 text-amber-800", success: "bg-emerald-50 text-emerald-800" }[tone];
  return <div role="status" className={cn("rounded-xl p-3 text-sm", t)}>{children}</div>;
}
