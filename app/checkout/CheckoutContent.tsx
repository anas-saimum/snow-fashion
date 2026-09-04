"use client";

import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { selectCartItems, useCartStore, useCartTotals } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

export function CheckoutContent() {
  const hydrated = useHydrated();
  const items = useCartStore(selectCartItems);
  const totals = useCartTotals();

  return (
    <>
      <PageHeader
        eyebrow="Almost there"
        title="Checkout"
        trail={[
          { name: "Home", path: "/" },
          { name: "Cart", path: "/cart" },
          { name: "Checkout", path: "/checkout" },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        {!hydrated ? (
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-6" aria-hidden="true" />}
            title="There is nothing to check out"
            description="Add a piece to your cart and come back."
            action={{ href: "/shop", label: "Shop all" }}
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <CheckoutForm />
            </div>

            <aside className="lg:sticky lg:top-32 lg:h-fit">
              <OrderSummary items={items} totals={totals} />
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
