"use client";

import { FormProvider } from "react-hook-form";
import { FormRootError, FormSuccess, SelectField, TextField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { TABLE_TIMES } from "@/content/dining";
import { toISO } from "@/lib/format";
import { tableSchema, type TableValues } from "@/lib/schemas";
import { useStore } from "@/store/booking-store";
import { useEnquiryForm } from "./useEnquiryForm";

export function TableForm() {
  const { prefill, setPrefill } = useStore();
  const { form, submit, done, reset } = useEnquiryForm<TableValues>({
    kind: "Table",
    schema: tableSchema,
    defaults: { name: "", mobile: "", date: prefill.date ?? "", time: prefill.time ?? "20:00", guests: prefill.guests ?? 2, occasion: "", notes: "" },
    toPayload: (v) => ({ ...v, occasion: v.occasion ?? "", notes: v.notes ?? "" }),
    onSuccess: () => setPrefill({}),
  });

  if (done) {
    const v = form.getValues();
    return <FormSuccess title="Table requested" onReset={reset}>Table for {v.guests} on {v.date} at {v.time}. We&apos;ll confirm by SMS shortly.</FormSuccess>;
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-3" aria-label="Reserve a table">
        <TextField name="date" label="Date" type="date" min={toISO(new Date())} required />
        <SelectField name="time" label="Time" required>{TABLE_TIMES.map((t) => <option key={t}>{t}</option>)}</SelectField>
        <TextField name="guests" label="Guests" type="number" inputMode="numeric" min={1} max={20} required />
        <TextField name="name" label="Your name" autoComplete="name" required className="sm:col-span-2" />
        <TextField name="mobile" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" required />
        <TextField name="occasion" label="Occasion" placeholder="Birthday, anniversary…" optional className="sm:col-span-3" />
        <FormRootError />
        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="sm:col-span-3">Find a Table</Button>
      </form>
    </FormProvider>
  );
}
