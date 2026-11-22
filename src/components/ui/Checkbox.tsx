import { cn } from "@/lib/cn";

/** Accessible custom checkbox (real <input> underneath, visually replaced). */
export function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className="grid size-5 place-items-center rounded-md border-[1.5px] border-line bg-white transition-colors peer-checked:border-green peer-checked:bg-green peer-focus-visible:ring-2 peer-focus-visible:ring-brass"
        aria-hidden
      >
        <svg viewBox="0 0 16 16" className={cn("size-3.5 text-white transition-opacity", checked ? "opacity-100" : "opacity-0")} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 8.5 3 3 7-7" />
        </svg>
      </span>
      {label}
    </label>
  );
}
