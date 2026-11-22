"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Building blocks shared by every admin screen: cards, titles, tables, badges, buttons, form styles. */
export function Card({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.05)] ring-1 ring-slate-200 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-sans text-base font-bold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-4xl font-semibold text-slate-900">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase().replace(/_/g, " ");
  const good = ["confirmed", "paid", "contacted", "closed", "success", "checked in", "cleared", "online"].includes(s);
  const warn = ["pending", "new", "partial", "unpaid", "pending clearance", "pending payment", "overdue"].includes(s);
  const cls = good ? "bg-emerald-50 text-emerald-700" : warn ? "bg-amber-50 text-amber-700" : s === "credited" || s === "checked out" || s === "expired" ? "bg-slate-100 text-slate-600" : "bg-rose-50 text-rose-700";
  return <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold capitalize", cls)}>{s}</span>;
}

export const Table = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
    <table aria-label={label} className="w-full min-w-[40rem] text-left text-sm">{children}</table>
  </div>
);
export const Th = ({ children, right }: { children?: React.ReactNode; right?: boolean }) => (
  <th scope="col" className={cn("whitespace-nowrap px-3 py-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-500", right && "text-right")}>{children}</th>
);
export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn("whitespace-nowrap border-t border-slate-100 px-3 py-3", className)}>{children}</td>
);

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} disabled={disabled}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50", on ? "bg-emerald-500" : "bg-slate-300")}>
      <span className={cn("absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {message}</p>;
}

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-slate-500">{children}</p>;
}

export const btn = {
  primary: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#4f6bff] px-4 text-sm font-bold text-white transition-colors hover:bg-[#3d57e6] disabled:opacity-50",
  ghost: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50",
  danger: "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50",
};

export const inputCls =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 focus:border-[#4f6bff] focus:outline-none focus:ring-2 focus:ring-[#4f6bff]/20 aria-[invalid=true]:border-rose-400";

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}{hint && <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">{hint}</span>}
    </label>
  );
}
