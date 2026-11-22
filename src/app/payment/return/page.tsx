"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { publicApi } from "@/services/api";
import { ButtonLink } from "@/components/ui/Button";

function Return() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get("order_id");
  const [state, setState] = useState<"checking" | "paid" | "failed" | "pending" | "unknown">("checking");
  const [info, setInfo] = useState<{ invoiceNumber?: string; bookingRef?: string }>({});

  useEffect(() => {
    if (!orderId) return setState("unknown");
    let cancelled = false;
    (async () => {
      // The gateway can take a few seconds to settle; poll the server (which re-verifies with Cashfree).
      for (let i = 0; i < 8 && !cancelled; i++) {
        try {
          const r = await publicApi.verifyPayment(orderId);
          if (r.status === "PAID") {
            setInfo({ invoiceNumber: r.invoiceNumber, bookingRef: r.bookingRef });
            if (r.bookingRef && r.accessToken) {
              try { sessionStorage.setItem(`kp:t:${r.bookingRef}`, r.accessToken); } catch { /* ignore */ }
              router.replace(`/confirmation?ref=${r.bookingRef}&t=${encodeURIComponent(r.accessToken)}`);
              return;
            }
            return setState("paid");
          }
          if (r.status === "FAILED") return setState("failed");
          if (r.status === "NOT_FOUND") return setState("unknown");
        } catch { /* retry */ }
        await new Promise((res) => setTimeout(res, 2000));
      }
      if (!cancelled) setState("pending");
    })();
    return () => { cancelled = true; };
  }, [orderId, router]);

  const card = "mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-line";
  return (
    <div className="grid min-h-[70vh] place-items-center bg-sand px-4 pt-24">
      {state === "checking" && (
        <div className={card} role="status">
          <Loader2 className="mx-auto size-10 animate-spin text-green" aria-hidden />
          <h1 className="mt-4 text-3xl text-green">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted">Please don&apos;t close this page. This only takes a moment.</p>
        </div>
      )}
      {state === "paid" && (
        <div className={card} role="status">
          <CheckCircle2 className="mx-auto size-12 text-action" aria-hidden />
          <h1 className="mt-4 text-3xl text-green">Payment received</h1>
          <p className="mt-2 text-sm text-muted">Thank you. {info.invoiceNumber ? `Your payment has been recorded against invoice ${info.invoiceNumber}.` : "A receipt has been emailed to you."}</p>
          <ButtonLink href="/" className="mt-6">Back to home</ButtonLink>
        </div>
      )}
      {state === "failed" && (
        <div className={card} role="alert">
          <XCircle className="mx-auto size-12 text-danger" aria-hidden />
          <h1 className="mt-4 text-3xl text-green">Payment didn&apos;t go through</h1>
          <p className="mt-2 text-sm text-muted">No money was taken. You can try again, or choose Pay at Hotel. Your room is held for a few more minutes.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/manage-booking">Find my booking</ButtonLink>
            <ButtonLink href="/rooms" variant="secondary">Browse rooms</ButtonLink>
          </div>
        </div>
      )}
      {(state === "pending" || state === "unknown") && (
        <div className={card} role="status">
          <h1 className="text-3xl text-green">{state === "pending" ? "Still processing" : "We couldn't find that payment"}</h1>
          <p className="mt-2 text-sm text-muted">
            {state === "pending"
              ? "Your bank is taking longer than usual. If money was debited you'll get a confirmation email shortly, you don't need to pay again."
              : "Please check the link in your email or contact the front desk."}
          </p>
          <ButtonLink href="/manage-booking" className="mt-6">Check my booking</ButtonLink>
        </div>
      )}
    </div>
  );
}

export default function PaymentReturnPage() {
  return <Suspense><Return /></Suspense>;
}
