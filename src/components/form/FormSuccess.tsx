import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** "Thanks, we got it" panel shown in place of a form after a successful submit. */
export function FormSuccess({ title, children, onReset, resetLabel = "Send another" }: { title: string; children: ReactNode; onReset: () => void; resetLabel?: string }) {
  return (
    <div role="status" className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-line">
      <CheckCircle2 className="mx-auto size-12 text-action" aria-hidden />
      <h3 className="mt-3 text-3xl text-green">{title}</h3>
      <div className="mt-2 text-sm text-muted">{children}</div>
      <Button variant="secondary" className="mt-5" onClick={onReset}>{resetLabel}</Button>
    </div>
  );
}
