"use client";

import { FormProvider } from "react-hook-form";
import { FormRootError, FormSuccess, SelectField, TextField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { CONF_LAYOUTS } from "@/content/events";
import { toISO } from "@/lib/format";
import { conferenceSchema, type ConferenceValues } from "@/lib/schemas";
import { useStore } from "@/store/booking-store";
import { useEnquiryForm } from "./useEnquiryForm";

/** Rendered on a dark green background (conference page), hence the light label overrides. */
export function ConferenceForm() {
  const { prefill, setPrefill } = useStore();
  const { form, submit, done, reset } = useEnquiryForm<ConferenceValues>({
    kind: "Conference",
    schema: conferenceSchema,
    defaults: { name: "", company: "", email: "", mobile: "", date: prefill.date ?? "", attendees: prefill.guests ?? 30, layout: CONF_LAYOUTS[0].name, duration: "full", message: "" },
    toPayload: (v) => ({ ...v, message: v.message ?? "" }),
    onSuccess: () => setPrefill({}),
  });

  if (done) {
    const v = form.getValues();
    return <FormSuccess title="Proposal requested" onReset={reset}>{v.attendees} attendees on {v.date}. Expect a proposal within 4 business hours.</FormSuccess>;
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2 [&_label]:text-white/90 [&_p]:!text-red-300" aria-label="Conference enquiry">
        <TextField name="date" label="Preferred date" type="date" min={toISO(new Date())} required />
        <TextField name="attendees" label="Attendees" type="number" inputMode="numeric" required />
        <SelectField name="layout" label="Layout" required>{CONF_LAYOUTS.map((l) => <option key={l.name} value={l.name}>{l.name} · {l.seats} seats</option>)}</SelectField>
        <SelectField name="duration" label="Duration" required>
          <option value="half">Half day (4 h)</option>
          <option value="full">Full day (8 h)</option>
        </SelectField>
        <TextField name="name" label="Your name" autoComplete="name" required />
        <TextField name="company" label="Company" autoComplete="organization" required />
        <TextField name="email" label="Work email" type="email" inputMode="email" autoComplete="email" required />
        <TextField name="mobile" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" required />
        <FormRootError />
        <Button type="submit" variant="gold" size="lg" loading={form.formState.isSubmitting} className="sm:col-span-2">Request a Proposal</Button>
      </form>
    </FormProvider>
  );
}
