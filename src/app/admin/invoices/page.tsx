"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, Plus, Search } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { btn, Card, Empty, ErrorNote, inputCls, Loading, PageTitle, StatusBadge, Table, Td, Th } from "@/components/admin/primitives";
import { useLoad } from "@/hooks/useLoad";
import { Notice } from "@/components/admin/ui";

export default function InvoicesPage() {
  const { data, error, loading, reload } = useLoad(() => adminApi.invoices());
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    return (data?.invoices ?? []).filter((r) => {
      const inv = r.invoice;
      const text = `${inv.number} ${inv.party.name} ${inv.party.company ?? ""} ${inv.party.gstin ?? ""} ${inv.bookingRef ?? ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (type !== "all" && inv.party.type !== type) return false;
      if (status === "overdue") return r.overdue;
      if (status !== "all" && r.ledger.status !== status) return false;
      return true;
    });
  }, [data, q, type, status]);

  const totals = useMemo(() => {
    const t = rows.filter((r) => r.invoice.docType === "TAX_INVOICE");
    return { billed: t.reduce((s, r) => s + r.invoice.totals.grandTotalPaise, 0), balance: t.reduce((s, r) => s + r.ledger.balancePaise, 0) };
  }, [rows]);

  const remind = async () => {
    setBusy(true);
    try { const r = await adminApi.runReminders(); setNote(`${r.sent} reminder email${r.sent === 1 ? "" : "s"} sent.`); await reload(); }
    catch (e) { setNote((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageTitle title="Invoices" sub="GST tax invoices and credit notes. Issued documents are immutable, corrections use credit notes."
        action={<div className="flex gap-2"><button className={btn.ghost} onClick={remind} disabled={busy}><BellRing className="size-4" aria-hidden /> Send reminders</button><Link href="/admin/invoices/new" className={btn.primary}><Plus className="size-4" aria-hidden /> New invoice</Link></div>} />
      <ErrorNote message={error} />
      {note && <div className="mb-4"><Notice tone="success">{note}</Notice></div>}
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <label htmlFor="iq" className="sr-only">Search invoices</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="iq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, customer, GSTIN, booking" className={`${inputCls} pl-9`} />
          </div>
          <label className="sr-only" htmlFor="it">Customer type</label>
          <select id="it" value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="all">B2C + B2B</option><option value="B2C">B2C</option><option value="B2B">B2B</option>
          </select>
          <label className="sr-only" htmlFor="is">Status</label>
          <select id="is" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="all">All statuses</option><option value="UNPAID">Unpaid</option><option value="PARTIAL">Partially paid</option>
            <option value="PAID">Paid</option><option value="overdue">Overdue</option><option value="CREDITED">Credited</option>
          </select>
          <p className="ml-auto text-sm text-slate-500">Billed <b className="price text-slate-900">{inrPaise(totals.billed)}</b> · Outstanding <b className="price text-rose-600">{inrPaise(totals.balance)}</b></p>
        </div>
        {loading && !data ? <Loading /> : (
          <Table label="Invoices">
            <thead><tr><Th>Invoice</Th><Th>Date</Th><Th>Customer</Th><Th>Type</Th><Th right>Total</Th><Th right>Balance</Th><Th>Due</Th><Th>Status</Th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const inv = r.invoice;
                const cn = inv.docType === "CREDIT_NOTE";
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <Td><Link href={`/admin/invoice?id=${inv.id}`} className="font-mono text-xs font-bold text-[#4f6bff] hover:underline">{inv.number}</Link></Td>
                    <Td>{fmtDate(inv.issuedAt, "d MMM yy")}</Td>
                    <Td><span className="font-medium">{inv.party.company || inv.party.name}</span>{inv.party.gstin && <span className="block font-mono text-[0.68rem] text-slate-400">{inv.party.gstin}</span>}</Td>
                    <Td><span className="text-xs font-bold text-slate-500">{cn ? "Credit note" : inv.party.type}</span></Td>
                    <Td className="price text-right">{cn ? "−" : ""}{inrPaise(inv.totals.grandTotalPaise)}</Td>
                    <Td className="price text-right">{cn ? "—" : inrPaise(r.ledger.balancePaise)}</Td>
                    <Td className={r.overdue ? "font-bold text-rose-600" : ""}>{cn ? "—" : fmtDate(inv.dueDate, "d MMM yy")}{r.overdue && <span className="block text-[0.68rem]">{r.daysOverdue}d overdue</span>}</Td>
                    <Td><span className="flex gap-1"><StatusBadge status={r.ledger.status} />{r.overdue && <StatusBadge status="overdue" />}</span></Td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={8}><Empty>No invoices match.</Empty></td></tr>}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
