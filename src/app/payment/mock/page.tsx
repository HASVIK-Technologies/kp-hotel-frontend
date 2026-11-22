"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { publicApi } from "@/services/api";
import { Button } from "@/components/ui/Button";

const METHODS = [
  { id: "upi", label: "UPI", Icon: Smartphone },
  { id: "card", label: "Card", Icon: CreditCard },
  { id: "net_banking", label: "Net banking", Icon: Landmark },
] as const;

function Mock() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get("order_id") ?? "";
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("upi");
  const [busy, setBusy] = useState<"SUCCESS" | "FAILED" | null>(null);
  const [error, setError] = useState("");

  const finish = async (outcome: "SUCCESS" | "FAILED") => {
    setBusy(outcome);
    try {
      await publicApi.mockCompletePayment(orderId, outcome, method);
      router.replace(`/payment/return?order_id=${encodeURIComponent(orderId)}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-sand-soft px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lift ring-1 ring-line">
        <p className="eyebrow text-brass-deep">Local simulator · not a real payment</p>
        <h1 className="mt-2 text-3xl text-green">Cashfree checkout (mock)</h1>
        <p className="mt-1 break-all text-xs text-muted">Order {orderId}</p>
        <div role="radiogroup" aria-label="Payment method" className="mt-6 grid grid-cols-3 gap-2">
          {METHODS.map(({ id, label, Icon }) => (
            <button key={id} role="radio" aria-checked={method === id} onClick={() => setMethod(id)}
              className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] text-sm font-semibold ${method === id ? "border-brass bg-sand text-green" : "border-line text-muted"}`}>
              <Icon className="size-5" aria-hidden /> {label}
            </button>
          ))}
        </div>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-danger">{error}</p>}
        <div className="mt-6 grid gap-3">
          <Button size="lg" loading={busy === "SUCCESS"} disabled={!!busy} onClick={() => finish("SUCCESS")}>Simulate successful payment</Button>
          <Button size="lg" variant="danger" loading={busy === "FAILED"} disabled={!!busy} onClick={() => finish("FAILED")}>Simulate failed payment</Button>
        </div>
        <p className="mt-5 text-xs text-muted">In sandbox/production this page is replaced by Cashfree&apos;s hosted checkout.</p>
      </div>
    </div>
  );
}

export default function MockPayPage() {
  return <Suspense><Mock /></Suspense>;
}
