"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, BadgeCheck, Building2, CreditCard, Landmark, Lock, ShieldCheck, Tag, X } from "lucide-react";
import { TextField } from "@/components/form";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LogoMark } from "@/components/ui/Logo";
import { Photo } from "@/components/ui/Photo";
import { roomImageUrl } from "@/config/images";
import { routes } from "@/config/routes";
import { useCatalog } from "@/hooks/useCatalog";
import { useHydrated } from "@/hooks/useHydrated";
import { useQuote } from "@/hooks/useQuote";
import { useRoom } from "@/hooks/useRooms";
import { startCheckout } from "@/lib/cashfree-checkout";
import { cn } from "@/lib/cn";
import { fmtDate, inr, plural } from "@/lib/format";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/schemas";
import { ApiError, publicApi } from "@/services/api";
import { useStore } from "@/store/booking-store";

const METHODS = [
  { id: "online", label: "Pay online now", sub: "Cards · UPI · Net banking · Wallets", Icon: CreditCard },
  { id: "hotel", label: "Pay at hotel", sub: "Reserve now, pay on arrival", Icon: Landmark },
] as const;

const GUEST_FIELDS = ["name", "email", "mobile", "company", "gstin", "requests"];

export function CheckoutClient() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { search, draft, setDraft, resetDraft } = useStore();
  const { room, loading: roomLoading } = useRoom(draft.roomSlug ?? null);
  const { ratePlan, addons, promos } = useCatalog();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | undefined>();
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gst, setGst] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as unknown as Resolver<CheckoutFormValues>,
    mode: "onTouched",
    defaultValues: { name: "", email: "", mobile: "", company: "", gstin: "", requests: "", method: "online", terms: false as unknown as boolean },
  });
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitted } } = form;
  const method = watch("method");

  const { quote } = useQuote(
    room && search.checkIn && search.checkOut
      ? { roomSlug: room.slug, checkIn: search.checkIn, checkOut: search.checkOut, rooms: search.rooms, ratePlan: draft.ratePlan, addonIds: draft.addonIds, promo }
      : null,
  );

  if (!hydrated || roomLoading) return <div className="min-h-[70vh]" />;
  if (!room || !search.checkIn || !search.checkOut) {
    return (
      <div className="container-x grid min-h-[70vh] place-items-center text-center">
        <div className="max-w-md">
          <LogoMark className="mx-auto" size={64} />
          <h1 className="mt-5 text-4xl text-green">Your booking is empty</h1>
          <p className="mt-3 text-muted">Choose a room and your dates, and we&apos;ll bring you right back here to complete your reservation.</p>
          <ButtonLink href={routes.rooms} size="lg" className="mt-6">Browse rooms</ButtonLink>
        </div>
      </div>
    );
  }

  const plan = ratePlan(draft.ratePlan);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return setPromoMsg({ ok: false, text: "Enter a promo code first" });
    if (promos[code]) {
      setPromo(code);
      setPromoMsg({ ok: true, text: promos[code].label });
    } else {
      setPromo(undefined);
      setPromoMsg({ ok: false, text: "That code isn't valid or has expired" });
    }
  };

  const onSubmit = async (v: CheckoutFormValues) => {
    setProcessing(true);
    setServerError(null);
    try {
      const res = await publicApi.createBooking({
        roomSlug: room.slug, checkIn: search.checkIn, checkOut: search.checkOut, rooms: search.rooms,
        adults: search.adults, children: search.children, ratePlan: draft.ratePlan, addonIds: draft.addonIds, promo,
        guest: { name: v.name.trim(), email: v.email.trim(), mobile: v.mobile, company: v.company?.trim() ?? "", gstin: v.gstin?.trim().toUpperCase() ?? "", requests: v.requests?.trim() ?? "" },
        payMode: v.method,
      });
      try {
        sessionStorage.setItem(`kp:t:${res.booking.ref}`, res.accessToken);
      } catch {
        /* private mode */
      }
      resetDraft();
      if (v.method === "online" && res.payment) await startCheckout(res.payment);
      else router.push(routes.confirmation(res.booking.ref, res.accessToken));
    } catch (e) {
      setProcessing(false);
      if (e instanceof ApiError) {
        for (const [k, msg] of Object.entries(e.fields ?? {})) {
          const key = k.replace(/^guest\./, "");
          if (GUEST_FIELDS.includes(key)) setError(key as keyof CheckoutFormValues, { message: msg });
        }
        setServerError(e.code === "SOLD_OUT" ? "Sorry, that room just sold out for your dates. Please choose different dates or another room." : e.message);
      } else setServerError((e as Error).message);
    }
  };

  const payLabel = method === "hotel" ? "Confirm Reservation" : `Pay ${quote ? inr(quote.total) : ""} Securely`;
  const errCount = Object.keys(errors).length;

  return (
    <div className="bg-ivory">
      <div className="border-b border-line bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href={routes.home} className="flex items-center gap-2.5" aria-label="Hotel KP home"><LogoMark size={36} /><span className="font-display text-xl font-bold text-green">HOTEL KP</span></Link>
          <p className="eyebrow flex items-center gap-2 text-muted"><Lock className="size-3.5" aria-hidden /> Secure checkout</p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-8 pb-32 lg:grid-cols-[1fr_24rem] lg:gap-10 lg:py-12 lg:pb-12">
        <FormProvider {...form}>
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            <h1 className="sr-only">Checkout</h1>

            {isSubmitted && errCount > 0 && <ErrorBanner title={`Please fix ${plural(errCount, "field")} to continue.`}>We&apos;ve highlighted them below.</ErrorBanner>}
            {serverError && <ErrorBanner title="We couldn't complete your booking.">{serverError}</ErrorBanner>}

            <section aria-labelledby="guest-h" className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-8">
              <h2 id="guest-h" className="text-3xl text-green">Contact &amp; Guest Details</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <TextField name="name" label="Full name" required autoComplete="name" placeholder="As on your ID" />
                <TextField name="mobile" label="Mobile number" required type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" hint="We'll SMS your confirmation here" />
                <TextField name="email" label="Email address" required type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" hint="Your GST invoice is emailed here" />
                <TextField name="requests" label="Special requests" optional placeholder="Early check-in, extra pillows…" />
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-green">
                  <input type="checkbox" className="size-5 accent-green" checked={gst} onChange={(e) => setGst(e.target.checked)} />
                  <Building2 className="size-4" aria-hidden /> I need a GST invoice for my company
                </label>
                {gst && (
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <TextField name="company" label="Company name" required autoComplete="organization" />
                    <TextField name="gstin" label="GSTIN" required autoCapitalize="characters" maxLength={15} placeholder="09AABCR1234F1ZQ" hint="15 characters, e.g. 09AABCR1234F1ZQ" />
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="addon-h" className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-8">
              <h2 id="addon-h" className="text-3xl text-green">Enhance your stay</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {addons.map((a) => {
                  const on = draft.addonIds.includes(a.id);
                  return (
                    <li key={a.id}>
                      <label className={cn("flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-3.5 transition-colors", on ? "border-brass bg-sand" : "border-line hover:border-green/40")}>
                        <input type="checkbox" className="peer sr-only" checked={on} onChange={() => setDraft({ addonIds: on ? draft.addonIds.filter((x) => x !== a.id) : [...draft.addonIds, a.id] })} />
                        <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-brass", on ? "border-green bg-green text-white" : "border-line bg-white")} aria-hidden>
                          {on && <BadgeCheck className="size-3.5" />}
                        </span>
                        <span className="flex-1 text-sm"><b className="block text-ink">{a.name}</b><span className="text-muted">{a.note}</span></span>
                        <span className="price text-sm text-green">{a.price ? inr(a.price) : "Free"}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="pay-h" className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-line sm:p-8">
              <h2 id="pay-h" className="text-3xl text-green">Payment</h2>
              <fieldset className="mt-5">
                <legend className="sr-only">Choose how to pay</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {METHODS.map(({ id, label, sub, Icon }) => (
                    <label key={id} className={cn("flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 transition-colors", method === id ? "border-brass bg-sand" : "border-line hover:border-green/40")}>
                      <input type="radio" value={id} className="peer sr-only" {...register("method")} />
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-brass", method === id ? "border-green" : "border-line")} aria-hidden>
                        {method === id && <span className="size-2.5 rounded-full bg-green" />}
                      </span>
                      <Icon className="size-5 shrink-0 text-green" aria-hidden />
                      <span><b className="block text-ink">{label}</b><span className="text-xs text-muted">{sub}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 rounded-xl bg-sand-soft p-4 text-sm text-ink/80" aria-live="polite">
                {method === "online" ? (
                  <p className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-action" aria-hidden /><span>You&apos;ll complete payment on <b>Cashfree&apos;s secure page</b> using card, UPI, net banking or wallet. We never see or store your card or UPI details. Your room is held for 20 minutes.</span></p>
                ) : (
                  <p>Reserve now and pay the full amount at the front desk on arrival. Your booking is held with free cancellation up to 48 hours before check-in.</p>
                )}
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/85">
                  <input type="checkbox" className="peer sr-only" {...register("terms")} />
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] border-line bg-white transition-colors peer-checked:border-green peer-checked:bg-green peer-focus-visible:ring-2 peer-focus-visible:ring-brass" aria-hidden>
                    <svg viewBox="0 0 16 16" className="size-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 8.5 3 3 7-7" /></svg>
                  </span>
                  <span>I agree to the <Link href={routes.terms} className="font-semibold text-green underline">booking terms</Link> and <Link href={routes.privacy} className="font-semibold text-green underline">privacy policy</Link>.</span>
                </label>
                {errors.terms && <p role="alert" className="mt-2 text-[0.8rem] font-medium text-danger">{errors.terms.message}</p>}
              </div>
            </section>
          </form>
        </FormProvider>

        <aside aria-label="Booking summary">
          <div className="space-y-5 rounded-3xl bg-white p-5 shadow-lift ring-1 ring-line lg:sticky lg:top-8">
            <div className="flex gap-4">
              <Photo src={roomImageUrl(room.images[0])} alt="" sizes="112px" className="size-24 shrink-0 rounded-2xl" />
              <div>
                <p className="font-display text-2xl font-bold leading-tight text-green">{room.name}</p>
                <p className="mt-1 text-sm text-muted">{fmtDate(search.checkIn, "d MMM")} – {fmtDate(search.checkOut, "d MMM yyyy")}</p>
                <p className="text-sm text-muted">{quote ? `${plural(quote.nights, "night")} · ` : ""}{plural(search.adults + search.children, "guest")} · {plural(search.rooms, "room")}</p>
                <Link href={routes.room(room.slug)} className="mt-1 inline-block text-xs font-semibold text-brass-deep underline">Change</Link>
              </div>
            </div>
            {plan && <p className="rounded-lg bg-sand-soft px-3 py-2 text-xs text-muted"><b className="text-green">{plan.name}</b> · {plan.note}</p>}

            <div>
              <label htmlFor="promo" className="eyebrow mb-2 flex items-center gap-1.5 text-muted"><Tag className="size-3.5" aria-hidden /> Promo code</label>
              <div className="flex gap-2">
                <Input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="WEEKEND20" className="min-h-11 flex-1 uppercase" />
                {promo ? (
                  <Button type="button" variant="secondary" size="md" onClick={() => { setPromo(undefined); setPromoMsg(null); setPromoInput(""); }} aria-label="Remove promo"><X className="size-4" aria-hidden /></Button>
                ) : (
                  <Button type="button" variant="secondary" size="md" onClick={applyPromo}>Apply</Button>
                )}
              </div>
              {promoMsg && <p role="status" className={cn("mt-1.5 text-xs font-medium", promoMsg.ok ? "text-action" : "text-danger")}>{promoMsg.text}</p>}
            </div>

            <dl className="space-y-2 border-t border-line pt-4 text-sm">
              {quote ? (
                <>
                  {quote.lines.map((l) => (
                    <div key={l.label} className="flex justify-between gap-3">
                      <dt className="text-muted">{l.label}</dt>
                      <dd className={cn("price whitespace-nowrap text-sm font-semibold", l.amount < 0 && "text-action")}>{l.amount < 0 ? "−" : ""}{inr(Math.abs(l.amount))}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between border-t border-line pt-3 text-green"><dt className="text-lg font-bold">Total</dt><dd className="price text-2xl">{inr(quote.total)}</dd></div>
                </>
              ) : (
                <div className="h-24 animate-pulse rounded-xl bg-sand/70" role="status" aria-label="Calculating price" />
              )}
            </dl>

            <Button type="submit" form="checkout-form" size="lg" loading={processing} disabled={!quote} className="hidden w-full lg:inline-flex">
              {processing ? "Please wait…" : <><Lock className="size-4" aria-hidden /> {payLabel}</>}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs italic text-muted">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden /> {plan?.refundable ? "Free cancellation until 48h before check-in" : "Non-refundable rate"} · Prices include GST
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 pb-safe backdrop-blur lg:hidden">
        <Button type="submit" form="checkout-form" size="lg" loading={processing} disabled={!quote} className="w-full">
          {processing ? "Please wait…" : <><Lock className="size-4" aria-hidden /> {payLabel}</>}
        </Button>
      </div>
    </div>
  );
}

function ErrorBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div><b>{title}</b><p className="text-danger/80">{children}</p></div>
    </div>
  );
}
