import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopResults } from "@/components/shop/ShopResults";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { pageMetadata } from "@/lib/seo";
import type { RawSearchParams } from "@/lib/url-state";

interface PageProps {
  searchParams: Promise<RawSearchParams>;
}

export const metadata: Metadata = pageMetadata({
  title: "New Arrivals",
  description:
    "The newest pieces at Snow Fashion — fresh silhouettes, fabrics and colours, added this season.",
  path: "/new-arrivals",
  image: "/images/categories/new-arrivals.jpg",
});

/**
 * A real landing page rather than a redirect to /shop?filter=new, so it can
 * carry its own metadata and be linked from the navigation.
 */
export default function NewArrivalsPage({ searchParams }: PageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Just landed"
        title="New Arrivals"
        description="The most recent additions to the Snow Fashion wardrobe."
        trail={[
          { name: "Home", path: "/" },
          { name: "New Arrivals", path: "/new-arrivals" },
        ]}
        image={{
          url: "/images/categories/new-arrivals.jpg",
          alt: "Model wearing a cream cable-knit sleeveless vest with denim",
        }}
      />

      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults
          searchParams={searchParams}
          overrides={{ sort: "newest", flags: { newArrival: true } }}
        />
      </Suspense>
    </>
  );
}
