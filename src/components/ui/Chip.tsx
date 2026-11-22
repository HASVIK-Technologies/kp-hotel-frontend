import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
export interface ChipItem {
  Icon: Icon;
  label: string;
}

/** A row of small rounded "fact" pills (bed type, view, size, capacity…). One look everywhere. */
export function ChipList({ items, size = "sm", className }: { items: ChipItem[]; size?: "sm" | "md"; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2 font-semibold text-green", size === "sm" ? "text-xs" : "text-sm", className)}>
      {items.map(({ Icon, label }) => (
        <li key={label} className={cn("flex items-center rounded-full bg-sand", size === "sm" ? "gap-1.5 px-3 py-1.5" : "gap-2 px-4 py-2")}>
          <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden /> {label}
        </li>
      ))}
    </ul>
  );
}
