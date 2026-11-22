"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { invoiceSchema } from "@/lib/admin-schemas";
import { useInvoicePreview } from "@/hooks/useInvoicePreview";
import type { TaxRule } from "@/types/api";
import { btn, Card, ErrorNote, inputCls, Loading, PageTitle } from "@/components/admin/primitives";
import { useSession } from "@/components/admin/AdminShell";
import { AField, Notice } from "@/components/admin/ui";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/cn";

interface FormValues {
  party: { type: "B2C" | "B2B"; name: string; email: string; mobile?: string; company?: string; gstin?: string; address?: string; customerId?: string };
  items: { description: string; ruleCode: string; qty: number; unitPrice: number; tariff?: number }[];
  discount?: { type: "percent" | "flat"; value: number };
  discountNote?: string;
  dueDate?: string;
  notes?: string;
  sendEmail: boolean;
}

const PRESETS = [
  { label: "Room stay", ruleCode: "ROOM_ACCOMMODATION", description: "Room accommodation" },
  { label: "Restaurant", ruleCode: "RESTAURANT_FNB", description: "Restaurant, food & beverage" },
  { label: "Banquet hall", ruleCode: "BANQUET_HALL", description: "Banquet hall hire" },
  { label: "Banquet catering", ruleCode: "BANQUET_CATERING", description: "Banquet catering (per guest)" },
  { label: "Conference", ruleCode: "CONFERENCE_HALL", description: "Conference hall hire" },
];

const addDaysISO = (n: number) => new Date(Date.now() + 5.5 * 3600_000 + n * 86400_000).toISOString().slice(0, 10);

