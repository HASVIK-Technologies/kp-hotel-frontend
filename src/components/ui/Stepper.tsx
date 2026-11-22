"use client";

import { Minus, Plus } from "lucide-react";

export function Stepper({ label, sub, value, min = 0, max = 10, onChange }: { label: string; sub?: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const btn = "grid size-11 place-items-center rounded-full border border-line text-green transition-colors hover:border-green disabled:opacity-35 disabled:hover:border-line";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
