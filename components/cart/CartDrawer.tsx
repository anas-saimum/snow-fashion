"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { selectCartItems, useCartStore, useCartTotals } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { useHydrated } from "@/hooks/useHydrated";

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore(selectCartItems);
  const totals = useCartTotals();
  const hydrated = useHydrated();
  const pathname = usePathname();

  // Never leave the drawer hanging over the cart or checkout page.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  const empty = hydrated && items.length === 0;

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      title={
        hydrated && totals.itemCount > 0
          ? "Cart (" + totals.itemCount + ")"
          : "Cart"
      }
      footer={
        empty ? undefined : (
          <div className="flex flex-col gap-4">
            <CartSummary totals={totals} />
            <div className="flex flex-col gap-2">
              <ButtonLink href="/checkout" size="lg" fullWidth>
                Proceed to Checkout
              </ButtonLink>
              <ButtonLink href="/cart" variant="ghost" fullWidth>
                View cart
              </ButtonLink>
            </div>
          </div>
        )
      }
    >
      {!hydrated ? (
        <div className="px-5 py-10 text-caption text-muted">Loading your cart…</div>
      ) : empty ? (
        <EmptyState
          icon={<ShoppingBag className="size-6" aria-hidden="true" />}
          title="Your cart is empty"
          description="Once you add something, it will appear here."
          action={{ href: "/shop", label: "Start shopping" }}
        />
      ) : (
        <ul className="divide-y divide-stone px-5">
          {items.map((item) => (
            <CartLineItem key={item.key} item={item} />
          ))}
        </ul>
      )}
    </Drawer>
  );
}
