import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Snow Fashion handles your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Legal"
      path="/privacy"
      description="What we collect, why we collect it, and what we do not do with it."
    >
      <LegalSection heading="What we collect">
        <p>
          When you place an order we collect your name, email address, phone
          number and shipping address. When you contact us we keep the message
          and your reply address so we can answer it.
        </p>
        <p>
          Your cart and wishlist are stored in your own browser, not on our
          servers, and are never transmitted to us unless you place an order.
        </p>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          To process and deliver your order, to answer your enquiries, and — if
          you have opted in — to send occasional email about new collections.
          You can unsubscribe from marketing email at any time.
        </p>
      </LegalSection>

      <LegalSection heading="Payment information">
        <p>
          This store does not currently have a payment provider connected, and
          therefore does not collect, process or store card details of any kind.
          When a provider is added, card details will be handled by that
          provider directly and will not pass through our systems.
        </p>
      </LegalSection>

      <LegalSection heading="Sharing">
        <p>
          We share your address with the carrier delivering your order. We do
          not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          {"You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Write to " +
            siteConfig.contact.email +
            " and we will respond within 30 days."}
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {"Questions about this policy can go to " + siteConfig.contact.email + "."}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
