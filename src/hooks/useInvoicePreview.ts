"use client";

import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/services/api";
import type { InvoicePreview } from "@/types/api";

interface PreviewItem {
  ruleCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  tariff?: number;
}

/**
 * GST breakdown for the new-invoice form, computed by the API (`POST /admin/invoices/preview`) so the staff see
 * exactly what will be issued. Debounced; returns `null` until at least one priced line exists.
 */
export function useInvoicePreview(items: PreviewItem[], discount: { type: "percent" | "flat"; value: number } | undefined, partyGstin?: string) {
  const [preview, setPreview] = useState<InvoicePreview | null>(null);
  const latest = useRef(0);

  const valid = items.filter((i) => i.ruleCode && Number(i.qty) > 0 && Number(i.unitPrice) > 0);
  const key = JSON.stringify({ valid, discount: discount?.value ? discount : undefined, partyGstin: partyGstin || undefined });

  useEffect(() => {
    const body = JSON.parse(key);
    if (!body.valid.length) return void setPreview(null);
    const id = ++latest.current;
    const t = setTimeout(() => {
      adminApi
        .previewInvoice({ items: body.valid, discount: body.discount, partyGstin: body.partyGstin })
        .then((r) => id === latest.current && setPreview(r))
        .catch(() => id === latest.current && setPreview(null));
    }, 300);
    return () => clearTimeout(t);
  }, [key]);

  return preview;
}
