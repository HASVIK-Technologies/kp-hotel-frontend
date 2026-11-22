import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Rating summary, e.g. "★ 4.7 (214 reviews)". Renders nothing for unrated rooms. */
export function StarRating({ rating, reviews, variant = "inline", className }: { rating: number; reviews?: number; variant?: "inline" | "row"; className?: string }) {
  if (!rating) return null;
  if (variant === "row") {
    return (
      <p className={cn("flex items-center gap-1.5 text-sm text-muted", className)}>
        <span className="flex" aria-hidden>{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-brass text-brass" />)}</span>
        <b className="text-ink">{rating}</b>
        {reviews ? <>({reviews} reviews)</> : null}
      </p>
    );
  }
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <Star className="size-3.5 fill-brass text-brass" aria-hidden /> {rating}
      {reviews ? <span className="text-muted">({reviews} reviews)</span> : null}
    </span>
  );
}
