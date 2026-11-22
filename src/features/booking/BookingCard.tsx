"use client";

import { CalendarDays, Moon, Users, FileText } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { roomImageUrl } from "@/config/images";
import { useCatalog } from "@/hooks/useCatalog";
import { cn } from "@/lib/cn";
import { fmtDate, inr, plural } from "@/lib/format";
import type { Booking } from "@/types/api";

const STATUS: Record<string, string> = {
  CONFIRMED: "bg-action/12 text-action-dark",
  CHECKED_IN: "bg-action/12 text-action-dark",
  CHECKED_OUT: "bg-sand text-muted",
  PENDING_PAYMENT: "bg-warn/15 text-warn",
  EXPIRED: "bg-sand text-muted",
  NO_SHOW: "bg-danger/10 text-danger",
  CANCELLED: "bg-danger/10 text-danger",
};
const LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed", CHECKED_IN: "Checked in", CHECKED_OUT: "Checked out", PENDING_PAYMENT: "Awaiting payment",
  EXPIRED: "Expired", NO_SHOW: "No-show", CANCELLED: "Cancelled",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", STATUS[status] ?? "bg-sand text-muted")}>{LABEL[status] ?? status}</span>;
}

export function BookingCard({ b, showStatus, invoiceNumber, balancePaise }: { b: Booking; showStatus?: boolean; invoiceNumber?: string; balancePaise?: number }) {
  const { ratePlans, addons: allAddons } = useCatalog();
  const plan = ratePlans.find((p) => p.id === b.ratePlan);
  const addons = allAddons.filter((a) => b.addonIds.includes(a.id));
  const due = balancePaise ?? (b.payMode === "hotel" ? b.totalPaise : 0);
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white text-left shadow-lift ring-1 ring-line sm:flex-row">
      <Photo src={roomImageUrl(b.image)} alt="" sizes="(min-width:640px) 240px, 100vw" className="aspect-[16/9] sm:aspect-auto sm:w-60 sm:shrink-0" />
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-3xl text-green">{b.roomName}</h3>
          {showStatus && <StatusPill status={b.status} />}
        </div>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li className="flex items-center gap-2"><CalendarDays className="size-4 text-brass-deep" aria-hidden /> {fmtDate(b.checkIn)} – {fmtDate(b.checkOut)}</li>
          <li className="flex items-center gap-2"><Moon className="size-4 text-brass-deep" aria-hidden /> {plural(b.nights, "night")} · {plural(b.rooms, "room")}</li>
          <li className="flex items-center gap-2"><Users className="size-4 text-brass-deep" aria-hidden /> {plural(b.adults, "adult")}{b.children ? `, ${plural(b.children, "child", "children")}` : ""}</li>
          {invoiceNumber && <li className="flex items-center gap-2"><FileText className="size-4 text-brass-deep" aria-hidden /> Invoice {invoiceNumber}</li>}
        </ul>
        <p className="mt-3 text-sm text-muted">{plan?.name}{plan && ` · ${plan.refundable ? "Free cancellation" : "Non-refundable"}`}{addons.length ? ` · ${addons.map((a) => a.name).join(", ")}` : ""}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xs text-muted">Booking total (incl. GST)</p>
            <p className={cn("price text-3xl text-green", b.status === "CANCELLED" && "line-through opacity-50")}>{inr(b.totalPaise / 100)}</p>
          </div>
          {b.status !== "CANCELLED" && due > 0 && (
            <p className="rounded-full bg-warn/15 px-3 py-1.5 text-xs font-bold text-warn">Balance due {inr(due / 100)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
