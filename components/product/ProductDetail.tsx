"use client";

import { useRouter } from "next/navigation";
import { Truck, RotateCcw } from "lucide-react";
import { ProductGallery } from "./ProductGallery";
import { ColorSwatches, SizeSelector } from "./VariantPicker";
import { QuantitySelector } from "./QuantitySelector";
import { SizeGuideModal } from "./SizeGuideModal";
import { WishlistButton } from "./WishlistButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { useVariantSelection } from "@/hooks/useVariantSelection";
import { toCartItem } from "@/lib/cart";
import { discountPercent, formatMoney, formatMoneyCompact } from "@/lib/pricing";
import { shippingConfig } from "@/config/shipping.config";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import type { Product, SizeGuide } from "@/types";

interface ProductDetailProps {
  product: Product;
  sizeGuide?: SizeGuide;
}

const LOW_STOCK_THRESHOLD = 4;

/**
 * Gallery and purchase panel are one client component because the colour
 * swatch drives both: choosing a colour advances the gallery and narrows the
 * available sizes at the same time.
 */
export function ProductDetail({ product, sizeGuide }: ProductDetailProps) {
  const router = useRouter();
  const selection = useVariantSelection(product);
  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);
  const pushToast = useUIStore((s) => s.pushToast);

  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.inventory === 0;
  const activeColor = product.colors.find((c) => c.slug === selection.colorSlug);

  const addToCart = () => {
    if (!selection.variant || !selection.inStock) return false;
    add(toCartItem(product, selection.variant), selection.quantity);
    return true;
  };

  const onAddToCart = () => {
    if (!addToCart()) return;
    pushToast({
      title: "Added to cart",
      description: product.name,
      href: "/cart",
      hrefLabel: "View cart",
    });
    openCart();
  };

  const onBuyNow = () => {
    if (!addToCart()) return;
    router.push("/checkout");
  };

  const ctaLabel = soldOut
    ? "Sold out"
    : selection.colorSoldOut
      ? "Colour sold out"
      : selection.needsSize
        ? "Select a size"
        : selection.inStock
          ? "Add to Cart"
          : "Unavailable";

  const lowStock =
    selection.inStock &&
    selection.variant !== undefined &&
    selection.variant.inventory <= LOW_STOCK_THRESHOLD;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-24">
      <ProductGallery
        images={product.images}
        productName={product.name}
        activeColorSlug={selection.colorSlug}
      />

      <div className="lg:pt-2">
        {/* Title block */}
        <div className="flex flex-wrap items-center gap-2">
          {discount !== null && <Badge tone="sale">{"−" + discount + "% off"}</Badge>}
          {product.newArrival && <Badge tone="muted">New arrival</Badge>}
          {product.bestseller && <Badge tone="muted">Best seller</Badge>}
        </div>

        <h1 className="mt-4 text-h1">{product.name}</h1>

        <Rating
          value={product.rating}
          count={product.reviewCount}
          size="md"
          className="mt-3"
        />

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <p className="text-h3 font-sans font-medium tabular-nums text-ink">
            {formatMoney(product.price, product.currency)}
          </p>
          {product.compareAtPrice && discount !== null && (
            <>
              <p className="text-body text-muted line-through tabular-nums">
                {formatMoney(product.compareAtPrice, product.currency)}
              </p>
              <p className="text-caption text-sale">
                {"Save " +
                  formatMoney(product.compareAtPrice - product.price, product.currency)}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 max-w-prose text-body leading-relaxed text-ink-soft">
          {product.shortDescription}
        </p>

        {/* Options */}
        <div className="mt-9 flex flex-col gap-7">
          {product.colors.length > 1 && (
            <div className="flex flex-col gap-3">
              <p className="u-eyebrow text-ink">
                Colour
                {activeColor && (
                  <span className="ml-2 normal-case tracking-normal text-muted">
                    {activeColor.name}
                  </span>
                )}
              </p>
              <ColorSwatches
                colors={product.colors}
                value={selection.colorSlug}
                onChange={selection.chooseColor}
              />
            </div>
          )}

          {product.sizes.length > 1 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <p className="u-eyebrow text-ink">Size</p>
                {sizeGuide && <SizeGuideModal guide={sizeGuide} />}
              </div>
              <SizeSelector
                sizes={product.sizes}
                value={selection.sizeSlug}
                onChange={selection.chooseSize}
                available={selection.available}
              />
              {selection.needsSize && (
                <p className="text-micro text-muted">
                  Please choose a size to continue.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="u-eyebrow text-ink">Quantity</p>
            <div className="flex flex-wrap items-center gap-4">
              <QuantitySelector
                value={selection.quantity}
                onChange={selection.setQuantity}
                max={selection.maxQuantity}
                label={"quantity of " + product.name}
              />
              <div aria-live="polite" className="text-micro">
                {lowStock && (
                  <p className="text-sale">
                    {"Only " + selection.variant?.inventory + " left in this size"}
                  </p>
                )}
                {selection.colorSoldOut && (
                  <p className="text-muted">
                    This colour is currently out of stock.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-9 flex flex-col gap-3">
          <Button
            size="lg"
            fullWidth
            onClick={onAddToCart}
            disabled={!selection.inStock}
          >
            {ctaLabel}
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              onClick={onBuyNow}
              disabled={!selection.inStock}
              className="flex-1"
            >
              Buy Now
            </Button>

            <WishlistButton
              productId={product.id}
              productName={product.name}
              variant="labelled"
              size="lg"
              className="flex-1"
            />
          </div>
        </div>

        {/* Reassurance */}
        <dl className="mt-9 flex flex-col gap-4 border-t border-stone pt-7">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <dt className="text-caption font-medium text-ink">
                {"Free shipping over " +
                  formatMoneyCompact(shippingConfig.freeShippingThreshold)}
              </dt>
              <dd className="text-micro text-muted">
                {"Otherwise " +
                  formatMoney(shippingConfig.flatRate) +
                  " · " +
                  shippingConfig.estimatedDays}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw
              className="mt-0.5 size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <div>
              <dt className="text-caption font-medium text-ink">
                30-day returns
              </dt>
              <dd className="text-micro text-muted">
                Unworn, with tags attached and original packaging.
              </dd>
            </div>
          </div>
        </dl>

        {selection.variant && (
          <p className="mt-7 text-micro text-stone-dark">
            {"SKU " + selection.variant.sku}
          </p>
        )}
      </div>
    </div>
  );
}
