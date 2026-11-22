import { cn } from "@/lib/cn";
import { IMAGES, imageUrl } from "@/config/images";

/**
 * Round "KP" badge. The artwork is the file `public/images/brand/logo-mark.svg`:
 * replace that file with the official logo (any square SVG/PNG; if it's a PNG update the path in config/images.ts).
 */
export function LogoMark({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    // Plain <img>: tiny, above the fold on every page, and SVG needs no optimisation.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl(IMAGES.brand.logoMark)} width={size} height={size} alt="KP Hotel" className={cn("shrink-0 object-contain", className)} />
  );
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 whitespace-nowrap">
      <LogoMark size={compact ? 38 : 46} />
      <span className="leading-none">
        <span className={cn("block font-display text-[1.45rem] font-bold tracking-wide", light ? "text-white" : "text-green")}>HOTEL KP</span>
        <span className={cn("mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.28em]", light ? "text-brass-light" : "text-brass-deep")}>
          &amp; Restaurant
        </span>
      </span>
    </span>
  );
}
