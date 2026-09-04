import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { shippingConfig } from "@/config/shipping.config";
import { formatMoney, formatMoneyCompact } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping",
  description:
    "Snow Fashion shipping rates, delivery estimates and the countries we ship to.",
  path: "/shipping",
});

export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping"
      path="/shipping"
      description="How and when your order reaches you."
    >
      <LegalSection heading="Rates">
        <p>
          {"Standard shipping is " +
            formatMoney(shippingConfig.flatRate) +
            " per order. Orders over " +
            formatMoneyCompact(shippingConfig.freeShippingThreshold) +
            " ship free."}
        </p>
        <p>
          Rates shown at checkout are an estimate. Taxes and import duties,
          where they apply, are calculated at dispatch and are not included.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery times">
        <p>
          {"Orders typically arrive within " +
            shippingConfig.estimatedDays +
            " from dispatch. Dispatch usually happens within one working day of an order being confirmed."}
        </p>
        <p>
          Estimates are counted in working days and exclude public holidays.
          During collection launches and sale periods, dispatch may take an
          extra day.
        </p>
      </LegalSection>

      <LegalSection heading="Where we ship">
        <p>We currently ship to the following countries:</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {shippingConfig.countries.map((country) => (
            <li key={country} className="text-caption text-muted">
              {country}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading="Tracking">
        <p>
          A tracking reference is emailed as soon as your parcel leaves us. If
          it has not arrived within the estimated window, contact us and we will
          chase it with the carrier.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
