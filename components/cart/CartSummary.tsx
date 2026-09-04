import { shippingConfig } from "@/config/shipping.config";
import { formatMoney, formatMoneyCompact } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { CartTotals } from "@/types";

interface CartSummaryProps {
  totals: CartTotals;
  /** Hides the free-shipping nudge on the checkout page. */
  showProgress?: boolean;
  className?: string;
}

/**
 * The single source of truth for how totals are presented. Shared by the cart
 * drawer, the cart page and the checkout order summary, so the three can
 * never show different arithmetic.
 */
export function CartSummary({
  totals,
  showProgress = true,
  className,
}: CartSummaryProps) {
  const qualifies = totals.shipping === 0 && totals.subtotal > 0;
  const progress = Math.min(
    100,
    (totals.subtotal / shippingConfig.freeShippingThreshold) * 100,
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showProgress && totals.subtotal > 0 && (
        <div>
          <p className="text-micro text-muted">
            {qualifies
              ? "Shipping is on us."
              : "Add " +
                formatMoneyCompact(totals.freeShippingRemaining) +
                " more for complimentary shipping."}
          </p>
          <div
            className="mt-2 h-px w-full bg-stone"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress towards free shipping"
          >
            <div
              className="h-px bg-ink transition-[width] duration-500"
              style={{ width: progress + "%" }}
            />
          </div>
        </div>
      )}

      <dl className="flex flex-col gap-2.5 text-caption">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums text-ink">{formatMoney(totals.subtotal)}</dd>
        </div>

        {totals.discount > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">You save</dt>
            <dd className="tabular-nums text-sale">
              {"−" + formatMoney(totals.discount)}
            </dd>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">
            Estimated shipping
            <span className="mt-0.5 block text-micro text-stone-dark">
              {shippingConfig.estimatedDays}
            </span>
          </dt>
          <dd className="tabular-nums text-ink">
            {totals.shipping === 0 ? "Free" : formatMoney(totals.shipping)}
          </dd>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-stone pt-4">
          <dt className="text-caption font-medium uppercase tracking-[0.1em] text-ink">
            Total
          </dt>
          <dd className="text-lead font-medium tabular-nums text-ink">
            {formatMoney(totals.total)}
          </dd>
        </div>
      </dl>

      <p className="text-micro leading-relaxed text-muted">
        Taxes and duties, where applicable, are calculated at the point of
        dispatch and are not included in this total.
      </p>
    </div>
  );
}
