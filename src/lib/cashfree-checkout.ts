"use client";

import type { GatewaySession } from "@/types/api";

declare global {
  interface Window {
    Cashfree?: (o: { mode: "sandbox" | "production" }) => { checkout: (o: { paymentSessionId: string; redirectTarget?: string }) => Promise<unknown> };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment page. Please check your connection."));
    document.head.appendChild(s);
  });
}

/**
 * Hands the customer to Cashfree's hosted checkout (cards, UPI, net banking, wallets).
 * Sensitive payment data is entered on Cashfree's page, never on ours.
 * In `mock` mode (local dev) we route to a built-in simulator instead.
 */
export async function startCheckout(s: GatewaySession) {
  if (s.mode === "mock") {
    window.location.href = `/payment/mock?order_id=${encodeURIComponent(s.orderId)}`;
    return;
  }
  await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
  if (!window.Cashfree) throw new Error("Payment SDK unavailable");
  const cf = window.Cashfree({ mode: s.mode });
  await cf.checkout({ paymentSessionId: s.paymentSessionId, redirectTarget: "_self" });
}
