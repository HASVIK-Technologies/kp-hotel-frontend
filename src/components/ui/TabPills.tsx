"use client";

import { cn } from "@/lib/cn";

/** Pill-style tab switcher (menu meals, gallery categories…). Fully keyboard/ARIA friendly. */
export function TabPills<T extends string>({
  tabs, value, onChange, label, controls, className,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  controls?: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          aria-controls={controls}
          onClick={() => onChange(t.id)}
          className={cn(
            "min-h-11 rounded-full border-[1.5px] px-6 text-sm font-semibold transition-colors",
            value === t.id ? "border-green bg-green text-white" : "border-green/40 text-green hover:border-green",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
