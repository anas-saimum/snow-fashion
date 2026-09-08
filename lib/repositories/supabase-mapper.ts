import type { Product } from "@/types";
import type { ProductInput } from "@/types/admin";

/** Nested select used by every product read. Keep in step with rowToProduct. */
export const PRODUCT_SELECT = `
  id, slug, name, short_description, description, price, compare_at_price,
  currency, materials, care_instructions, size_guide_id, rating, review_count,
  featured, bestseller, new_arrival, status, published_at, updated_at,
  seo_title, seo_description,
  product_categories ( category_slug ),
  product_colors ( id, name, slug, hex, sort_order ),
  product_sizes ( id, label, slug, sort_order ),
  product_images ( id, url, alt, width, height, color_slug, sort_order ),
  product_variants ( id, sku, color_slug, size_slug, price, inventory )
`;

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string | null;
  materials: string[] | null;
  care_instructions: string[] | null;
  size_guide_id: string | null;
  rating: number | string | null;
  review_count: number | null;
  featured: boolean;
  bestseller: boolean;
  new_arrival: boolean;
  status: Product["status"];
  published_at: string;
  updated_at?: string;
  seo_title: string | null;
  seo_description: string | null;
  product_categories: Array<{ category_slug: string }> | null;
  product_colors: Array<{ id: string; name: string; slug: string; hex: string; sort_order: number }> | null;
  product_sizes: Array<{ id: string; label: string; slug: string; sort_order: number }> | null;
  product_images: Array<{
    id: string;
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    color_slug: string | null;
    sort_order: number;
  }> | null;
  product_variants: Array<{
    id: string;
    sku: string;
    color_slug: string | null;
    size_slug: string | null;
    price: number | null;
    inventory: number;
  }> | null;
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) =>
  a.sort_order - b.sort_order;

/**
 * Postgres row → domain Product.
 *
 * `inventory` is summed from the variants here rather than read from a column,
 * so it can never disagree with the rows it is derived from.
 */
export function rowToProduct(row: unknown): Product {
  const r = row as ProductRow;

  const variants = (r.product_variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    colorSlug: v.color_slug ?? undefined,
    sizeSlug: v.size_slug ?? undefined,
    price: v.price ?? undefined,
    inventory: v.inventory,
  }));

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    price: r.price,
    compareAtPrice: r.compare_at_price ?? undefined,
    currency: (r.currency ?? "USD") as Product["currency"],
    categorySlugs: (r.product_categories ?? []).map((c) => c.category_slug),
    images: [...(r.product_images ?? [])].sort(bySortOrder).map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt ?? "",
      width: i.width ?? 1200,
      height: i.height ?? 1600,
      colorSlug: i.color_slug ?? undefined,
    })),
    colors: [...(r.product_colors ?? [])].sort(bySortOrder).map((c) => ({
      name: c.name,
      slug: c.slug,
      hex: c.hex,
    })),
    sizes: [...(r.product_sizes ?? [])].sort(bySortOrder).map((s) => ({
      label: s.label,
      slug: s.slug,
    })),
    variants,
    materials: r.materials?.length ? r.materials : undefined,
    careInstructions: r.care_instructions?.length ? r.care_instructions : undefined,
    sizeGuideId: r.size_guide_id ?? undefined,
    rating: r.rating === null ? undefined : Number(r.rating),
    reviewCount: r.review_count ?? undefined,
    featured: r.featured,
    bestseller: r.bestseller,
    newArrival: r.new_arrival,
    inventory: variants.reduce((sum, v) => sum + v.inventory, 0),
    status: r.status,
    publishedAt: new Date(r.published_at).toISOString(),
    seo:
      r.seo_title || r.seo_description
        ? {
            title: r.seo_title ?? undefined,
            description: r.seo_description ?? undefined,
          }
        : undefined,
  };
}

/** Domain input → the jsonb payload upsert_product expects. */
export function inputToPayload(
  input: ProductInput,
  id?: string,
): Record<string, unknown> {
  return {
    id: id ?? null,
    slug: input.slug,
    name: input.name,
    short_description: input.shortDescription,
    description: input.description,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    currency: "USD",
    materials: input.materials,
    care_instructions: input.careInstructions,
    size_guide_id: input.sizeGuideId ?? null,
    featured: input.featured,
    bestseller: input.bestseller,
    new_arrival: input.newArrival,
    status: input.status,
    published_at: input.publishedAt,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    category_slugs: input.categorySlugs,
    colors: input.colors.map((c) => ({ name: c.name, slug: c.slug, hex: c.hex })),
    sizes: input.sizes.map((s) => ({ label: s.label, slug: s.slug })),
    images: input.images.map((i) => ({
      url: i.url,
      alt: i.alt,
      width: i.width,
      height: i.height,
      color_slug: i.colorSlug ?? null,
    })),
    variants: input.variants.map((v) => ({
      sku: v.sku,
      color_slug: v.colorSlug ?? null,
      size_slug: v.sizeSlug ?? null,
      price: v.price ?? null,
      inventory: v.inventory,
    })),
  };
}
