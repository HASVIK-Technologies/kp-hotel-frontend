"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Download, SearchX } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";
import { lookupSchema, type LookupValues } from "@/lib/schemas";
import { ApiError, publicApi } from "@/services/api";
import type { GuestInvoiceInfo } from "@/types/api";
import type { Booking } from "@/types/api";
import { useCatalog } from "@/hooks/useCatalog";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { BookingCard } from "@/features/booking/BookingCard";

export function ManageBookingClient() {
  const sp = useSearchParams();
  const { ratePlans } = useCatalog();
  const [found, setFound] = useState<{ booking: Booking; invoice: GuestInvoiceInfo | null; email: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { ref: sp.get("ref") ?? "", email: "" },
  });

  const onSubmit = async (v: LookupValues) => {
    setConfirming(false); setMessage(null); setNotFound(false); setFound(null);
    try {
      const r = await publicApi.getBooking(v.ref, { email: v.email });
      setFound({ ...r, email: v.email });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setMessage((e as Error).message);
    }
  };

  const b = found?.booking;
  const plan = ratePlans.find((p) => p.id === b?.ratePlan);
  const hoursLeft = b ? differenceInHours(parseISO(b.checkIn), new Date()) : 0;
  const canCancel = !!b && ["CONFIRMED", "PENDING_PAYMENT"].includes(b.status) && hoursLeft > 0;
  const refundable = !!plan?.refundable && hoursLeft >= 48;

  const cancel = async () => {
    if (!found || !b) return;
    setBusy(true);
    try {
      const r = await publicApi.cancelBooking(b.ref, { email: found.email });
      setFound({ ...found, booking: r.booking });
      setMessage(r.message);
      setConfirming(false);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
        <h2 className="text-3xl text-green">Find your booking</h2>
        <p className="mt-1 text-sm text-muted">Enter the reference from your confirmation email and the email you booked with.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Booking reference" required error={errors.ref?.message}>
            {(a) => <Input {...a} placeholder="KPH-20874" autoCapitalize="characters" {...register("ref")} />}
          </Field>
          <Field label="Email address" required error={errors.email?.message}>
            {(a) => <Input {...a} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />}
          </Field>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" loading={isSubmitting}>Find booking</Button>
      </form>

      <div aria-live="polite" className="mt-8">
        {notFound && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
            <SearchX className="mx-auto size-10 text-brass" aria-hidden />
            <h3 className="mt-3 text-2xl text-green">No booking found</h3>
            <p className="mt-1 text-sm text-muted">Please check the reference and email, or call us on the number in your confirmation.</p>
          </div>
        )}
        {message && <p role="status" className="mb-4 rounded-xl bg-sand p-4 text-sm font-medium text-green">{message}</p>}
        {found && b && (
          <div className="space-y-5">
            <BookingCard b={b} showStatus invoiceNumber={found.invoice?.number} balancePaise={found.invoice?.balancePaise} />
            <div className="flex flex-wrap gap-3">
              {found.invoice && <ButtonLink href={found.invoice.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" aria-hidden /> Download GST invoice</ButtonLink>}
              {found.invoice?.payUrl && b.status !== "CANCELLED" && <ButtonLink variant="gold" href={found.invoice.payUrl}>Pay balance online</ButtonLink>}
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-line">
              <h3 className="text-2xl text-green">Guest</h3>
              <p className="mt-1 text-sm text-muted">{b.guest.name} · {b.guest.email} · +91 {b.guest.mobile}</p>
              {b.guest.requests && <p className="mt-2 text-sm text-ink/80">“{b.guest.requests}”</p>}
            </div>
            {canCancel && !confirming && <Button variant="danger" onClick={() => setConfirming(true)}>Cancel this booking</Button>}
            {canCancel && confirming && (
              <div role="alertdialog" aria-label="Confirm cancellation" className="rounded-2xl border border-danger/30 bg-danger/5 p-5">
                <p className="flex items-center gap-2 font-bold text-danger"><AlertTriangle className="size-5" aria-hidden /> Cancel booking {b.ref}?</p>
                <p className="mt-2 text-sm text-ink/80">
                  {refundable ? "You're within the free-cancellation window. Any online payment is refunded to your original payment method in 5–7 working days." : "This rate is non-refundable or inside 48 hours of check-in, so no refund will be issued."}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="danger" loading={busy} onClick={cancel}>Yes, cancel booking</Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>Keep booking</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
