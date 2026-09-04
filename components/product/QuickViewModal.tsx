"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { ColorSwatches, SizeSelector } from "./VariantPicker";
import { QuantitySelector } from "./QuantitySelector";
import { WishlistButton } from "./WishlistButton";
import { useVariantSelection } from "@/hooks/useVariantSelection";
import { toCartItem } from "@/lib/cart";
import { discountPercent, formatMoney } from "@/lib/pricing";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/types";

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

/**
 * Lets a shopper choose a size and add to cart without leaving the grid,
 * while still offering the full product page for detail.
 */
export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const selection = useVariantSelection(product);
  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);
  const pushToast = useUIStore((s) => s.pushToast);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const image =
    product.images.find((i) => i.colorSlug === selection.colorSlug) ??
    product.images[0];

  const onAdd = () => {
    if (!selection.variant || !selection.inStock) return;
    add(toCartItem(product, selection.variant), selection.quantity);
    pushToast({ title: "Added to cart", description: product.name });
    onClose();
    openCart();
  };

  return (
    <Modal open={open} onClose={onClose} title={product.name} hideTitle size="lg">
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="relative aspect-3/4 bg-canvas">
          {image && (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 40vw, 100vw"
              className="object-cover"
            />
          )}
          {discount !== null && (
            <Badge tone="sale" className="absolute left-3 top-3">
              {"−" + discount + "%"}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <h3 className="text-h3">{product.name}</h3>
            <Rating
              value={product.rating}
              count={product.reviewCount}
              className="mt-2"
            />
          </div>

          <p className="flex items-baseline gap-3">
            <span className="text-lead font-medium tabular-nums">
              {formatMoney(product.price, product.currency)}
            </span>
            {product.compareAtPrice && discount !== null && (
              <span className="text-caption text-muted line-through tabular-nums">
                {formatMoney(product.compareAtPrice, product.currency)}
              </span>
            )}
          </p>

          <p className="text-caption leading-relaxed text-muted">
            {product.shortDescription}
          </p>

          {product.colors.length > 1 && (
            <div className="flex flex-col gap-2.5">
              <p className="u-eyebrow text-ink">
                Colour
                {selection.colorSlug && (
                  <span className="ml-2 normal-case tracking-normal text-muted">
                    {
                      product.colors.find((c) => c.slug === selection.colorSlug)
                        ?.name
                    }
                  </span>
                )}
              </p>
              <ColorSwatches
                colors={product.colors}
                value={selection.colorSlug}
                onChange={selection.chooseColor}
                size="sm"
              />
            </div>
          )}

          {product.sizes.length > 1 && (
            <div className="flex flex-col gap-2.5">
              <p className="u-eyebrow text-ink">Size</p>
              <SizeSelector
                sizes={product.sizes}
                value={selection.sizeSlug}
                onChange={selection.chooseSize}
                available={selection.available}
                size="sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <QuantitySelector
                value={selection.quantity}
                onChange={selection.setQuantity}
                max={selection.maxQuantity}
                size="sm"
                label={"quantity of " + product.name}
              />
              <Button
                onClick={onAdd}
                disabled={!selection.inStock}
                className="flex-1"
                size="sm"
              >
                {selection.colorSoldOut
                  ? "Sold out"
                  : selection.needsSize
                    ? "Select a size"
                    : selection.inStock
                      ? "Add to cart"
                      : "Unavailable"}
              </Button>
            </div>

            <WishlistButton
              productId={product.id}
              productName={product.name}
              variant="labelled"
              className="w-full"
            />
          </div>

          <Link
            href={"/product/" + product.slug}
            onClick={onClose}
            className="group mt-auto inline-flex items-center gap-2 text-micro font-medium uppercase tracking-[0.12em] text-ink"
          >
            <span className="u-link">View full details</span>
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
