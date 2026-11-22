"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CheckCheck, Copy, Download, FileText, Mail, MessageCircle, Plus, Undo2, XCircle } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { paymentSchema } from "@/lib/admin-schemas";
import { fmtDate } from "@/lib/format";
import { btn, Card, ErrorNote, inputCls, Loading, PageTitle, StatusBadge, Table, Td, Th } from "@/components/admin/primitives";
import { useSession } from "@/components/admin/AdminShell";
import { AField, Modal, Notice } from "@/components/admin/ui";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/cn";

const METHOD_LABEL: Record<string, string> = {
  ONLINE: "Online (Cashfree)", CASH: "Cash", CARD: "Card (POS)", UPI: "UPI", NET_BANKING: "Net banking", BANK_TRANSFER: "Bank transfer / NEFT / RTGS", CHEQUE: "Cheque",
};
const OFFLINE_METHODS = ["CASH", "CARD", "UPI", "NET_BANKING", "BANK_TRANSFER", "CHEQUE"] as const;

interface PayForm {
  method: (typeof OFFLINE_METHODS)[number];
  amount: number;
  paidAt?: string;
  note?: string;
  upiTransactionId?: string;
  upiVpa?: string;
  bankReference?: string;
  cardLast4?: string;
  chequeNumber?: string;
  chequeBank?: string;
  chequeDate?: string;
}

