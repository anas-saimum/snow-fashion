"use client";

import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ButtonLink, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { selectCartItems, useCartStore, useCartTotals } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { pluralize } from "@/lib/utils";

/**
 * Client page: the cart lives in localStorage, so it cannot be server
 * rendered. The loading state exists because hydration is a real moment the
 * customer sees, not an implementation detail.
 */
export function CartPageContent() {
  const hydrated = useHydrated();
  const items = useCartStore(selectCartItems);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartTotals();

  return (
    <>
      <PageHeader
        eyebrow="Shopping bag"
        title="Your Cart"
        description={
          hydrated && items.length > 0
            ? totals.itemCount + " " + pluralize(totals.itemCount, "item") + " in your cart"
            : undefined
        }
        trail={[
          { name: "Home", path: "/" },
          { name: "Cart", path: "/cart" },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        {!hydrated ? (
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-36 w-27" />
                  <div className="flex flex-1 flex-col gap-3 pt-1">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-6" aria-hidden="true" />}
            title="Your cart is empty"
            description="Browse the collection and add something you love."
            action={{ href: "/shop", label: "Shop all" }}
            secondaryAction={{ href: "/wishlist", label: "View wishlist" }}
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <section aria-label="Cart items">
              <ul className="divide-y divide-stone border-y border-stone">
                {items.map((item) => (
                  <CartLineItem key={item.key} item={item} layout="roomy" />
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <ButtonLink href="/shop" variant="link">
                  Continue shopping
                </ButtonLink>
                <Button variant="link" onClick={clear} className="text-muted">
                  Clear cart
                </Button>
              </div>
            </section>

            <aside aria-label="Order totals" className="lg:sticky lg:top-32 lg:h-fit">
              <div className="bg-canvas p-6 lg:p-8">
                <h2 className="u-eyebrow text-ink">Summary</h2>
                <CartSummary totals={totals} className="mt-6" />
                <ButtonLink href="/checkout" size="lg" fullWidth className="mt-7">
                  Proceed to Checkout
                </ButtonLink>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
