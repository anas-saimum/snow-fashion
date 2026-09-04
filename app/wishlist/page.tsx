import type { Metadata } from "next";
import { WishlistContent } from "./WishlistContent";
import { productRepository } from "@/lib/repositories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Wishlist",
  description: "The Snow Fashion pieces you have saved for later.",
  path: "/wishlist",
  noIndex: true,
});

/**
 * The wishlist stores ids in the browser, so the product data has to be
 * hydrated here on the server and filtered on the client. With a catalogue
 * this size passing it whole is cheaper than a round trip; when the
 * catalogue grows, swap this for a /api/products?ids= lookup.
 */
export default async function WishlistPage() {
  const all = await productRepository.list({ perPage: 500 });
  return <WishlistContent products={all.items} />;
}
