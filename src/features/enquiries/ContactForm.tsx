"use client";

import { FormProvider } from "react-hook-form";
import { FormRootError, FormSuccess, SelectField, TextareaField, TextField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { contactSchema, type ContactValues } from "@/lib/schemas";
import { useEnquiryForm } from "./useEnquiryForm";

const SUBJECTS = ["Room booking", "Restaurant", "Banquet & events", "Conference", "Feedback", "Something else"];

export function ContactForm() {
  const { form, submit, done, reset } = useEnquiryForm<ContactValues>({
    kind: "Contact",
    schema: contactSchema,
    defaults: { name: "", email: "", mobile: "", subject: "", message: "" },
    toPayload: (v) => ({ ...v, mobile: v.mobile ?? "" }),
  });

  if (done) return <FormSuccess title="Message sent" onReset={reset}>We&apos;ll get back to you within one business day.</FormSuccess>;
  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2" aria-label="Contact us">
        <TextField name="name" label="Your name" autoComplete="name" required />
        <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" required />
        <TextField name="mobile" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" optional />
        <SelectField name="subject" label="Subject" required>
          <option value="">Choose a subject</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </SelectField>
        <TextareaField name="message" label="Message" rows={5} required className="sm:col-span-2" />
        <FormRootError />
        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="sm:col-span-2 sm:justify-self-start">Send message</Button>
      </form>
    </FormProvider>
  );
}
