"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { customerSchema } from "@/lib/admin-schemas";
import { btn, Card, Empty, ErrorNote, inputCls, Loading, PageTitle, Table, Td, Th } from "@/components/admin/primitives";
import { AField, Modal } from "@/components/admin/ui";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/cn";

interface F { name: string; company: string; gstin: string; email: string; mobile?: string; address?: string; creditDays: number }

export default function CustomersPage() {
  const { data, error, loading, reload } = useLoad(() => adminApi.customers());
  const invs = useLoad(() => adminApi.invoices());
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(customerSchema) as unknown as Resolver<F>,
    defaultValues: { name: "", company: "", gstin: "", email: "", mobile: "", address: "", creditDays: 7 },
  });

  const balanceOf = (id: string) =>
    (invs.data?.invoices ?? []).filter((r) => r.invoice.party.customerId === id && r.invoice.docType === "TAX_INVOICE").reduce((s, r) => s + r.ledger.balancePaise, 0);

  const submit = async (v: F) => {
    setServerError(null);
    try { await adminApi.createCustomer(v); reset(); setOpen(false); await reload(); }
    catch (e) { setServerError((e as Error).message); }
  };

  return (
    <>
      <PageTitle title="B2B customers" sub="Companies with GSTIN and credit terms. Customers are never deleted." action={<button className={btn.primary} onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> Add customer</button>} />
      <ErrorNote message={error} />
      <Card>
        {loading && !data ? <Loading /> : (
          <Table label="B2B customers">
            <thead><tr><Th>Company</Th><Th>GSTIN</Th><Th>Contact</Th><Th right>Credit days</Th><Th right>Outstanding</Th><Th><span className="sr-only">Invoices</span></Th></tr></thead>
            <tbody>
              {data?.customers.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">{c.company}</Td>
                  <Td className="font-mono text-xs">{c.gstin}</Td>
                  <Td>{c.name}<span className="block text-xs text-slate-500">{c.email}</span></Td>
                  <Td className="text-right">{c.creditDays}</Td>
                  <Td className={cn("price text-right", balanceOf(c.id) > 0 && "text-rose-600")}>{inrPaise(balanceOf(c.id))}</Td>
                  <Td><Link href={`/admin/invoices/new?type=B2B`} className={btn.ghost}>Invoice</Link></Td>
                </tr>
              ))}
              {data?.customers.length === 0 && <tr><td colSpan={6}><Empty>No B2B customers yet.</Empty></td></tr>}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add B2B customer" wide>
        <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
          {serverError && <div className="sm:col-span-2"><ErrorNote message={serverError} /></div>}
          <AField label="Company name" error={errors.company?.message}>{(a) => <input {...a} className={inputCls} {...register("company")} />}</AField>
          <AField label="GSTIN" error={errors.gstin?.message} hint="Checksum-validated">{(a) => <input {...a} className={cn(inputCls, "font-mono uppercase")} maxLength={15} {...register("gstin")} />}</AField>
          <AField label="Contact person" error={errors.name?.message}>{(a) => <input {...a} className={inputCls} {...register("name")} />}</AField>
          <AField label="Billing email" error={errors.email?.message}>{(a) => <input {...a} type="email" className={inputCls} {...register("email")} />}</AField>
          <AField label="Mobile" error={errors.mobile?.message}>{(a) => <input {...a} type="tel" className={inputCls} {...register("mobile")} />}</AField>
          <AField label="Credit days" error={errors.creditDays?.message}>{(a) => <input {...a} type="number" min={0} max={120} className={inputCls} {...register("creditDays", { valueAsNumber: true })} />}</AField>
          <AField label="Billing address" className="sm:col-span-2">{(a) => <input {...a} className={inputCls} {...register("address")} />}</AField>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className={btn.ghost} onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={btn.primary}>{isSubmitting ? "Saving…" : "Add customer"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
