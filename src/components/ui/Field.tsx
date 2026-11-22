"use client";

import { cn } from "@/lib/cn";
import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export const inputCls =
  "w-full min-h-12 rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted/60 transition-shadow focus:border-green focus:outline-none focus:ring-4 focus:ring-green/10 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10 disabled:bg-sand-soft";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}

export function Field({ label, error, hint, required, optional, className, children }: FieldProps) {
  const id = useId();
  const descId = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.8rem] font-semibold text-green">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true"> *</span>}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": descId })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-start gap-1.5 text-[0.8rem] font-medium text-danger">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.78rem] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={cn(inputCls, className)} {...p} />;
}

const chevron =
  "bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231f3d33' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat";

export function Select({ className, children, ...p }: ComponentProps<"select">) {
  return (
    <select className={cn(inputCls, "appearance-none pr-10", chevron, className)} {...p}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputCls, "min-h-28 py-3", className)} {...p} />;
}
