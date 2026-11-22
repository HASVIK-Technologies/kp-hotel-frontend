"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ } from "@/content/faq";
import { cn } from "@/lib/cn";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="divide-y divide-line rounded-2xl bg-white shadow-card ring-1 ring-line">
      {FAQ.map((f, i) => (
        <li key={f.q}>
          <h3>
            <button
              aria-expanded={open === i}
              aria-controls={`faq-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-sans text-[1rem] font-semibold text-ink"
            >
              {f.q} <ChevronDown className={cn("size-5 shrink-0 text-green transition-transform", open === i && "rotate-180")} aria-hidden />
            </button>
          </h3>
          <div id={`faq-${i}`} hidden={open !== i} className="px-5 pb-5 text-sm text-muted">{f.a}</div>
        </li>
      ))}
    </ul>
  );
}
