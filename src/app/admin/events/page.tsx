"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/services/api";
import { fmtDate } from "@/lib/format";
import { btn, Card, Empty, ErrorNote, inputCls, Loading, PageTitle, StatusBadge } from "@/components/admin/primitives";
import { useLoad } from "@/hooks/useLoad";

export default function EventsAdminPage() {
  const { data, error, loading, reload } = useLoad(() => adminApi.enquiries());
  const set = async (id: string, status: string) => { await adminApi.setEnquiryStatus(id, status); await reload(); };

  return (
    <>
      <PageTitle title="Events & enquiries" sub="Banquet, conference, table and contact requests from the website." />
      <ErrorNote message={error} />
      {loading && !data ? <Loading /> : data?.enquiries.length === 0 ? <Card><Empty>No enquiries yet.</Empty></Card> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data?.enquiries.map((e) => (
            <li key={e.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4f6bff]">{e.kind} · {e.id}</p>
                    <h2 className="mt-1 font-sans text-lg font-bold">{e.name}</h2>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{e.summary}</p>
                <p className="mt-1 text-xs text-slate-500">{[e.mobile, e.email].filter(Boolean).join(" · ")}{e.date ? ` · ${fmtDate(e.date)}` : ""}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`st-${e.id}`}>Update status</label>
                  <select id={`st-${e.id}`} value={e.status} onChange={(ev) => set(e.id, ev.target.value)} className={`${inputCls} w-auto`}>
                    <option>New</option><option>Contacted</option><option>Closed</option>
                  </select>
                  {(e.kind === "Banquet" || e.kind === "Conference") && (
                    <Link href="/admin/invoices/new?type=B2B" className={btn.ghost}><Plus className="size-4" aria-hidden /> Invoice</Link>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
