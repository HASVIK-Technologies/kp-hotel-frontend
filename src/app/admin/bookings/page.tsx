"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { btn, Card, Empty, ErrorNote, inputCls, Loading, PageTitle, StatusBadge, Table, Td, Th } from "@/components/admin/primitives";
import { useLoad } from "@/hooks/useLoad";
import { Notice } from "@/components/admin/ui";

export default function BookingsPage() {
  const { data, error, loading, reload } = useLoad(() => adminApi.bookings());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const rows = useMemo(
    () => (data?.bookings ?? []).filter((b) => (status === "all" || b.status === status) && `${b.guest.name} ${b.ref} ${b.roomName} ${b.guest.email}`.toLowerCase().includes(q.toLowerCase())),
    [data, q, status],
  );

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setErr(null);
    try { await fn(); setNote(ok); await reload(); } catch (e) { setErr((e as Error).message); }
  };

  return (
    <>
      <PageTitle title="Bookings" sub={`${data?.bookings.length ?? 0} reservations`} action={<Link href="/admin/bookings/new" className={btn.primary}><Plus className="size-4" aria-hidden /> New booking</Link>} />
      <ErrorNote message={err ?? error} />
      {note && <div className="mb-4"><Notice tone="success">{note}</Notice></div>}
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <label htmlFor="bq" className="sr-only">Filter bookings</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="bq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Guest, reference, room or email" className={`${inputCls} pl-9`} />
          </div>
          <label className="sr-only" htmlFor="bs">Status</label>
          <select id="bs" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="all">All statuses</option>
            {["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "EXPIRED", "NO_SHOW"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
          </select>
        </div>
        {loading && !data ? <Loading /> : (
          <Table label="Bookings">
            <thead><tr><Th>Ref</Th><Th>Guest</Th><Th>Room</Th><Th>Dates</Th><Th>Source</Th><Th>Status</Th><Th right>Total</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.ref}>
                  <Td className="font-mono text-xs">{b.ref}</Td>
                  <Td><span className="font-medium">{b.guest.name}</span><span className="block text-xs text-slate-500">{b.guest.email}</span></Td>
                  <Td>{b.roomName}{b.rooms > 1 ? ` ×${b.rooms}` : ""}</Td>
                  <Td>{fmtDate(b.checkIn, "d MMM")}–{fmtDate(b.checkOut, "d MMM yy")}</Td>
                  <Td>{b.source}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td className="price text-right">{inrPaise(b.totalPaise)}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {b.invoiceId && <Link href={`/admin/invoice?id=${b.invoiceId}`} className={btn.ghost}>Invoice</Link>}
                      {b.status === "CONFIRMED" && <button className={btn.ghost} onClick={() => act(() => adminApi.setBookingStatus(b.ref, "CHECKED_IN"), `${b.ref} checked in.`)}>Check in</button>}
                      {b.status === "CHECKED_IN" && <button className={btn.ghost} onClick={() => act(() => adminApi.setBookingStatus(b.ref, "CHECKED_OUT"), `${b.ref} checked out.`)}>Check out</button>}
                      {["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && (
                        <button className={btn.danger} onClick={() => confirm(`Cancel booking ${b.ref}? Refund rules and a credit note will be applied automatically.`) && act(() => adminApi.cancelBooking(b.ref), `${b.ref} cancelled.`)}>Cancel</button>
                      )}
                    </span>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8}><Empty>No bookings match your filters.</Empty></td></tr>}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
