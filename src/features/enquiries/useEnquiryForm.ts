"use client";

import { useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { publicApi } from "@/services/api";

/**
 * Shared engine behind every enquiry form (table, banquet, conference, contact):
 * validation with Zod, submit to `POST /enquiries`, server-error display and the "thank you" state.
 *
 * `toPayload` maps the form values to the API body (`kind` is added for you).
 * `summary` builds the confirmation sentence shown after success.
 */
export function useEnquiryForm<T extends FieldValues>({
  kind, schema, defaults, toPayload = (v) => v, onSuccess,
}: {
  kind: "Table" | "Banquet" | "Conference" | "Contact";
  schema: ZodType<unknown>;
  defaults: DefaultValues<T>;
  toPayload?: (values: T) => Record<string, unknown>;
  onSuccess?: () => void;
}) {
  const form = useForm<T>({ resolver: zodResolver(schema as never) as unknown as Resolver<T>, mode: "onTouched", defaultValues: defaults });
  const [done, setDone] = useState<string | null>(null);

  const submit = form.handleSubmit(async (values) => {
    try {
      await publicApi.sendEnquiry({ kind, ...toPayload(values) });
    } catch (e) {
      form.setError("root", { message: (e as Error).message });
      return;
    }
    onSuccess?.();
    setDone(kind);
  });

  const reset = () => {
    form.reset();
    setDone(null);
  };

  return { form, submit, done, reset };
}
