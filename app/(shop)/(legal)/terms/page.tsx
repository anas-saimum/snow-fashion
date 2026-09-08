import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms on which Snow Fashion sells to you.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      eyebrow="Legal"
      path="/terms"
      description="The terms that apply when you use this website or place an order."
    >
      <LegalSection heading="About us">
        <p>
          {"This website is operated by " +
            brand.legalName +
            ". Where these terms refer to “we” or “us”, they mean " +
            brand.legalName +
            "."}
        </p>
      </LegalSection>

      <LegalSection heading="Orders">
        <p>
          An order placed through this website is an offer to buy, not a
          contract of sale. A contract is formed only when we confirm the order
          and it is dispatched. We may decline an order — for example if an item
          is out of stock or a price was listed in error.
        </p>
        <p>
          While no payment provider is connected, orders placed here are
          recorded as unpaid requests. Nothing is charged and no contract of
          sale is formed until we have contacted you and payment is arranged.
        </p>
      </LegalSection>

      <LegalSection heading="Pricing">
        <p>
          Prices are shown in US dollars and include no tax or duty unless
          stated. We try to keep prices accurate; where an obvious error occurs,
          we will contact you before proceeding rather than charge the wrong
          amount.
        </p>
      </LegalSection>

      <LegalSection heading="Product descriptions and imagery">
        <p>
          We describe fabrics, fits and measurements as accurately as we can.
          Colours can vary slightly between screens, and measurements may vary
          by a centimetre or two between production runs.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          The text, imagery and design of this website belong to their
          respective owners and may not be reproduced without permission.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          Nothing in these terms limits your statutory rights as a consumer. We
          are not liable for indirect or consequential loss arising from use of
          this website.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {"Questions about these terms can go to " + siteConfig.contact.email + "."}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
