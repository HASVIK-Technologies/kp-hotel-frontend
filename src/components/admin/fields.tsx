"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/cn";
import { AField } from "./ui";
import { inputCls } from "./primitives";

/**
 * React-Hook-Form-bound fields for the staff console (the admin look: compact, uppercase labels).
 * Wrap the form in <FormProvider {...form}> and pass just a `name`.
 */
interface BaseProps {
  name: string;
  label: string;
  hint?: string;
  className?: string;
}

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  return name.split(".").reduce<any>((o, k) => o?.[k], errors)?.message as string | undefined;
}

export function AdminText({ name, label, hint, className, inputClassName, type = "text", ...input }: BaseProps & { inputClassName?: string } & Omit<ComponentProps<"input">, "name" | "className">) {
  const { register } = useFormContext();
  return (
    <AField label={label} hint={hint} error={useFieldError(name)} className={className}>
      {(a) => <input {...a} type={type} {...input} className={cn(inputCls, inputClassName)} {...register(name, type === "number" ? { valueAsNumber: true } : undefined)} />}
    </AField>
  );
}

export function AdminSelect({ name, label, hint, className, children, ...select }: BaseProps & { children: ReactNode } & Omit<ComponentProps<"select">, "name" | "className" | "children">) {
  const { register } = useFormContext();
  return (
    <AField label={label} hint={hint} error={useFieldError(name)} className={className}>
      {(a) => <select {...a} {...select} className={inputCls} {...register(name)}>{children}</select>}
    </AField>
  );
}

export function AdminTextarea({ name, label, hint, className, rows = 3, ...area }: BaseProps & Omit<ComponentProps<"textarea">, "name" | "className">) {
  const { register } = useFormContext();
  return (
    <AField label={label} hint={hint} error={useFieldError(name)} className={className}>
      {(a) => <textarea {...a} rows={rows} {...area} className={cn(inputCls, "py-2")} {...register(name)} />}
    </AField>
  );
}

/** A group of checkboxes bound to one string-array field (e.g. add-ons, amenities). */
export function AdminCheckGroup({ name, legend, options, hint }: { name: string; legend: string; options: { value: string; label: string }[]; hint?: string }) {
  const { register } = useFormContext();
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o.value} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm">
            <input type="checkbox" value={o.value} className="size-4 accent-[#4f6bff]" {...register(name)} /> {o.label}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </fieldset>
  );
}