function NewInvoice() {
  const router = useRouter();
  const sp = useSearchParams();
  const user = useSession();
  const rulesQ = useLoad(() => adminApi.taxRules());
  const custQ = useLoad(() => adminApi.customers());
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(invoiceSchema) as unknown as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: {
      party: { type: sp.get("type") === "B2B" ? "B2B" : "B2C", name: "", email: "", mobile: "", company: "", gstin: "", address: "" },
      items: [{ description: "Restaurant, food & beverage", ruleCode: "RESTAURANT_FNB", qty: 1, unitPrice: 0 }],
      discount: undefined, discountNote: "", dueDate: addDaysISO(0), notes: "", sendEmail: true,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const v = watch();
  const rules: TaxRule[] = rulesQ.data?.rules ?? [];
  const isB2B = v.party.type === "B2B";

  // pick an existing B2B customer → prefill + credit terms
  const pickCustomer = (id: string) => {
    const c = custQ.data?.customers.find((x) => x.id === id);
    if (!c) return setValue("party.customerId", undefined);
    setValue("party.customerId", c.id);
    setValue("party.name", c.name); setValue("party.company", c.company); setValue("party.gstin", c.gstin);
    setValue("party.email", c.email); setValue("party.mobile", c.mobile ?? ""); setValue("party.address", c.address ?? "");
    setValue("dueDate", addDaysISO(c.creditDays));
  };
  useEffect(() => {
    if (!isB2B) { setValue("party.customerId", undefined); }
  }, [isB2B, setValue]);

  const preview = useInvoicePreview(
    (v.items ?? []).map((i) => ({ ruleCode: i.ruleCode, description: i.description, qty: Number(i.qty), unitPrice: Number(i.unitPrice), tariff: i.tariff ? Number(i.tariff) : undefined })),
    v.discount?.value ? { type: v.discount.type, value: Number(v.discount.value) } : undefined,
    v.party.gstin,
  );

  const onSubmit = async (val: FormValues) => {
    setServerError(null); setFieldErrors({});
    try {
      const payload = { ...val, discount: val.discount?.value ? val.discount : undefined };
      const r = await adminApi.createInvoice(payload);
      router.push(`/admin/invoice?id=${r.invoice.id}`);
    } catch (e: any) {
      setServerError(e.message);
      if (e.fields) setFieldErrors(e.fields);
    }
  };

  if (!["owner", "manager", "accountant", "frontdesk"].includes(user.role)) return null;
  if (rulesQ.loading) return <Loading rows={4} />;

  const err = (path: string, fallback?: string) => fieldErrors[path] ?? fallback;

  return (
    <>
      <PageTitle title="New invoice" sub="Rooms, restaurant, banquet and conference billing with GST by SAC code." />
      <ErrorNote message={serverError} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card title="Customer">
            <div role="radiogroup" aria-label="Customer type" className="mb-5 inline-flex rounded-xl bg-slate-100 p-1">
              {(["B2C", "B2B"] as const).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={v.party.type === t} onClick={() => setValue("party.type", t)}
                  className={cn("min-h-10 rounded-lg px-5 text-sm font-bold transition-colors", v.party.type === t ? "bg-white text-[#4f6bff] shadow-sm" : "text-slate-500")}>
                  {t === "B2C" ? "B2C · Guest" : "B2B · Company (GST)"}
                </button>
              ))}
            </div>

            {isB2B && (
              <AField label="Existing customer" className="mb-4" hint="Or fill in the details below to add a new one automatically">
                {(a) => (
                  <select {...a} className={inputCls} onChange={(e) => pickCustomer(e.target.value)} defaultValue="">
                    <option value="">— New / not listed —</option>
                    {custQ.data?.customers.map((c) => <option key={c.id} value={c.id}>{c.company} · {c.gstin}</option>)}
                  </select>
                )}
              </AField>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <AField label={isB2B ? "Contact person" : "Guest name"} error={err("party.name", errors.party?.name?.message)}>
                {(a) => <input {...a} className={inputCls} autoComplete="off" {...register("party.name")} />}
              </AField>
              <AField label="Email" error={err("party.email", errors.party?.email?.message)} hint="Invoice and payment links go here">
                {(a) => <input {...a} type="email" className={inputCls} {...register("party.email")} />}
              </AField>
              <AField label="Mobile" error={err("party.mobile", errors.party?.mobile?.message)} hint="Used for WhatsApp sharing">
                {(a) => <input {...a} type="tel" inputMode="tel" className={inputCls} {...register("party.mobile")} />}
              </AField>
              {isB2B && (
                <>
                  <AField label="Company name" error={err("party.company", errors.party?.company?.message)}>
                    {(a) => <input {...a} className={inputCls} {...register("party.company")} />}
                  </AField>
                  <AField label="Customer GSTIN" error={err("party.gstin", errors.party?.gstin?.message)} hint="Validated with the GSTN checksum">
                    {(a) => <input {...a} className={cn(inputCls, "font-mono uppercase")} maxLength={15} {...register("party.gstin")} />}
                  </AField>
                  <AField label="Billing address" className="sm:col-span-2">
                    {(a) => <input {...a} className={inputCls} {...register("party.address")} />}
                  </AField>
                </>
              )}
            </div>
          </Card>

          <Card title="Line items" action={
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" className={btn.ghost} onClick={() => append({ description: p.description, ruleCode: p.ruleCode, qty: 1, unitPrice: 0 })}>
                  <Plus className="size-3.5" aria-hidden /> {p.label}
                </button>
              ))}
            </div>
          }>
            <ul className="space-y-4">
              {fields.map((f, i) => {
                const rule = rules.find((r) => r.code === v.items?.[i]?.ruleCode);
                return (
                  <li key={f.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="grid gap-3 sm:grid-cols-12">
                      <AField label="Service" className="sm:col-span-4" error={errors.items?.[i]?.ruleCode?.message}>
                        {(a) => (
                          <select {...a} className={inputCls} {...register(`items.${i}.ruleCode`)}>
                            {rules.map((r) => <option key={r.code} value={r.code}>{r.description} · SAC {r.sac}</option>)}
                          </select>
                        )}
                      </AField>
                      <AField label="Description" className="sm:col-span-8" error={err(`items.${i}.description`, errors.items?.[i]?.description?.message)}>
                        {(a) => <input {...a} className={inputCls} {...register(`items.${i}.description`)} />}
                      </AField>
                      <AField label="Qty / nights" className="sm:col-span-3" error={errors.items?.[i]?.qty?.message}>
                        {(a) => <input {...a} type="number" step="any" inputMode="decimal" className={inputCls} {...register(`items.${i}.qty`, { valueAsNumber: true })} />}
                      </AField>
                      <AField label="Unit price (₹, excl. GST)" className="sm:col-span-4" error={errors.items?.[i]?.unitPrice?.message}>
                        {(a) => <input {...a} type="number" step="0.01" inputMode="decimal" className={inputCls} {...register(`items.${i}.unitPrice`, { valueAsNumber: true })} />}
                      </AField>
                      <div className="flex items-end justify-between gap-3 sm:col-span-5">
                        <p className="text-xs text-slate-500">
                          {rule ? <>GST <b className="text-slate-800">{rule.slabs ? "5% / 18% by tariff" : `${rule.rate}%`}</b>{!rule.verified && <span className="ml-1 font-bold text-amber-600">· unverified</span>}</> : null}
                        </p>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(i)} className={btn.danger} aria-label={`Remove line ${i + 1}`}><Trash2 className="size-4" aria-hidden /></button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {errors.items?.message && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{errors.items.message as string}</p>}
          </Card>

          <Card title="Discount, due date & notes">
            <div className="grid gap-4 sm:grid-cols-4">
              <AField label="Discount">
                {(a) => (
                  <Controller control={control} name="discount.type" defaultValue="percent" render={({ field }) => (
                    <select {...a} className={inputCls} value={field.value ?? "percent"} onChange={field.onChange}><option value="percent">Percent %</option><option value="flat">Flat ₹</option></select>
                  )} />
                )}
              </AField>
              <AField label="Value" error={errors.discount?.value?.message}>
                {(a) => <input {...a} type="number" step="0.01" min={0} className={inputCls} {...register("discount.value", { valueAsNumber: true, setValueAs: (x) => (x === "" || Number.isNaN(Number(x)) ? undefined : Number(x)) })} />}
              </AField>
              <AField label="Reason" className="sm:col-span-2">
                {(a) => <input {...a} className={inputCls} placeholder="Corporate rate, loyalty…" {...register("discountNote")} />}
              </AField>
              <AField label="Due date" error={err("dueDate", errors.dueDate?.message)} className="sm:col-span-2">
                {(a) => <input {...a} type="date" className={inputCls} {...register("dueDate")} />}
              </AField>
              <AField label="Notes (printed on invoice)" className="sm:col-span-4">
                {(a) => <input {...a} className={inputCls} {...register("notes")} />}
              </AField>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Summary" className="xl:sticky xl:top-24">
            {preview ? (
              <dl className="space-y-2 text-sm">
                {preview.lines.map((l, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <dt className="min-w-0 truncate text-slate-500">{l.description} <span className="text-xs">({l.gstRate}%)</span></dt>
                    <dd className="price shrink-0">{inrPaise(l.taxablePaise)}</dd>
                  </div>
                ))}
                {preview.totals.discountPaise > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd className="price">−{inrPaise(preview.totals.discountPaise)}</dd></div>}
                <div className="flex justify-between border-t border-slate-100 pt-2"><dt className="text-slate-500">Taxable value</dt><dd className="price">{inrPaise(preview.totals.taxablePaise)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">CGST</dt><dd className="price">{inrPaise(preview.totals.cgstPaise)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">SGST</dt><dd className="price">{inrPaise(preview.totals.sgstPaise)}</dd></div>
                {preview.totals.igstPaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">IGST</dt><dd className="price">{inrPaise(preview.totals.igstPaise)}</dd></div>}
                {preview.totals.roundOffPaise !== 0 && <div className="flex justify-between"><dt className="text-slate-500">Round off</dt><dd className="price">{inrPaise(preview.totals.roundOffPaise)}</dd></div>}
                <div className="flex items-baseline justify-between border-t border-slate-200 pt-3"><dt className="font-bold">Total</dt><dd className="price text-2xl text-slate-900">{inrPaise(preview.totals.grandTotalPaise)}</dd></div>
              </dl>
            ) : <p className="text-sm text-slate-500">Add a price to see the GST breakdown.</p>}

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-[#4f6bff]" {...register("sendEmail")} />
              <span>Email the invoice (PDF + pay link) to the customer</span>
            </label>
            <button type="submit" disabled={isSubmitting} className={cn(btn.primary, "mt-5 w-full")}>{isSubmitting ? "Generating…" : "Generate invoice"}</button>
            <p className="mt-3 text-xs text-slate-400">Once generated, an invoice cannot be edited or deleted. Use a credit note to correct it.</p>
          </Card>
          {rules.some((r) => !r.verified) && <Notice tone="warn">Some GST rates are not yet marked verified by your CA. Review them under <b>Tax rules</b> before issuing live invoices.</Notice>}
        </aside>
      </form>
    </>
  );
}

export default function Page() {
  return <Suspense><NewInvoice /></Suspense>;
}