function InvoiceDetail() {
  const id = useSearchParams().get("id") ?? "";
  const user = useSession();
  const { data, error, loading, reload } = useLoad(() => adminApi.invoice(id), [id]);
  const [modal, setModal] = useState<null | "pay" | "email" | "credit" | "refund">(null);
  const [flash, setFlash] = useState<{ tone: "success" | "warn"; text: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canPay = ["owner", "manager", "accountant", "frontdesk"].includes(user.role);
  const canResolve = ["owner", "manager", "accountant"].includes(user.role);

  if (loading && !data) return <Loading rows={5} />;
  if (!data) return <ErrorNote message={error ?? "Invoice not found"} />;

  const { invoice: inv, ledger, payments, overdue, daysOverdue } = data;
  const isCN = inv.docType === "CREDIT_NOTE";
  const settled = payments.filter((p) => p.status === "SUCCESS" && p.kind === "PAYMENT");
  const due = ledger.balancePaise - ledger.pendingChequePaise;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true); setActionError(null);
    try { await fn(); setFlash({ tone: "success", text: ok }); await reload(); }
    catch (e) { setActionError((e as Error).message); }
    finally { setBusy(false); }
  };

  const copyLink = async () => {
    try {
      const r = await adminApi.payLink(inv.id);
      await navigator.clipboard.writeText(r.url);
      setFlash({ tone: "success", text: "Payment link copied, valid for 30 days." });
    } catch (e) { setActionError((e as Error).message); }
  };
  const whatsapp = async () => {
    try { const r = await adminApi.shareInvoice(inv.id); window.open(r.whatsappUrl, "_blank", "noopener"); }
    catch (e) { setActionError((e as Error).message); }
  };

  return (
    <>
      <PageTitle
        title={inv.number}
        sub={`${isCN ? "Credit note" : "Tax invoice"} · ${inv.party.type} · issued ${fmtDate(inv.issuedAt)}${inv.bookingRef ? ` · booking ${inv.bookingRef}` : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            <a className={btn.ghost} href={adminApi.invoicePdfUrl(inv.id)} target="_blank" rel="noopener noreferrer"><Download className="size-4" aria-hidden /> Invoice PDF</a>
            {!isCN && <a className={btn.ghost} href={adminApi.invoicePdfUrl(inv.id, true)} target="_blank" rel="noopener noreferrer"><FileText className="size-4" aria-hidden /> Statement</a>}
            <button className={btn.ghost} onClick={() => setModal("email")}><Mail className="size-4" aria-hidden /> Email</button>
            <button className={btn.ghost} onClick={whatsapp}><MessageCircle className="size-4" aria-hidden /> WhatsApp</button>
            {!isCN && due > 0 && <button className={btn.ghost} onClick={copyLink}><Copy className="size-4" aria-hidden /> Pay link</button>}
          </div>
        }
      />
      <ErrorNote message={actionError ?? error} />
      {flash && <div className="mb-4"><Notice tone={flash.tone}>{flash.text}</Notice></div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bill to</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{inv.party.company || inv.party.name}</p>
                {inv.party.company && <p className="text-sm text-slate-600">Attn: {inv.party.name}</p>}
                {inv.party.gstin && <p className="font-mono text-sm text-slate-600">GSTIN {inv.party.gstin}</p>}
                <p className="text-sm text-slate-500">{inv.party.email}{inv.party.mobile ? ` · ${inv.party.mobile}` : ""}</p>
                {inv.party.address && <p className="text-sm text-slate-500">{inv.party.address}</p>}
              </div>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-slate-500">Place of supply</dt><dd className="font-medium">{inv.placeOfSupply}</dd>
                <dt className="text-slate-500">Due date</dt><dd className={cn("font-medium", overdue && "text-rose-600")}>{fmtDate(inv.dueDate)}{overdue ? ` · ${daysOverdue}d overdue` : ""}</dd>
                <dt className="text-slate-500">Created by</dt><dd className="font-medium break-all">{inv.createdBy}</dd>
                <dt className="text-slate-500">Document hash</dt><dd className="font-mono text-[0.68rem] break-all text-slate-500">{inv.pdfSha256.slice(0, 24)}…</dd>
              </dl>
            </div>
          </Card>

          <Card title="Items">
            <Table label="Invoice lines">
              <thead><tr><Th>Description</Th><Th>SAC</Th><Th right>Qty</Th><Th right>Rate</Th><Th right>Disc.</Th><Th right>Taxable</Th><Th right>GST</Th><Th right>Amount</Th></tr></thead>
              <tbody>
                {inv.lines.map((l, i) => (
                  <tr key={i}>
                    <Td className="max-w-xs whitespace-normal">{l.description}</Td>
                    <Td className="font-mono text-xs">{l.sac}</Td>
                    <Td className="text-right">{l.qty}</Td>
                    <Td className="price text-right">{inrPaise(l.unitPricePaise)}</Td>
                    <Td className="price text-right">{l.discountPaise ? `−${inrPaise(l.discountPaise)}` : "—"}</Td>
                    <Td className="price text-right">{inrPaise(l.taxablePaise)}</Td>
                    <Td className="text-right">{l.gstRate}%</Td>
                    <Td className="price text-right">{inrPaise(l.totalPaise)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Taxable value</dt><dd className="price">{inrPaise(inv.totals.taxablePaise)}</dd></div>
              {inv.totals.discountPaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">Discount{inv.discountNote ? ` (${inv.discountNote})` : ""}</dt><dd className="price text-emerald-700">−{inrPaise(inv.totals.discountPaise)}</dd></div>}
              {inv.totals.cgstPaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">CGST</dt><dd className="price">{inrPaise(inv.totals.cgstPaise)}</dd></div>}
              {inv.totals.sgstPaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">SGST</dt><dd className="price">{inrPaise(inv.totals.sgstPaise)}</dd></div>}
              {inv.totals.igstPaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">IGST</dt><dd className="price">{inrPaise(inv.totals.igstPaise)}</dd></div>}
              {inv.totals.roundOffPaise !== 0 && <div className="flex justify-between"><dt className="text-slate-500">Round off</dt><dd className="price">{inrPaise(inv.totals.roundOffPaise)}</dd></div>}
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-2"><dt className="font-bold">Total</dt><dd className="price text-2xl text-slate-900">{inrPaise(inv.totals.grandTotalPaise)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">{data.amountInWords}</p>
            {inv.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{inv.notes}</p>}
            {inv.ruleSnapshot.some((r) => !r.verified) && <div className="mt-4"><Notice tone="warn">Issued with GST rates not yet verified by your CA. Rules used are snapshotted on this document.</Notice></div>}
          </Card>

          <Card title="Payments">
            {payments.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No payments recorded yet.</p> : (
              <Table label="Payments">
                <thead><tr><Th>Date</Th><Th>Method</Th><Th>Reference</Th><Th>Receipt</Th><Th>Status</Th><Th right>Amount</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <Td>{fmtDate(p.paidAt, "d MMM yy, h:mm a")}</Td>
                      <Td>{p.kind === "REFUND" ? "Refund · " : ""}{METHOD_LABEL[p.method] ?? p.method}</Td>
                      <Td className="max-w-[16rem] whitespace-normal text-xs">
                        {p.upiTransactionId && <span className="block">UPI txn <b className="font-mono">{p.upiTransactionId}</b></span>}
                        {p.upiVpa && <span className="block text-slate-500">{p.upiVpa}</span>}
                        {p.bankReference && <span className="block">Ref <b className="font-mono">{p.bankReference}</b></span>}
                        {p.chequeNumber && <span className="block">Cheque <b className="font-mono">{p.chequeNumber}</b> · {p.chequeBank} · {fmtDate(p.chequeDate)}</span>}
                        {p.cardLast4 && <span className="block">Card •••• {p.cardLast4}</span>}
                        {p.note && <span className="block text-slate-400">{p.note}</span>}
                        <span className="block text-slate-400">by {p.recordedBy}</span>
                      </Td>
                      <Td className="font-mono text-xs">{p.receiptNumber ?? "—"}</Td>
                      <Td><StatusBadge status={p.kind === "REFUND" ? "refund" : p.status} /></Td>
                      <Td className="price text-right">{p.kind === "REFUND" ? "−" : ""}{inrPaise(p.amountPaise)}</Td>
                      <Td>
                        {p.status === "PENDING_CLEARANCE" && canResolve && (
                          <span className="flex gap-1">
                            <button className={btn.ghost} disabled={busy} onClick={() => run(() => adminApi.resolveCheque(inv.id, p.id, "CLEARED"), "Cheque marked as cleared.")}><CheckCheck className="size-4" aria-hidden /> Cleared</button>
                            <button className={btn.danger} disabled={busy} onClick={() => run(() => adminApi.resolveCheque(inv.id, p.id, "BOUNCED"), "Cheque marked as bounced.")}><XCircle className="size-4" aria-hidden /> Bounced</button>
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Ledger">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Invoice total</dt><dd className="price">{inrPaise(inv.totals.grandTotalPaise)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Received</dt><dd className="price text-emerald-700">{inrPaise(ledger.paidPaise)}</dd></div>
              {ledger.pendingChequePaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">Cheques pending</dt><dd className="price text-amber-700">{inrPaise(ledger.pendingChequePaise)}</dd></div>}
              {ledger.refundDuePaise > 0 && <div className="flex justify-between"><dt className="text-slate-500">Refund due</dt><dd className="price text-rose-600">{inrPaise(ledger.refundDuePaise)}</dd></div>}
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-3"><dt className="font-bold">Balance</dt><dd className={cn("price text-3xl", ledger.balancePaise > 0 ? "text-rose-600" : "text-emerald-700")}>{inrPaise(ledger.balancePaise)}</dd></div>
            </dl>
            <div className="mt-3 flex gap-2"><StatusBadge status={ledger.status} />{overdue && <StatusBadge status="overdue" />}</div>

            {!isCN && canPay && ledger.status !== "CREDITED" && due > 0 && (
              <button className={cn(btn.primary, "mt-5 w-full")} onClick={() => setModal("pay")}><Banknote className="size-4" aria-hidden /> Record payment</button>
            )}
            {ledger.refundDuePaise > 0 && canResolve && (
              <button className={cn(btn.ghost, "mt-3 w-full")} onClick={() => setModal("refund")}><Undo2 className="size-4" aria-hidden /> Record refund</button>
            )}
            {!isCN && ledger.status !== "CREDITED" && canResolve && ledger.pendingChequePaise === 0 && (
              <button className={cn(btn.danger, "mt-3 w-full")} onClick={() => setModal("credit")}>Issue credit note</button>
            )}
          </Card>
          {inv.bookingRef && <Card title="Booking"><Link href="/admin/bookings" className="font-mono text-sm font-bold text-[#4f6bff] hover:underline">{inv.bookingRef}</Link></Card>}
          {settled.length > 1 && <Notice tone="info">{settled.length} payments received against this invoice.</Notice>}
        </aside>
      </div>

      <PaymentModal open={modal === "pay"} onClose={() => setModal(null)} balancePaise={due} onSubmit={async (b) => { await adminApi.recordPayment(inv.id, b); setModal(null); setFlash({ tone: "success", text: "Payment recorded and receipt emailed." }); await reload(); }} />
      <EmailModal open={modal === "email"} onClose={() => setModal(null)} defaultTo={inv.party.email} onSend={async (to, msg) => { const r = await adminApi.emailInvoice(inv.id, to, msg); setModal(null); setFlash({ tone: "success", text: `Invoice emailed to ${r.to}.` }); }} />
      <ReasonModal open={modal === "credit"} onClose={() => setModal(null)} title="Issue credit note" cta="Issue credit note" danger
        help="A credit note is issued for the full invoice value. The original invoice stays on record and is marked credited."
        onSubmit={async (reason) => { await adminApi.issueCreditNote(inv.id, reason); setModal(null); setFlash({ tone: "success", text: "Credit note issued." }); await reload(); }} />
      <RefundModal open={modal === "refund"} onClose={() => setModal(null)} dueRupees={ledger.refundDuePaise / 100}
        onSubmit={async (b) => { await adminApi.refund(inv.id, b); setModal(null); setFlash({ tone: "success", text: "Refund recorded." }); await reload(); }} />
    </>
  );
}

/* ------------------------------------------------------------------ modals */
function PaymentModal({ open, onClose, balancePaise, onSubmit }: { open: boolean; onClose: () => void; balancePaise: number; onSubmit: (b: unknown) => Promise<void> }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<PayForm>({
    resolver: zodResolver(paymentSchema) as unknown as Resolver<PayForm>,
    defaultValues: { method: "UPI", amount: balancePaise / 100, chequeDate: new Date().toISOString().slice(0, 10) },
  });
  const method = watch("method");
  const submit = async (v: PayForm) => {
    setServerError(null);
    try {
      const clean = Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "" && x !== undefined && !(typeof x === "number" && Number.isNaN(x))));
      await onSubmit(clean);
      reset();
    } catch (e) { setServerError((e as Error).message); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Record payment">
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <ErrorNote message={serverError} />
        <AField label="Method" error={errors.method?.message}>
          {(a) => <select {...a} className={inputCls} {...register("method")}>{OFFLINE_METHODS.map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}</select>}
        </AField>
        <AField label="Amount received (₹)" error={errors.amount?.message} hint={`Outstanding: ${inrPaise(balancePaise)}, part-payments are allowed`}>
          {(a) => <input {...a} type="number" step="0.01" inputMode="decimal" className={inputCls} {...register("amount", { valueAsNumber: true })} />}
        </AField>
        {method === "UPI" && (
          <>
            <AField label="UPI transaction ID (UTR)" error={errors.upiTransactionId?.message} hint="Required, kept on the payment record">
              {(a) => <input {...a} className={cn(inputCls, "font-mono")} autoComplete="off" {...register("upiTransactionId")} />}
            </AField>
            <AField label="Payer UPI ID" error={errors.upiVpa?.message}>
              {(a) => <input {...a} className={inputCls} placeholder="name@okbank" autoCapitalize="none" {...register("upiVpa")} />}
            </AField>
          </>
        )}
        {(method === "NET_BANKING" || method === "BANK_TRANSFER") && (
          <AField label={method === "BANK_TRANSFER" ? "UTR / reference number" : "Bank reference"} error={errors.bankReference?.message}>
            {(a) => <input {...a} className={cn(inputCls, "font-mono")} {...register("bankReference")} />}
          </AField>
        )}
        {method === "CARD" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <AField label="Card last 4" error={errors.cardLast4?.message}>{(a) => <input {...a} inputMode="numeric" maxLength={4} className={inputCls} {...register("cardLast4")} />}</AField>
            <AField label="Auth / approval code">{(a) => <input {...a} className={inputCls} {...register("bankReference")} />}</AField>
          </div>
        )}
        {method === "CHEQUE" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <AField label="Cheque number" error={errors.chequeNumber?.message}>{(a) => <input {...a} inputMode="numeric" maxLength={6} className={cn(inputCls, "font-mono")} {...register("chequeNumber")} />}</AField>
              <AField label="Cheque date" error={errors.chequeDate?.message}>{(a) => <input {...a} type="date" className={inputCls} {...register("chequeDate")} />}</AField>
            </div>
            <AField label="Drawn on (bank)" error={errors.chequeBank?.message}>{(a) => <input {...a} className={inputCls} {...register("chequeBank")} />}</AField>
            <Notice tone="warn">Cheques stay <b>pending clearance</b> and don&apos;t reduce the balance until marked cleared.</Notice>
          </>
        )}
        <AField label="Note" error={errors.note?.message}>{(a) => <input {...a} className={inputCls} {...register("note")} />}</AField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={btn.ghost} onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className={btn.primary}><Plus className="size-4" aria-hidden /> {isSubmitting ? "Saving…" : "Record payment"}</button>
        </div>
      </form>
    </Modal>
  );
}

function EmailModal({ open, onClose, defaultTo, onSend }: { open: boolean; onClose: () => void; defaultTo: string; onSend: (to: string, msg: string) => Promise<void> }) {
  const [to, setTo] = useState(defaultTo);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Email invoice">
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await onSend(to, msg); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); } }} className="space-y-4">
        <ErrorNote message={err} />
        <AField label="To">{(a) => <input {...a} type="email" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} required />}</AField>
        <AField label="Message (optional)">{(a) => <textarea {...a} value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className={cn(inputCls, "py-2")} />}</AField>
        <p className="text-xs text-slate-500">Sends the PDF as an attachment with a secure download link and, if a balance is due, an online payment link.</p>
        <div className="flex justify-end gap-3"><button type="button" className={btn.ghost} onClick={onClose}>Cancel</button><button type="submit" disabled={busy} className={btn.primary}><Mail className="size-4" aria-hidden /> {busy ? "Sending…" : "Send"}</button></div>
      </form>
    </Modal>
  );
}

function ReasonModal({ open, onClose, title, help, cta, danger, onSubmit }: { open: boolean; onClose: () => void; title: string; help: string; cta: string; danger?: boolean; onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await onSubmit(reason); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); } }} className="space-y-4">
        <ErrorNote message={err} />
        <p className="text-sm text-slate-600">{help}</p>
        <AField label="Reason (printed on the credit note)">{(a) => <input {...a} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} minLength={5} required />}</AField>
        <div className="flex justify-end gap-3"><button type="button" className={btn.ghost} onClick={onClose}>Cancel</button><button type="submit" disabled={busy} className={danger ? btn.danger : btn.primary}>{busy ? "Working…" : cta}</button></div>
      </form>
    </Modal>
  );
}

function RefundModal({ open, onClose, dueRupees, onSubmit }: { open: boolean; onClose: () => void; dueRupees: number; onSubmit: (b: unknown) => Promise<void> }) {
  const [amount, setAmount] = useState(dueRupees);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Record refund">
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await onSubmit({ amount, method, reference: ref || undefined }); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); } }} className="space-y-4">
        <ErrorNote message={err} />
        <AField label="Amount refunded (₹)" hint={`Refund due: ₹${dueRupees.toLocaleString("en-IN")}`}>{(a) => <input {...a} type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputCls} />}</AField>
        <AField label="Method">{(a) => <select {...a} value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>{["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE"].map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}</select>}</AField>
        <AField label="Reference / UTR">{(a) => <input {...a} value={ref} onChange={(e) => setRef(e.target.value)} className={inputCls} />}</AField>
        <div className="flex justify-end gap-3"><button type="button" className={btn.ghost} onClick={onClose}>Cancel</button><button type="submit" disabled={busy} className={btn.primary}>{busy ? "Saving…" : "Record refund"}</button></div>
      </form>
    </Modal>
  );
}

export default function Page() {
  return <Suspense fallback={<Loading rows={5} />}><InvoiceDetail /></Suspense>;
}
