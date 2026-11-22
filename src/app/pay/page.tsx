"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { ApiError, publicApi } from "@/services/api";
import { startCheckout } from "@/lib/cashfree-checkout";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { fmtDate, inrPaise } from "@/lib/format";

/** Guest-facing "pay my invoice" page, reached from the email / WhatsApp link. */
function PayInvoice() {
  const sp = useSearchParams();
  const id = sp.get("invoice") ?? "";
  const t = sp.get("t") ?? "";
  const [s, setS] = useState<Awaited<ReturnType<typeof publicApi.invoiceSummary>> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id || !t) return setError("This payment link is incomplete.");
    publicApi.invoiceSummary(id, t).then(setS).catch((e: ApiError) => setError(e.message));
  }, [id, t]);

  const pay = async () => {
    setBusy(true);
    try {
      const r = await publicApi.payInvoice(id, t);
      await startCheckout(r.payment);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] place-items-center bg-sand px-4 py-28">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-line">
        <LogoMark className="mx-auto" size={56} />
        {!s && !error && <p className="mt-6 text-muted" role="status">Loading invoice…</p>}
        {error && <p role="alert" className="mt-6 font-medium text-danger">{error}</p>}
        {s && (
          <>
            <p className="eyebrow mt-5 text-brass-deep">Invoice {s.number}</p>
            <h1 className="mt-1 text-3xl text-green">{s.party}</h1>
            {s.balancePaise > 0 ? (
              <>
                <p className="mt-6 text-sm text-muted">Amount due</p>
                <p className="price text-5xl text-green">{inrPaise(s.balancePaise)}</p>
                <p className="mt-1 text-xs text-muted">Invoice total {inrPaise(s.totalPaise)} · due {fmtDate(s.dueDate)}</p>
                <Button size="lg" className="mt-7 w-full" loading={busy} onClick={pay}><Lock className="size-4" aria-hidden /> Pay {inrPaise(s.balancePaise)} securely</Button>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck className="size-3.5" aria-hidden /> Cards · UPI · Net banking via Cashfree</p>
              </>
            ) : (
              <p className="mt-6 flex items-center justify-center gap-2 font-semibold text-action"><CheckCircle2 className="size-5" aria-hidden /> This invoice is fully paid. Thank you!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PayPage() {
  return <Suspense><PayInvoice /></Suspense>;
}
