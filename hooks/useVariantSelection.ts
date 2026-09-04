"use client";

import { useMemo, useState } from "react";
import { availableSizeSlugs, findVariant } from "@/lib/cart";
import type { Product } from "@/types";

/**
 * Shared variant logic for the product page and quick view, so the two can
 * never disagree about what is in stock.
 *
 * Defaults to the first colour, and to the first in-stock size when there is
 * only one size to speak of (a "One Size" accessory selects itself).
 */
export function useVariantSelection(product: Product) {
  const [colorSlug, setColorSlug] = useState<string | undefined>(
    product.colors[0]?.slug,
  );

  const singleSize = product.sizes.length === 1;
  const [sizeSlug, setSizeSlug] = useState<string | undefined>(
    singleSize ? product.sizes[0]?.slug : undefined,
  );

  const [quantity, setQuantity] = useState(1);

  const available = useMemo(
    () => availableSizeSlugs(product, colorSlug),
    [product, colorSlug],
  );

  const variant = useMemo(
    () => findVariant(product, colorSlug, sizeSlug),
    [product, colorSlug, sizeSlug],
  );

  const colorSoldOut = available.size === 0;
  const needsSize = !singleSize && !sizeSlug;
  const inStock = Boolean(variant && variant.inventory > 0);
  const maxQuantity = Math.max(1, Math.min(variant?.inventory ?? 1, 10));

  /** Changing colour can invalidate the chosen size. */
  const chooseColor = (slug: string) => {
    setColorSlug(slug);
    setQuantity(1);
    if (sizeSlug) {
      const stillAvailable = product.variants.some(
        (v) => v.colorSlug === slug && v.sizeSlug === sizeSlug && v.inventory > 0,
      );
      if (!stillAvailable) setSizeSlug(singleSize ? sizeSlug : undefined);
    }
  };

  const chooseSize = (slug: string) => {
    setSizeSlug(slug);
    setQuantity(1);
  };

  return {
    colorSlug,
    sizeSlug,
    quantity,
    variant,
    available,
    colorSoldOut,
    needsSize,
    inStock,
    maxQuantity,
    chooseColor,
    chooseSize,
    setQuantity,
  };
}
