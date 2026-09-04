import type { Product, ProductVariant } from "@/types";
import type { NewCartItem } from "@/store/cart";

/**
 * Turns a product + chosen variant into a cart line. The price and image are
 * snapshotted here so the cart still renders correctly if the catalogue
 * changes underneath it — see the production note in order.service.ts.
 */
export function toCartItem(
  product: Product,
  variant: ProductVariant,
): NewCartItem {
  const color = product.colors.find((c) => c.slug === variant.colorSlug);
  const size = product.sizes.find((s) => s.slug === variant.sizeSlug);

  const image =
    product.images.find((i) => i.colorSlug === variant.colorSlug) ??
    product.images[0];

  return {
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    name: product.name,
    image: image?.url ?? "",
    imageAlt: image?.alt ?? product.name,
    colorName: color?.name,
    sizeLabel: size?.label,
    unitPrice: variant.price ?? product.price,
    compareAtPrice: product.compareAtPrice,
    maxQuantity: Math.max(1, Math.min(variant.inventory, 10)),
  };
}

export function findVariant(
  product: Product,
  colorSlug?: string,
  sizeSlug?: string,
): ProductVariant | undefined {
  return product.variants.find(
    (v) => v.colorSlug === colorSlug && v.sizeSlug === sizeSlug,
  );
}

/** Sizes that have stock in the chosen colour. */
export function availableSizeSlugs(
  product: Product,
  colorSlug?: string,
): Set<string> {
  return new Set(
    product.variants
      .filter((v) => v.colorSlug === colorSlug && v.inventory > 0)
      .map((v) => v.sizeSlug ?? ""),
  );
}

/** True when a product needs no choices made before it can be added. */
export function isSingleVariant(product: Product): boolean {
  return product.variants.length === 1;
}
