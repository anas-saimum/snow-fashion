import { shippingConfig } from "@/config/shipping.config";
import { formatMoneyCompact } from "@/lib/pricing";

/**
 * Thin utility bar above the header. Copy comes from shipping config so the
 * threshold can never drift out of sync with what the cart actually charges.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper">
      <div className="u-container flex h-9 items-center justify-center gap-6 text-micro tracking-[0.14em] uppercase">
        <p>
          Complimentary shipping on orders over{" "}
          {formatMoneyCompact(shippingConfig.freeShippingThreshold)}
        </p>
        <p className="hidden sm:block" aria-hidden="true">
          ·
        </p>
        <p className="hidden sm:block">Easy 30-day returns</p>
      </div>
    </div>
  );
}
