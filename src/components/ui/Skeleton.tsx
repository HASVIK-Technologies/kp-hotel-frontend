import { cn } from "@/lib/cn";

/** Pulsing placeholder block shown while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-sand/70", className)} aria-hidden />;
}

/** A grid of card-shaped placeholders (rooms, offers…). */
export function CardSkeletons({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}><Skeleton className="h-72" /></li>
      ))}
    </ul>
  );
}

/** Inline notice for "couldn't load" with a retry button slot. */
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
      <p className="font-semibold text-green">We couldn&apos;t load this right now</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 min-h-11 rounded-full border-[1.5px] border-green px-6 text-sm font-semibold text-green hover:bg-green hover:text-white">Try again</button>}
    </div>
  );
}
