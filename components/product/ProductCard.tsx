"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { WishlistButton } from "./WishlistButton";
import { QuickViewModal } from "./QuickViewModal";
import { discountPercent, formatMoneyCompact } from "@/lib/pricing";
import { isSingleVariant, toCartItem } from "@/lib/cart";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  /** Passed to next/image so the browser downloads the right file size. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

const DEFAULT_SIZES =
  "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";

/**
 * The catalogue's workhorse. One component serves the homepage rails, the
 * shop grid, category pages, search results and related products.
 *
 * Mobile gets a persistent quick-add button rather than a hover overlay,
 * because hover does not exist on touch.
 */
export function ProductCard({
  product,
  sizes = DEFAULT_SIZES,
  priority = false,
  className,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);
  const pushToast = useUIStore((s) => s.pushToast);

  const primary = product.images[0];
  const hover = product.images[1];
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.inventory === 0;
  const href = "/product/" + product.slug;

  /** One variant means nothing to choose, so add straight to the cart. */
  const handleQuickAdd = () => {
    if (soldOut) return;

    if (isSingleVariant(product)) {
      const variant = product.variants[0];
      if (!variant || variant.inventory === 0) {
        setQuickViewOpen(true);
        return;
      }
      add(toCartItem(product, variant));
      pushToast({ title: "Added to cart", description: product.name });
      openCart();
      return;
    }

    setQuickViewOpen(true);
  };

  return (
    <>
      <article className={cn("group relative flex flex-col", className)}>
        <div className="relative overflow-hidden bg-canvas">
          <Link
            href={href}
            className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            aria-label={product.name}
          >
            <div className="relative aspect-3/4 w-full">
              {primary && (
                <Image
                  src={primary.url}
                  alt={primary.alt}
                  fill
                  sizes={sizes}
                  priority={priority}
                  className={cn(
                    "object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    hover
                      ? "group-hover:opacity-0"
                      : "group-hover:scale-[1.03]",
                  )}
                />
              )}

              {hover && (
                <Image
                  src={hover.url}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={sizes}
                  loading="lazy"
                  className="scale-[1.02] object-cover opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                />
              )}
            </div>
          </Link>

          {/* Badges */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {soldOut ? (
              <Badge tone="paper">Sold out</Badge>
            ) : (
              <>
                {discount !== null && <Badge tone="sale">{"−" + discount + "%"}</Badge>}
                {product.newArrival && <Badge tone="ink">New</Badge>}
              </>
            )}
          </div>

          <WishlistButton
            productId={product.id}
            productName={product.name}
            className="absolute right-3 top-3"
          />

          {/* Desktop hover actions */}
          <div
            className="absolute inset-x-0 bottom-0 hidden translate-y-full gap-px opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 lg:flex"
          >
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-paper/95 text-micro font-medium uppercase tracking-[0.1em] text-ink backdrop-blur-sm transition-colors hover:bg-paper"
            >
              <Eye className="size-4" aria-hidden="true" />
              Quick view
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={soldOut}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-ink/95 text-micro font-medium uppercase tracking-[0.1em] text-paper backdrop-blur-sm transition-colors hover:bg-ink disabled:opacity-50"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              {soldOut ? "Sold out" : "Add to cart"}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-1.5 pt-3.5">
          <h3 className="font-sans text-caption font-medium leading-snug text-ink">
            <Link href={href} className="hover:text-accent">
              {product.name}
            </Link>
          </h3>

          <Rating value={product.rating} count={product.reviewCount} showCount={false} />

          <div className="mt-auto flex items-end justify-between gap-3 pt-1">
            <p className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-caption tabular-nums",
                  discount !== null ? "font-medium text-sale" : "text-ink",
                )}
              >
                {formatMoneyCompact(product.price, product.currency)}
              </span>
              {product.compareAtPrice && discount !== null && (
                <span className="text-micro text-muted line-through tabular-nums">
                  {formatMoneyCompact(product.compareAtPrice, product.currency)}
                </span>
              )}
            </p>

            {/* Touch quick-add — hover overlays do not exist on mobile. */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={soldOut}
              aria-label={"Add " + product.name + " to cart"}
              className="flex size-8 shrink-0 items-center justify-center border border-stone-dark text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-30 lg:hidden"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
