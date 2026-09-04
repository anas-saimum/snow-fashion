import type { Metadata } from "next";
import { ConfirmationContent } from "./ConfirmationContent";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order received",
  description: "Your Snow Fashion order request has been recorded.",
  path: "/checkout/confirmation",
  noIndex: true,
});

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <ConfirmationContent orderId={orderId} />;
}
