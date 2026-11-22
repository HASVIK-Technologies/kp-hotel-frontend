"use client";

import Link from "next/link";
import { useState } from "react";
import { Download } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { Card, Empty, ErrorNote, inputCls, Loading, PageTitle, Table, Td, Th } from "@/components/admin/primitives";
import { useLoad } from "@/hooks/useLoad";
import { monthStartISO, todayISO } from "@/lib/format";
import { btn } from "@/components/admin/primitives";

const BUCKETS: [string, string][] = [["current", "Not yet due"], ["d1_30", "1–30 days"], ["d31_60", "31–60 days"], ["d61_90", "61–90 days"], ["d90plus", "90+ days"]];
const METHODS: Record<string, string> = { ONLINE: "Online (Cashfree)", CASH: "Cash", CARD: "Card (POS)", UPI: "UPI", NET_BANKING: "Net banking", BANK_TRANSFER: "Bank transfer", CHEQUE: "Cheque" };

function csv(rows: (string | number)[][], name: string) {
  const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export default function ReportsPage() {
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const aging = useLoad(() => adminApi.outstanding());
  const gst = useLoad(() => adminApi.gst(from, to), [from, to]);
  const col = useLoad(() => adminApi.collections(from, to), [from, to]);

  return (
    <>
      <PageTitle title="Reports" sub="Outstanding balances, GST summary and collections."
        action={
          <div className="flex flex-wrap items-end gap-3">
            <div><label htmlFor="rf" className="mb-1 block text-xs font-bold uppercase text-slate-500">From</label><input id="rf" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} /></div>
            <div><label htmlFor="rt" className="mb-1 block text-xs font-bold uppercase text-slate-500">To</label><input id="rt" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} /></div>
          </div>
        } />
      <ErrorNote message={aging.error ?? gst.error ?? col.error} />
      <div className="space-y-6">
        <Card title="Outstanding receivables (as of today)">
          {aging.loading && !aging.data ? <Loading rows={2} /> : aging.data && (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {BUCKETS.map(([k, label]) => (
                  <li key={k} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="price mt-1 text-lg text-slate-900">{inrPaise(aging.data!.buckets[k] ?? 0)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Table label="Outstanding invoices">
                  <thead><tr><Th>Invoice</Th><Th>Customer</Th><Th>Type</Th><Th>Due</Th><Th right>Days overdue</Th><Th right>Balance</Th></tr></thead>
                  <tbody>
                    {aging.data.rows.map((r) => (
                      <tr key={r.invoiceId}>
                        <Td><Link className="font-mono text-xs font-bold text-[#4f6bff] hover:underline" href={`/admin/invoice?id=${r.invoiceId}`}>{r.number}</Link></Td>
                        <Td>{r.party}</Td><Td>{r.type}</Td><Td>{r.dueDate}</Td>
                        <Td className={r.daysOverdue > 0 ? "text-right font-bold text-rose-600" : "text-right"}>{r.daysOverdue || "—"}</Td>
                        <Td className="price text-right">{inrPaise(r.balancePaise)}</Td>
                      </tr>
                    ))}
                    {aging.data.rows.length === 0 && <tr><td colSpan={6}><Empty>Nothing outstanding 🎉</Empty></td></tr>}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card>

        <Card title="Collections by method" >
          {col.data && (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(col.data.byMethod).map(([m, v]) => (
                  <li key={m} className="rounded-xl bg-slate-50 p-3"><p className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">{METHODS[m] ?? m}</p><p className="price mt-1 text-lg">{inrPaise(v)}</p></li>
                ))}
                <li className="rounded-xl bg-[#4f6bff]/10 p-3"><p className="text-[0.68rem] font-bold uppercase tracking-wide text-[#4f6bff]">Total · {col.data.count} receipts</p><p className="price mt-1 text-lg text-slate-900">{inrPaise(col.data.totalPaise)}</p></li>
              </ul>
            </>
          )}
        </Card>

        <Card title="GST summary (GSTR-1 view)" action={gst.data && (
          <button className={btn.ghost} onClick={() => csv([["SAC", "GST %", "Taxable", "CGST", "SGST", "IGST"], ...gst.data!.byRate.map((r) => [r.sac, r.rate, r.taxable / 100, r.cgst / 100, r.sgst / 100, r.igst / 100])], `gst-summary-${from}-${to}.csv`)}>
            <Download className="size-4" aria-hidden /> CSV
          </button>
        )}>
          {gst.data && (
            <>
              <Table label="GST by SAC and rate">
                <thead><tr><Th>SAC</Th><Th right>Rate</Th><Th right>Taxable value</Th><Th right>CGST</Th><Th right>SGST</Th><Th right>IGST</Th></tr></thead>
                <tbody>
                  {gst.data.byRate.map((r) => (
                    <tr key={`${r.sac}-${r.rate}`}><Td className="font-mono text-xs">{r.sac}</Td><Td className="text-right">{r.rate}%</Td><Td className="price text-right">{inrPaise(r.taxable)}</Td><Td className="price text-right">{inrPaise(r.cgst)}</Td><Td className="price text-right">{inrPaise(r.sgst)}</Td><Td className="price text-right">{inrPaise(r.igst)}</Td></tr>
                  ))}
                  <tr className="font-bold"><Td>Total</Td><Td /><Td className="price text-right">{inrPaise(gst.data.totalTaxablePaise)}</Td><Td className="price text-right" >{inrPaise(gst.data.totalTaxPaise)}</Td><Td /><Td /></tr>
                </tbody>
              </Table>
              <p className="mt-3 text-xs text-slate-500">Credit notes are netted. Totals show combined tax in the CGST column footer. B2B invoices: {gst.data.b2b.length} · B2C taxable value {inrPaise(gst.data.b2c.taxablePaise)}.</p>
              {gst.data.b2b.length > 0 && (
                <div className="mt-4">
                  <Table label="B2B invoices">
                    <thead><tr><Th>Invoice</Th><Th>Date</Th><Th>GSTIN</Th><Th>Customer</Th><Th right>Taxable</Th><Th right>Tax</Th><Th right>Total</Th></tr></thead>
                    <tbody>
                      {gst.data.b2b.map((r: any) => (
                        <tr key={r.number}><Td className="font-mono text-xs">{r.number}</Td><Td>{r.date}</Td><Td className="font-mono text-xs">{r.gstin}</Td><Td>{r.party}</Td><Td className="price text-right">{inrPaise(r.taxable)}</Td><Td className="price text-right">{inrPaise(r.tax)}</Td><Td className="price text-right">{inrPaise(r.total)}</Td></tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
