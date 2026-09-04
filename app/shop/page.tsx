import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopResults } from "@/components/shop/ShopResults";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";
import type { RawSearchParams } from "@/lib/url-state";

interface ShopPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Boolean(
    params.category || params.size || params.color || params.min || params.max,
  );

  return pageMetadata({
    title: "Shop All",
    description:
      "Browse the full Snow Fashion collection — dresses, tops, bottoms, outerwear, traditional wear and accessories. Filter by size, colour and price.",
    path: "/shop",
    // Filtered permutations are near-duplicates: keep them out of the index
    // but let crawlers follow through to the products.
    noIndex: filtered,
  });
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title="Shop All"
        description="Every piece in the Snow Fashion wardrobe, in one place."
        trail={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
        ]}
      />

      {/* The masthead paints immediately; the grid streams in behind it. */}
      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}
