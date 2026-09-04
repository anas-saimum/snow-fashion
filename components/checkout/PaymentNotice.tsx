import { Info } from "lucide-react";
import { getPaymentProvider } from "@/lib/payments";

/**
 * States plainly that no payment is being taken. Do not soften or remove this
 * while `getPaymentProvider().isLive` is false — the checkout would then imply
 * a payment it never collects.
 */
export function PaymentNotice() {
  const provider = getPaymentProvider();

  if (provider.isLive) {
    return null;
  }

  return (
    <div className="flex gap-3 border border-stone-dark bg-canvas p-5">
      <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <div>
        <h3 className="text-caption font-medium uppercase tracking-[0.1em] text-ink">
          No payment will be taken
        </h3>
        <p className="mt-2 text-caption leading-relaxed text-ink-soft">
          This store does not have a payment provider connected yet. Placing an
          order records your details and your basket as an{" "}
          <strong className="font-medium">unpaid order request</strong> — no
          card is charged and no payment method is collected.
        </p>
        <p className="mt-2 text-micro leading-relaxed text-muted">
          Orders are stored in this browser only. Connect a provider in
          lib/payments before accepting real orders.
        </p>
      </div>
    </div>
  );
}
