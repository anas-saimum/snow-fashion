"use client";

import { Heart } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useWishlistStore } from "@/store/wishlist";
import { useHydrated } from "@/hooks/useHydrated";
import { pluralize } from "@/lib/utils";
import type { Product } from "@/types";

export function WishlistContent({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);

  // Preserve the order items were saved in.
  const saved = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  return (
    <>
      <PageHeader
        eyebrow="Saved for later"
        title="Wishlist"
        description={
          hydrated && saved.length > 0
            ? saved.length + " " + pluralize(saved.length, "piece") + " saved"
            : "Save the pieces you love and come back to them."
        }
        trail={[
          { name: "Home", path: "/" },
          { name: "Wishlist", path: "/wishlist" },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        {!hydrated ? (
          <ProductGridSkeleton count={4} />
        ) : saved.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-6" aria-hidden="true" />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it here."
            action={{ href: "/shop", label: "Browse the collection" }}
          />
        ) : (
          <>
            <ProductGrid products={saved} priorityCount={4} />

            <div className="mt-12 flex justify-center">
              <Button variant="link" onClick={clear} className="text-muted">
                Clear wishlist
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
