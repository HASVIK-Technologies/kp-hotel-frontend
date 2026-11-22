"use client";

import { useMemo, useState } from "react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth,
  isWithinInterval, parseISO, startOfDay, startOfMonth, startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { nightsBetween, toISO } from "@/lib/format";

interface Props {
  from?: string;
  to?: string;
  onChange: (v: { from?: string; to?: string }) => void;
  onDone?: () => void;
  /** single = pick one date (restaurant / events) */
  mode?: "range" | "single";
}

export function RangeCalendar({ from, to, onChange, onDone, mode = "range" }: Props) {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(() => startOfMonth(from ? parseISO(from) : today));
  const [hover, setHover] = useState<Date | null>(null);

  const f = from ? parseISO(from) : undefined;
  const t = to ? parseISO(to) : undefined;

  const pick = (d: Date) => {
    const iso = toISO(d);
    if (mode === "single") {
      onChange({ from: iso });
      onDone?.();
      return;
    }
    if (!f || t || isBefore(d, f) || isSameDay(d, f)) {
      onChange({ from: iso, to: undefined });
    } else {
      onChange({ from, to: iso });
      onDone?.();
    }
  };

  const months = [cursor, addMonths(cursor, 1)];
  const canPrev = !isBefore(addMonths(cursor, -1), startOfMonth(today));
  const preview = f && !t && hover && hover > f ? hover : t;
  const nights = nightsBetween(from, to);

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {months.map((m, idx) => (
          <Month
            key={m.toISOString()}
            month={m}
            today={today}
            f={f}
            t={t}
            preview={preview}
            mode={mode}
            onPick={pick}
            onHover={setHover}
            className={idx === 1 ? "hidden md:block" : ""}
            nav={
              <>
                {idx === 0 ? (
                  <button type="button" disabled={!canPrev} onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month" className="grid size-10 place-items-center rounded-full text-green hover:bg-sand-soft disabled:opacity-30">
                    <ChevronLeft className="size-5" aria-hidden />
                  </button>
                ) : <span className="size-10 md:block hidden" />}
                <span className="font-display text-xl font-semibold text-green" aria-live="polite">{format(m, "MMMM yyyy")}</span>
                <button type="button" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month" className={cn("grid size-10 place-items-center rounded-full text-green hover:bg-sand-soft", idx === 0 && "md:invisible")}>
                    <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            }
          />
        ))}
      </div>
      {mode === "range" && (
        <p className="mt-4 border-t border-line pt-3 text-center text-sm text-muted" aria-live="polite">
          {!from ? "Select your check-in date" : !to ? "Now select your check-out date" : `${nights} night${nights === 1 ? "" : "s"} selected`}
        </p>
      )}
    </div>
  );
}

function Month({ month, today, f, t, preview, mode, onPick, onHover, nav, className }: {
  month: Date; today: Date; f?: Date; t?: Date; preview?: Date; mode: "range" | "single";
  onPick: (d: Date) => void; onHover: (d: Date | null) => void; nav: React.ReactNode; className?: string;
}) {
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }),
    [month],
  );
  return (
    <div className={cn("w-full md:w-[19rem]", className)}>
      <div className="mb-2 flex items-center justify-between">{nav}</div>
      <div className="grid grid-cols-7 text-center text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d} className="py-2">{d}</span>)}
      </div>
      <div className="grid grid-cols-7" onMouseLeave={() => onHover(null)}>
        {days.map((d) => {
          if (!isSameMonth(d, month)) return <span key={d.toISOString()} />;
          const disabled = isBefore(d, today);
          const isFrom = f && isSameDay(d, f);
          const isTo = (t && isSameDay(d, t)) || (!t && preview && isSameDay(d, preview) && mode === "range");
          const inRange = f && preview && mode === "range" && isWithinInterval(d, { start: f, end: preview }) && !isFrom && !isTo;
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              onMouseEnter={() => onHover(d)}
              aria-label={format(d, "EEEE d MMMM yyyy")}
              aria-pressed={!!(isFrom || (t && isSameDay(d, t)))}
              className={cn(
                "relative my-0.5 grid h-11 place-items-center text-[0.92rem] font-medium transition-colors",
                disabled && "cursor-not-allowed text-muted/35 line-through",
                !disabled && !isFrom && !isTo && !inRange && "rounded-full text-ink hover:bg-sand",
                inRange && "bg-sand-soft text-green",
                (isFrom || isTo) && "bg-green font-bold text-white",
                isFrom && "rounded-l-full",
                isTo && "rounded-r-full",
                isFrom && (!preview || mode === "single") && "rounded-full",
                isSameDay(d, today) && !isFrom && !isTo && "ring-1 ring-inset ring-brass",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
