"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

/**
 * React-Hook-Form-bound fields. Wrap a <form> in <FormProvider {...form}> and every field below wires up
 * registration, validation messages and accessibility (`aria-invalid`, `aria-describedby`) from just a `name`.
 */
interface BaseProps {
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  className?: string;
}

/** Looks up a (possibly nested, e.g. "guest.email") error message. */
function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  const node = name.split(".").reduce<any>((o, k) => o?.[k], errors);
  return node?.message as string | undefined;
}

export function TextField({ name, label, required, optional, hint, className, type = "text", ...input }: BaseProps & Omit<ComponentProps<"input">, "name" | "className">) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      {(a) => <Input {...a} type={type} suppressHydrationWarning={type === "date"} {...input} {...register(name, type === "number" ? { valueAsNumber: true } : undefined)} />}
    </Field>
  );
}

export function SelectField({ name, label, required, optional, hint, className, children, ...select }: BaseProps & { children: ReactNode } & Omit<ComponentProps<"select">, "name" | "className" | "children">) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      {(a) => <Select {...a} {...select} {...register(name)}>{children}</Select>}
    </Field>
  );
}

export function TextareaField({ name, label, required, optional, hint, className, rows = 3, ...area }: BaseProps & Omit<ComponentProps<"textarea">, "name" | "className">) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field label={label} required={required} optional={optional} hint={hint} error={error} className={className}>
      {(a) => <Textarea {...a} rows={rows} {...area} {...register(name)} />}
    </Field>
  );
}

/** Form-level (server) error, e.g. "Can't reach the API". Set with `setError("root", { message })`. */
export function FormRootError({ className }: { className?: string }) {
  const {
    formState: { errors },
  } = useFormContext();
  const message = errors.root?.message as string | undefined;
  if (!message) return null;
  return (
    <p role="alert" className={cn("flex items-start gap-2 rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger sm:col-span-full", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {message}
    </p>
  );
}
