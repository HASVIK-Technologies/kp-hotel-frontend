"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { Card, Empty, ErrorNote, inputCls, Loading, PageTitle, StatusBadge, Table, Td, Th } from "@/components/admin/primitives";
import { useLoad } from "@/hooks/useLoad";

const LABEL: Record<string, string> = { ONLINE: "Online (Cashfree)", CASH: "Cash", CARD: "Card (POS)", UPI: "UPI", NET_BANKING: "Net banking", BANK_TRANSFER: "Bank transfer", CHEQUE: "Cheque" };

export default function PaymentsPage() {
  const { data, error, loading } = useLoad(() => adminApi.payments());
  const [method, setMethod] = useState("all");
  const rows = useMemo(() => (data?.payments ?? []).filter((p) => method === "all" || p.method === method), [data, method]);
  const total = rows.filter((p) => p.status === "SUCCESS").reduce((s, p) => s + (p.kind === "REFUND" ? -p.amountPaise : p.amountPaise), 0);

  return (
    <>
      <PageTitle title="Payments" sub="Every receipt across online and offline methods." />
      <ErrorNote message={error} />
      <Card action={<p className="text-sm text-slate-500">Net received <b className="price text-slate-900">{inrPaise(total)}</b></p>}>
        <div className="mb-4">
          <label htmlFor="pm" className="sr-only">Method</label>
          <select id="pm" value={method} onChange={(e) => setMethod(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="all">All methods</option>
            {Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {loading && !data ? <Loading /> : (
          <Table label="Payments">
            <thead><tr><Th>Date</Th><Th>Receipt</Th><Th>Invoice</Th><Th>Method</Th><Th>Reference</Th><Th>Status</Th><Th right>Amount</Th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>{fmtDate(p.paidAt, "d MMM yy, h:mm a")}</Td>
                  <Td className="font-mono text-xs">{p.receiptNumber ?? "—"}</Td>
                  <Td><Link href={`/admin/invoice?id=${p.invoiceId}`} className="font-bold text-[#4f6bff] hover:underline">Open</Link></Td>
                  <Td>{p.kind === "REFUND" ? "Refund · " : ""}{LABEL[p.method]}</Td>
                  <Td className="font-mono text-xs">{p.upiTransactionId ?? p.bankReference ?? p.chequeNumber ?? "—"}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td className="price text-right">{p.kind === "REFUND" ? "−" : ""}{inrPaise(p.amountPaise)}</Td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7}><Empty>No payments yet.</Empty></td></tr>}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
