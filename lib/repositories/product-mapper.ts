import type { Product, ProductImage, ProductVariant } from "@/types";
import type { ProductInput } from "@/types/admin";

/**
 * Turns editor input into a domain Product.
 *
 * Shared by the in-memory and Supabase repositories so both agree on the
 * derived fields — notably `inventory`, which is always the sum of variant
 * stock and never stored independently, because two sources of truth for
 * stock is how oversells happen.
 */

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2, 12);
}

export function productFromInput(
  id: string,
  input: ProductInput,
  currency: Product["currency"] = "USD",
): Product {
  const images: ProductImage[] = input.images.map((image, index) => ({
    id: image.id ?? id + "-img-" + (index + 1),
    url: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
    colorSlug: image.colorSlug,
  }));

  const variants: ProductVariant[] = input.variants.map((variant) => ({
    id: variant.id ?? newId(),
    sku: variant.sku,
    colorSlug: variant.colorSlug,
    sizeSlug: variant.sizeSlug,
    price: variant.price,
    inventory: variant.inventory,
  }));

  return {
    id,
    slug: input.slug,
    name: input.name,
    shortDescription: input.shortDescription,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    currency,
    categorySlugs: [...input.categorySlugs],
    images,
    colors: input.colors.map((c) => ({ ...c })),
    sizes: input.sizes.map((s) => ({ ...s })),
    variants,
    materials: input.materials.length ? [...input.materials] : undefined,
    careInstructions: input.careInstructions.length
      ? [...input.careInstructions]
      : undefined,
    sizeGuideId: input.sizeGuideId,
    // Ratings are not editable in the admin: they must come from a reviews
    // provider, never be typed in by hand.
    rating: undefined,
    reviewCount: undefined,
    featured: input.featured,
    bestseller: input.bestseller,
    newArrival: input.newArrival,
    inventory: variants.reduce((sum, v) => sum + v.inventory, 0),
    status: input.status,
    publishedAt: input.publishedAt,
    seo:
      input.seoTitle || input.seoDescription
        ? { title: input.seoTitle, description: input.seoDescription }
        : undefined,
  };
}

/** Turns an existing product back into editor input. */
export function inputFromProduct(product: Product): ProductInput {
  return {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    categorySlugs: [...product.categorySlugs],
    colors: product.colors.map((c) => ({ ...c })),
    sizes: product.sizes.map((s) => ({ ...s })),
    images: product.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      width: i.width,
      height: i.height,
      colorSlug: i.colorSlug,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      colorSlug: v.colorSlug,
      sizeSlug: v.sizeSlug,
      price: v.price,
      inventory: v.inventory,
    })),
    materials: product.materials ?? [],
    careInstructions: product.careInstructions ?? [],
    sizeGuideId: product.sizeGuideId,
    featured: product.featured,
    bestseller: product.bestseller,
    newArrival: product.newArrival,
    status: product.status,
    publishedAt: product.publishedAt,
    seoTitle: product.seo?.title,
    seoDescription: product.seo?.description,
  };
}

/**
 * Builds the variant grid for the chosen colours and sizes, preserving stock
 * and SKUs for combinations that already existed. Adding a colour should not
 * silently reset the stock of every other variant.
 */
export function buildVariantGrid(
  slug: string,
  colorSlugs: string[],
  sizeSlugs: string[],
  existing: ProductInput["variants"] = [],
): ProductInput["variants"] {
  const previous = new Map(
    existing.map((v) => [(v.colorSlug ?? "-") + ":" + (v.sizeSlug ?? "-"), v]),
  );

  const colors = colorSlugs.length ? colorSlugs : [undefined];
  const sizes = sizeSlugs.length ? sizeSlugs : [undefined];
  const base = slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);

  const grid: ProductInput["variants"] = [];

  for (const colorSlug of colors) {
    for (const sizeSlug of sizes) {
      const key = (colorSlug ?? "-") + ":" + (sizeSlug ?? "-");
      const prior = previous.get(key);

      grid.push({
        id: prior?.id,
        sku:
          prior?.sku ??
          ["SF", base, (colorSlug ?? "STD").toUpperCase().slice(0, 3), (sizeSlug ?? "OS").toUpperCase()].join("-"),
        colorSlug,
        sizeSlug,
        price: prior?.price,
        inventory: prior?.inventory ?? 0,
      });
    }
  }

  return grid;
}
