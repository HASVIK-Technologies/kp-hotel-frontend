"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { adminApi } from "@/services/api";
import type { TaxRule } from "@/types/api";
import { btn, Card, ErrorNote, inputCls, Loading, PageTitle, Toggle } from "@/components/admin/primitives";
import { useSession } from "@/components/admin/AdminShell";
import { useLoad } from "@/hooks/useLoad";
import { Notice } from "@/components/admin/ui";

export default function TaxRulesPage() {
  const user = useSession();
  const canEdit = ["owner", "accountant"].includes(user.role);
  const { data, error, loading } = useLoad(() => adminApi.taxRules());
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (data) setRules(data.rules); }, [data]);

  const patch = (code: string, p: Partial<TaxRule>) => { setSaved(false); setRules((rs) => rs.map((r) => (r.code === code ? { ...r, ...p } : r))); };

  const save = async () => {
    setErr(null);
    try { await adminApi.saveTaxRules(rules); setSaved(true); } catch (e) { setErr((e as Error).message); }
  };

  const unverified = rules.filter((r) => !r.verified).length;

  return (
    <>
      <PageTitle title="Tax rules (GST)" sub="SAC codes and rates applied to every invoice. Each issued invoice stores a snapshot of the rule it used."
        action={canEdit && <button className={btn.primary} onClick={save}>Save changes</button>} />
      <ErrorNote message={err ?? error} />
      {saved && <div className="mb-4"><Notice tone="success">Tax rules saved. New invoices will use them immediately; existing invoices are unchanged.</Notice></div>}
      {unverified > 0 && (
        <div className="mb-4"><Notice tone="warn"><b>{unverified} rule{unverified > 1 ? "s are" : " is"} awaiting verification.</b> Defaults follow public guidance (Notification 15/2025-CTR) but banquet/catering and restaurant treatment depends on your premises classification, confirm with your CA, then mark each rule verified.</Notice></div>
      )}
      {loading && !data ? <Loading /> : (
        <ul className="space-y-4">
          {rules.map((r) => (
            <li key={r.code}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#4f6bff]">{r.code}</p>
                    <h2 className="font-sans text-lg font-bold text-slate-900">{r.description}</h2>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    {r.verified ? <ShieldCheck className="size-5 text-emerald-600" aria-hidden /> : <ShieldAlert className="size-5 text-amber-500" aria-hidden />}
                    {r.verified ? "Verified by CA" : "Unverified"}
                    <Toggle on={r.verified} disabled={!canEdit} onChange={() => patch(r.code, { verified: !r.verified })} label={`${r.code} verified`} />
                  </label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <div>
                    <label htmlFor={`sac-${r.code}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">SAC / HSN</label>
                    <input id={`sac-${r.code}`} className={`${inputCls} font-mono`} disabled={!canEdit} value={r.sac} onChange={(e) => patch(r.code, { sac: e.target.value.replace(/\D/g, "").slice(0, 8) })} />
                  </div>
                  {r.slabs ? (
                    r.slabs.map((s, i) => (
                      <div key={i}>
                        <label htmlFor={`slab-${r.code}-${i}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          {s.upToPaise === null ? "Above" : `Up to ₹${(s.upToPaise / 100).toLocaleString("en-IN")}`} (%)
                        </label>
                        <input id={`slab-${r.code}-${i}`} type="number" min={0} max={40} step={0.5} className={inputCls} disabled={!canEdit} value={s.rate}
                          onChange={(e) => patch(r.code, { slabs: r.slabs!.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) } : x)) })} />
                      </div>
                    ))
                  ) : (
                    <div>
                      <label htmlFor={`rate-${r.code}`} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">GST rate (%)</label>
                      <input id={`rate-${r.code}`} type="number" min={0} max={40} step={0.5} className={inputCls} disabled={!canEdit} value={r.rate ?? 0} onChange={(e) => patch(r.code, { rate: Number(e.target.value) })} />
                    </div>
                  )}
                  <div className="flex items-end text-xs text-slate-500">ITC {r.itcAllowed ? "allowed" : "not allowed"} · {r.supplyAtProperty ? "supplied at property (CGST+SGST)" : "place of supply by customer state"}</div>
                </div>
                {r.note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{r.note}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
