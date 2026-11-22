"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminApi } from "@/services/api";
import { fmtDate } from "@/lib/format";
import { gstinChecksumOk } from "@/lib/gstin";
import { btn, Card, ErrorNote, inputCls, Loading, PageTitle, Table, Td, Th, Toggle } from "@/components/admin/primitives";
import { useSession } from "@/components/admin/AdminShell";
import { AField, Notice } from "@/components/admin/ui";
import { useLoad } from "@/hooks/useLoad";

const settingsSchema = z.object({
  name: z.string().trim().min(2, "Enter the legal / trade name"),
  gstin: z.string().trim().toUpperCase().refine(gstinChecksumOk, "Enter a valid 15-character GSTIN"),
  address: z.string().trim().min(10, "Enter the full address"),
  phone: z.string().trim().min(8),
  email: z.email("Enter a valid email"),
  bankName: z.string().trim().optional(),
  bankAccount: z.string().trim().optional(),
  bankIfsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC looks like SBIN0001234").optional().or(z.literal("")),
  upiId: z.string().trim().optional(),
  defaultCreditDays: z.number().int().min(0).max(120),
});
type S = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const user = useSession();
  const isOwner = user.role === "owner";
  const settings = useLoad(() => adminApi.settings());
  const users = useLoad(() => (isOwner ? adminApi.users() : Promise.resolve({ users: [] })), [isOwner]);
  const audit = useLoad(() => (isOwner ? adminApi.audit() : Promise.resolve({ entries: [] })), [isOwner]);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<S>({ resolver: zodResolver(settingsSchema) as never });
  useEffect(() => { if (settings.data) reset(settings.data.settings as S); }, [settings.data, reset]);

  const save = async (v: S) => {
    setErr(null);
    try { await adminApi.saveSettings(v); setSaved(true); } catch (e) { setErr((e as Error).message); }
  };

  /* new staff */
  const [nu, setNu] = useState({ name: "", email: "", role: "frontdesk", password: "" });
  const [nuErr, setNuErr] = useState<string | null>(null);
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault(); setNuErr(null);
    try { await adminApi.createUser(nu); setNu({ name: "", email: "", role: "frontdesk", password: "" }); await users.reload(); }
    catch (x) { setNuErr((x as Error).message); }
  };

  return (
    <>
      <PageTitle title="Settings & staff" sub="Seller details printed on invoices, staff accounts and the audit trail." />
      <ErrorNote message={err ?? settings.error} />
      <div className="space-y-6">
        <Card title="Business details (printed on every invoice)">
          {settings.loading && !settings.data ? <Loading rows={3} /> : (
            <form onSubmit={handleSubmit(save)} noValidate className="grid gap-4 sm:grid-cols-2">
              <AField label="Legal / trade name" error={errors.name?.message}>{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("name")} />}</AField>
              <AField label="Hotel GSTIN" error={errors.gstin?.message}>{(a) => <input {...a} disabled={!isOwner} className={`${inputCls} font-mono uppercase`} maxLength={15} {...register("gstin")} />}</AField>
              <AField label="Address" error={errors.address?.message} className="sm:col-span-2">{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("address")} />}</AField>
              <AField label="Phone" error={errors.phone?.message}>{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("phone")} />}</AField>
              <AField label="Email" error={errors.email?.message}>{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("email")} />}</AField>
              <AField label="Bank name">{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("bankName")} />}</AField>
              <AField label="Account number">{(a) => <input {...a} disabled={!isOwner} className={inputCls} {...register("bankAccount")} />}</AField>
              <AField label="IFSC" error={errors.bankIfsc?.message}>{(a) => <input {...a} disabled={!isOwner} className={`${inputCls} font-mono uppercase`} {...register("bankIfsc")} />}</AField>
              <AField label="Default credit days (B2B)" error={errors.defaultCreditDays?.message}>{(a) => <input {...a} type="number" disabled={!isOwner} className={inputCls} {...register("defaultCreditDays", { valueAsNumber: true })} />}</AField>
              {isOwner && (
                <div className="flex items-center gap-4 sm:col-span-2">
                  <button type="submit" className={btn.primary} disabled={isSubmitting}>Save details</button>
                  {saved && <span role="status" className="text-sm font-semibold text-emerald-700">Saved</span>}
                </div>
              )}
              {!isOwner && <p className="text-sm text-slate-500 sm:col-span-2">Only the owner can edit business details.</p>}
            </form>
          )}
        </Card>

        {isOwner && (
          <>
            <Card title="Staff accounts">
              <ErrorNote message={nuErr} />
              <Table label="Staff">
                <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Created</Th><Th>Active</Th></tr></thead>
                <tbody>
                  {users.data?.users.map((u) => (
                    <tr key={u.email}>
                      <Td className="font-medium">{u.name}</Td><Td>{u.email}</Td><Td className="capitalize">{u.role}</Td><Td>{fmtDate(u.createdAt)}</Td>
                      <Td><Toggle on={u.active} disabled={u.email === user.email} onChange={async () => { await adminApi.updateUser(u.email, { active: !u.active }); await users.reload(); }} label={`${u.name} active`} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <form onSubmit={addUser} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-5">
                <AField label="Name">{(a) => <input {...a} required value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} className={inputCls} />}</AField>
                <AField label="Email">{(a) => <input {...a} type="email" required value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} className={inputCls} />}</AField>
                <AField label="Role">{(a) => <select {...a} value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })} className={inputCls}><option value="frontdesk">Front desk</option><option value="accountant">Accountant</option><option value="manager">Manager</option><option value="owner">Owner</option></select>}</AField>
                <AField label="Temp password">{(a) => <input {...a} type="password" required minLength={10} autoComplete="new-password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} className={inputCls} />}</AField>
                <div className="flex items-end"><button type="submit" className={btn.primary}>Add staff</button></div>
              </form>
              <div className="mt-4"><Notice tone="info">Roles, <b>Front desk</b>: bookings, invoices, record payments · <b>Accountant</b>: + credit notes, cheque clearance, tax rules, reports · <b>Manager</b>: + rooms &amp; rates · <b>Owner</b>: everything incl. staff.</Notice></div>
            </Card>

            <Card title="Audit trail (this month)">
              <Table label="Audit log">
                <thead><tr><Th>When</Th><Th>Who</Th><Th>Action</Th><Th>Target</Th></tr></thead>
                <tbody>
                  {audit.data?.entries.map((e, i) => (
                    <tr key={i}><Td>{fmtDate(e.at, "d MMM, h:mm a")}</Td><Td>{e.actor}</Td><Td className="font-mono text-xs">{e.action}</Td><Td className="font-mono text-xs">{e.target}</Td></tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
