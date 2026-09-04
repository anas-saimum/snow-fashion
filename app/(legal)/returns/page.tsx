import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Returns",
  description: "How to return or exchange a Snow Fashion order.",
  path: "/returns",
});

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Returns"
      path="/returns"
      description="If something is not right, here is how to put it right."
    >
      <LegalSection heading="The window">
        <p>
          Unworn items may be returned within 30 days of delivery. Tags must
          still be attached and the piece must be in its original packaging.
        </p>
      </LegalSection>

      <LegalSection heading="What cannot be returned">
        <p>
          For hygiene reasons we cannot accept returns on pierced jewellery or
          intimates once the seal is broken. Items marked final sale are not
          returnable. Altered garments cannot be returned.
        </p>
      </LegalSection>

      <LegalSection heading="How to start a return">
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>
            {"Email " + siteConfig.contact.email + " with your order number and the item you would like to return."}
          </li>
          <li>We will reply with a returns reference and the return address.</li>
          <li>
            Send the item back in its original packaging with the reference
            enclosed.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="Refunds">
        <p>
          Refunds are issued to the original payment method once the item has
          been received and inspected, usually within five working days of
          arrival. Original shipping charges are not refunded unless the item
          was faulty or incorrectly sent.
        </p>
      </LegalSection>

      <LegalSection heading="Exchanges">
        <p>
          The quickest route to a different size or colour is to return the
          original item for a refund and place a new order, so the piece you
          want is not sold in the meantime.
        </p>
      </LegalSection>

      <LegalSection heading="Faulty items">
        <p>
          If a piece arrives damaged or develops a fault in normal wear, contact
          us with a photograph and we will arrange a replacement, repair or
          refund at no cost to you.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
