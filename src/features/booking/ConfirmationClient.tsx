"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CalendarPlus, Check, CreditCard, Download, MapPin, Settings2, Printer, Mail, Loader2 } from "lucide-react";
import { publicApi } from "@/services/api";
import type { GuestInvoiceInfo } from "@/types/api";
import type { Booking } from "@/types/api";
import { downloadIcs } from "@/lib/ics";
import { SITE } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BookingCard } from "@/features/booking/BookingCard";
import { LogoMark } from "@/components/ui/Logo";

export function ConfirmationClient() {
  const sp = useSearchParams();
  const ref = sp.get("ref");
  const [token, setToken] = useState<string | null>(sp.get("t"));
  const [state, setState] = useState<{ booking: Booking; invoice: GuestInvoiceInfo | null } | "missing" | "loading">("loading");
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref) return setState("missing");
    let t = token;
    if (!t) { try { t = sessionStorage.getItem(`kp:t:${ref}`); setToken(t); } catch { /* ignore */ } }
    if (!t) return setState("missing");
    publicApi.getBooking(ref, { t }).then(setState).catch(() => setState("missing"));
  }, [ref, token]);

  if (state === "loading") return <div className="grid min-h-[70vh] place-items-center bg-sand"><Loader2 className="size-8 animate-spin text-green" aria-label="Loading booking" /></div>;
  if (state === "missing") {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div className="max-w-md">
          <LogoMark className="mx-auto" size={64} />
          <h1 className="mt-5 text-4xl text-green">We couldn&apos;t find that booking</h1>
          <p className="mt-3 text-muted">Open this page from your confirmation email, or look up your booking with its reference number and email.</p>
          <ButtonLink href="/manage-booking" size="lg" className="mt-6">Find my booking</ButtonLink>
        </div>
      </div>
    );
  }

  const { booking, invoice } = state;
  const pending = booking.payMode === "hotel" || (invoice?.balancePaise ?? 0) > 0;
  const awaiting = booking.status === "PENDING_PAYMENT";

  return (
    <div className="bg-sand px-4 pb-20 pt-28 text-center sm:pt-36">
      <motion.div
        initial={reduce ? false : { scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto grid size-20 place-items-center rounded-full bg-green text-white shadow-lift"
      >
        <Check className="size-10" strokeWidth={3} aria-hidden />
      </motion.div>
      <h1 className="mt-6 text-5xl text-ink sm:text-6xl">{awaiting ? "Payment pending" : pending ? "Booking Reserved" : "Booking Confirmed"}</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        Reference <b className="text-green">#{booking.ref}</b> · A confirmation {awaiting ? "will be" : "has been"} sent to <b className="break-all text-green">{booking.guest.email}</b>
      </p>

      <div className="mx-auto mt-10 max-w-3xl">
        <BookingCard b={booking} showStatus invoiceNumber={invoice?.number} balancePaise={invoice?.balancePaise} />
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3 print:hidden">
        {invoice && <ButtonLink variant="primary" href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" aria-hidden /> GST invoice (PDF)</ButtonLink>}
        {invoice?.payUrl && booking.status !== "CANCELLED" && <ButtonLink variant="gold" href={invoice.payUrl}><CreditCard className="size-4" aria-hidden /> Pay balance online</ButtonLink>}
        <Button variant="secondary" onClick={() => downloadIcs(booking)}><CalendarPlus className="size-4" aria-hidden /> Add to Calendar</Button>
        <ButtonLink variant="secondary" href={SITE.mapsHref} target="_blank" rel="noopener noreferrer"><MapPin className="size-4" aria-hidden /> Get Directions</ButtonLink>
        <ButtonLink variant="secondary" href={`/manage-booking?ref=${booking.ref}`}><Settings2 className="size-4" aria-hidden /> Manage Booking</ButtonLink>
        <Button variant="ghost" onClick={() => window.print()}><Printer className="size-4" aria-hidden /> Print</Button>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white/60 p-5 text-left text-sm text-ink/80 ring-1 ring-line">
        <p className="eyebrow mb-2 text-brass-deep">What happens next</p>
        <ul className="grid gap-2 sm:grid-cols-3">
          <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-green" aria-hidden /> Your GST invoice and confirmation are in your inbox</li>
          <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden /> Express check-in from {SITE.checkInTime}</li>
          <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-green" aria-hidden /> Our front desk will have everything ready</li>
        </ul>
        {booking.payMode === "hotel" && <p className="mt-3 rounded-lg bg-warn/10 p-3 text-warn">Your room is held. Please pay at the front desk on arrival, or pay online any time with the button above. Free cancellation until 48 hours before check-in.</p>}
      </div>
      <p className="mt-8 text-sm text-muted">Need help? <a className="font-semibold text-green underline" href={SITE.phoneHref}>{SITE.phone}</a> · <Link className="font-semibold text-green underline" href="/contact">Contact us</Link></p>
    </div>
  );
}
