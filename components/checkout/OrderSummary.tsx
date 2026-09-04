import Image from "next/image";
import { CartSummary } from "@/components/cart/CartSummary";
import { formatMoney } from "@/lib/pricing";
import type { CartItem, CartTotals } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  totals: CartTotals;
  heading?: string;
}

/** Read-only recap of the order. Reuses CartSummary for the arithmetic. */
export function OrderSummary({
  items,
  totals,
  heading = "Order summary",
}: OrderSummaryProps) {
  return (
    <section aria-labelledby="order-summary-heading" className="bg-canvas p-6 lg:p-8">
      <h2 id="order-summary-heading" className="u-eyebrow text-ink">
        {heading}
      </h2>

      <ul className="mt-6 flex flex-col divide-y divide-stone-dark/60 border-y border-stone-dark/60">
        {items.map((item) => {
          const meta = [item.colorName, item.sizeLabel].filter(Boolean).join(" · ");

          return (
            <li key={item.key} className="flex gap-4 py-4">
              <div className="relative h-20 w-15 shrink-0 overflow-hidden bg-stone">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-caption font-medium text-ink">{item.name}</p>
                {meta && <p className="mt-0.5 text-micro text-muted">{meta}</p>}
                <p className="mt-auto text-micro text-muted tabular-nums">
                  {"Qty " + item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-caption tabular-nums text-ink">
                {formatMoney(item.unitPrice * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <CartSummary totals={totals} showProgress={false} className="mt-6" />
    </section>
  );
}
