import type { Metadata } from "next";
import { CartPageContent } from "./CartPageContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your Cart",
  description: "Review the pieces in your Snow Fashion cart before checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageContent />;
}
