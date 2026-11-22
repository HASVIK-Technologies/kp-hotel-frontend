"use client";

import { FormProvider } from "react-hook-form";
import { FormRootError, FormSuccess, SelectField, TextareaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { EVENT_TYPES, HALLS, PACKAGES } from "@/content/events";
import { toISO } from "@/lib/format";
import { banquetSchema, type BanquetValues } from "@/lib/schemas";
import { useStore } from "@/store/booking-store";
import { useEnquiryForm } from "./useEnquiryForm";

export function BanquetForm() {
  const { prefill, setPrefill } = useStore();
  const { form, submit, done, reset } = useEnquiryForm<BanquetValues>({
    kind: "Banquet",
    schema: banquetSchema,
    defaults: {
      name: "", email: "", mobile: "", eventType: prefill.eventType ?? EVENT_TYPES[0], date: prefill.date ?? "",
      guests: prefill.guests ?? 150, hall: HALLS[0].slug, pkg: "", message: "",
    },
    toPayload: (v) => ({ ...v, pkg: v.pkg ?? "", message: v.message ?? "" }),
    onSuccess: () => setPrefill({}),
  });
  const guests = form.watch("guests");
  const suggested = HALLS.find((h) => h.slug === (guests > 200 ? "grand" : guests > 80 ? "royal" : "mini"));

  if (done) {
    const v = form.getValues();
    return <FormSuccess title="Enquiry received" onReset={reset}>{v.eventType} for {v.guests} guests on {v.date}. Our events team replies within 4 business hours.</FormSuccess>;
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2" aria-label="Banquet enquiry">
        <SelectField name="eventType" label="Event type" required>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</SelectField>
        <TextField name="date" label="Event date" type="date" min={toISO(new Date())} required />
        <TextField name="guests" label="Expected guests" type="number" inputMode="numeric" required hint={`We suggest the ${suggested?.name} for this size`} />
        <SelectField name="hall" label="Hall" required>{HALLS.map((h) => <option key={h.slug} value={h.slug}>{h.name} (up to {h.capacity})</option>)}</SelectField>
        <SelectField name="pkg" label="Package" optional>
          <option value="">Not sure yet</option>
          {PACKAGES.map((p) => <option key={p.id}>{p.name}</option>)}
        </SelectField>
        <TextField name="name" label="Your name" autoComplete="name" required />
        <TextField name="mobile" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" required />
        <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" required />
        <TextareaField name="message" label="Anything we should know?" optional className="sm:col-span-2" />
        <FormRootError />
        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="sm:col-span-2">Request a Quote</Button>
      </form>
    </FormProvider>
  );
}
