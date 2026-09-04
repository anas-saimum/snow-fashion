import type { Metadata } from "next";
import { CheckoutContent } from "./CheckoutContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Snow Fashion order.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutContent />;
}
