"use client";

import Link from "next/link";
import { adminApi } from "@/services/api";
import { inrPaise } from "@/lib/format";
import { fmtDate } from "@/lib/format";
import { Card, ErrorNote, Loading, PageTitle, StatusBadge, Table, Td, Th } from "@/components/admin/primitives";
import { useSession } from "@/components/admin/AdminShell";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/cn";

export default function Dashboard() {
  const user = useSession();
  const canReports = ["owner", "manager", "accountant"].includes(user.role);
  const { data: d, error, loading } = useLoad(() => (canReports ? adminApi.dashboard() : Promise.resolve(null)), [canReports]);

  if (!canReports) {
    return (
      <>
        <PageTitle title="Front desk" sub="Create bookings and invoices, record payments." />
        <div className="grid gap-4 sm:grid-cols-3">
          {[["/admin/bookings/new", "New booking"], ["/admin/invoices/new", "New invoice"], ["/admin/invoices", "Record a payment"]].map(([h, l]) => (
            <Link key={h} href={h} className="rounded-2xl bg-white p-6 text-lg font-bold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:ring-[#4f6bff]">{l}</Link>
          ))}
        </div>
      </>
    );
  }

  const kpis = d && [
    { label: "Collected today", value: inrPaise(d.collectedTodayPaise), sub: `${inrPaise(d.collectedMonthPaise)} this month`, tone: "text-[#4f6bff]" },
    { label: "Outstanding", value: inrPaise(d.outstandingPaise), sub: d.overdueCount ? `${inrPaise(d.overduePaise)} overdue · ${d.overdueCount} invoices` : "Nothing overdue", tone: d.overdueCount ? "text-rose-600" : "text-emerald-600" },
    { label: "Occupancy today", value: `${d.occupancyPct}%`, sub: `${d.arrivalsToday} arrivals · ${d.departuresToday} departures`, tone: "text-emerald-600" },
    { label: "Open enquiries", value: String(d.openEnquiries), sub: d.pendingCheques ? `${inrPaise(d.pendingCheques)} cheques pending` : "No cheques pending", tone: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Dashboard</h1>
      <ErrorNote message={error} />
      {loading && !d ? <Loading rows={4} /> : null}
      {kpis && (
        <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((k) => (
            <li key={k.label} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500">{k.label}</p>
              <p className="price mt-1 text-3xl text-slate-900">{k.value}</p>
              <p className={cn("mt-1 text-xs font-bold", k.tone)}>{k.sub}</p>
            </li>
          ))}
        </ul>
      )}
      {d && (
        <>
          <Card title="Revenue by service"><RevenueChart data={d.revenue} /></Card>
          <Card title="Recent bookings" action={<Link href="/admin/bookings" className="text-sm font-semibold text-[#4f6bff]">View all</Link>}>
            <Table label="Recent bookings">
              <thead><tr><Th>Ref</Th><Th>Guest</Th><Th>Room</Th><Th>Dates</Th><Th>Status</Th><Th right>Total</Th></tr></thead>
              <tbody>
                {d.recentBookings.map((b) => (
                  <tr key={b.ref}>
                    <Td className="font-mono text-xs">{b.ref}</Td><Td className="font-medium">{b.guest.name}</Td><Td>{b.roomName}</Td>
                    <Td>{fmtDate(b.checkIn, "d MMM")}–{fmtDate(b.checkOut, "d MMM")}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="price text-right">{inrPaise(b.totalPaise)}</Td>
                  </tr>
                ))}
                {d.recentBookings.length === 0 && <tr><Td className="text-slate-500">No bookings yet.</Td></tr>}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
