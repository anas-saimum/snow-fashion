"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { selectCartCount, useCartStore } from "@/store/cart";
import { selectWishlistCount, useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { siteConfig } from "@/config/site.config";

/**
 * Deliberately carries no display utility. Each instance adds its own, because
 * Tailwind resolves conflicting display classes by stylesheet order rather
 * than by attribute order — a shared `flex` here could out-rank a per-instance
 * `hidden` and leak desktop-only icons onto mobile.
 */
const iconButton =
  "relative size-10 items-center justify-center text-ink transition-colors hover:text-accent";

/**
 * Search / wishlist / cart / account. Counts render only after hydration —
 * the server cannot know what is in localStorage, and a guessed number would
 * flash the wrong value.
 */
export function HeaderActions() {
  const hydrated = useHydrated();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const openSearch = useUIStore((s) => s.openSearch);
  const openCart = useUIStore((s) => s.openCart);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={openSearch}
        className={iconButton + " flex"}
        aria-label="Search products"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      <Link
        href="/wishlist"
        className={iconButton + " hidden sm:flex"}
        aria-label={
          hydrated && wishlistCount > 0
            ? "Wishlist, " + wishlistCount + " saved"
            : "Wishlist"
        }
      >
        <Heart className="size-5" aria-hidden="true" />
        {hydrated && wishlistCount > 0 && <Count value={wishlistCount} />}
      </Link>

      <button
        type="button"
        onClick={openCart}
        className={iconButton + " flex"}
        aria-label={
          hydrated && cartCount > 0
            ? "Open cart, " + cartCount + " item" + (cartCount === 1 ? "" : "s")
            : "Open cart"
        }
      >
        <ShoppingBag className="size-5" aria-hidden="true" />
        {hydrated && cartCount > 0 && <Count value={cartCount} />}
      </button>

      {siteConfig.features.accountsEnabled ? (
        <Link href="/account" className={iconButton + " hidden sm:flex"} aria-label="Account">
          <User className="size-5" aria-hidden="true" />
        </Link>
      ) : (
        <span
          className="hidden size-10 items-center justify-center text-stone-dark sm:flex"
          title="Accounts are not available yet"
        >
          <User className="size-5" aria-hidden="true" />
          <span className="sr-only">Accounts are not available yet</span>
        </span>
      )}
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.625rem] font-medium leading-4 text-paper tabular-nums"
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}
