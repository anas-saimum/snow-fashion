import { categories } from "@/data/categories";
import { isOnSale } from "@/lib/pricing";
import { searchProducts } from "@/lib/search";
import type { FacetValue, Facets, Product } from "@/types";
import type { ProductQuery } from "./product.repository";

/**
 * The catalogue query engine, as pure functions over an array of products.
 *
 * Extracted so the static demo repository and the in-memory admin repository
 * share one implementation of filtering, sorting and faceting. Three copies
 * of this logic would drift, and the shop grid, category pages and search all
 * depend on it agreeing with itself.
 *
 * A SQL-backed repository does this work in the database instead — see
 * product.supabase.ts — but it must produce the same answers, which is what
 * tests/unit/repository.test.ts pins down.
 */

export const DEFAULT_PER_PAGE = 12;

function matchesFacets(product: Product, query: ProductQuery): boolean {
  const { categorySlugs, sizes, colors, minPrice, maxPrice, flags } = query;

  if (categorySlugs?.length) {
    const hit = categorySlugs.some((slug) => {
      if (product.categorySlugs.includes(slug)) return true;
      // A parent category also matches its children (Women's -> Dresses).
      const children = categories
        .filter((c) => c.parentSlug === slug)
        .map((c) => c.slug);
      return children.some((child) => product.categorySlugs.includes(child));
    });
    if (!hit) return false;
  }

  // Size and colour match against variants that are actually purchasable.
  // Filtering on the declared options instead would surface products whose
  // chosen size is sold out, which is a dead end for the shopper.
  if (sizes?.length) {
    const hit = product.variants.some(
      (v) => v.inventory > 0 && v.sizeSlug !== undefined && sizes.includes(v.sizeSlug),
    );
    if (!hit) return false;
  }

  if (colors?.length) {
    const hit = product.variants.some(
      (v) => v.inventory > 0 && v.colorSlug !== undefined && colors.includes(v.colorSlug),
    );
    if (!hit) return false;
  }

  if (minPrice !== undefined && product.price < minPrice) return false;
  if (maxPrice !== undefined && product.price > maxPrice) return false;

  if (flags?.newArrival && !product.newArrival) return false;
  if (flags?.bestseller && !product.bestseller) return false;
  if (flags?.featured && !product.featured) return false;
  if (flags?.onSale && !isOnSale(product.price, product.compareAtPrice)) return false;

  return true;
}

function applySort(items: Product[], query: ProductQuery): Product[] {
  const sorted = [...items];

  switch (query.sort) {
    case "newest":
      return sorted.sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
      );
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "best-selling":
      return sorted.sort((a, b) => {
        if (a.bestseller !== b.bestseller) return a.bestseller ? -1 : 1;
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      });
    case "featured":
    default:
      return sorted.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.bestseller !== b.bestseller) return a.bestseller ? -1 : 1;
        return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
      });
  }
}

/** Applies filters, search relevance and sort. Does not paginate. */
export function resolveProducts(
  all: Product[],
  query: ProductQuery = {},
): Product[] {
  const active = all.filter((p) => p.status === "active");
  const items = active.filter((p) => matchesFacets(p, query));

  if (query.search?.trim()) {
    // Search returns relevance order; an explicit sort overrides it.
    const ranked = searchProducts(items, query.search);
    return query.sort && query.sort !== "featured"
      ? applySort(ranked, query)
      : ranked;
  }

  return applySort(items, query);
}

function countFacet(
  items: Product[],
  pick: (p: Product) => string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const value of new Set(pick(item))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

const SIZE_ORDER = [
  "xs", "s", "m", "l", "xl", "xxl",
  "24", "26", "28", "30", "32", "34", "36", "38",
  "one size",
];

export function buildFacets(all: Product[], query: ProductQuery = {}): Facets {
  // Each facet is counted against the query with its OWN field relaxed, so
  // selecting a size does not zero out every other size's count.
  const relax = (field: keyof ProductQuery): Product[] =>
    resolveProducts(all, { ...query, [field]: undefined });

  const categoryCounts = countFacet(relax("categorySlugs"), (p) => p.categorySlugs);
  const sizeCounts = countFacet(relax("sizes"), (p) => p.sizes.map((s) => s.slug));
  const colorCounts = countFacet(relax("colors"), (p) => p.colors.map((c) => c.slug));

  const colorHex = new Map<string, string>();
  const colorName = new Map<string, string>();
  for (const p of all) {
    for (const c of p.colors) {
      if (!colorHex.has(c.slug)) {
        colorHex.set(c.slug, c.hex);
        colorName.set(c.slug, c.name);
      }
    }
  }

  const categoryFacets: FacetValue[] = categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      label: c.name,
      value: c.slug,
      count: categoryCounts.get(c.slug) ?? 0,
    }))
    .filter((f) => f.count > 0);

  const sizeFacets: FacetValue[] = [...sizeCounts.entries()]
    .map(([value, count]) => ({
      label: value === "one size" ? "One Size" : value.toUpperCase(),
      value,
      count,
    }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.value) - SIZE_ORDER.indexOf(b.value));

  const colorFacets: FacetValue[] = [...colorCounts.entries()]
    .map(([value, count]) => ({
      label: colorName.get(value) ?? value,
      value,
      count,
      hex: colorHex.get(value),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const prices = all.filter((p) => p.status === "active").map((p) => p.price);

  return {
    categories: categoryFacets,
    sizes: sizeFacets,
    colors: colorFacets,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
}

export function relatedProducts(
  all: Product[],
  slug: string,
  limit = 4,
): Product[] {
  const active = all.filter((p) => p.status === "active");
  const product = active.find((p) => p.slug === slug);
  if (!product) return [];

  return active
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      product: p,
      shared: p.categorySlugs.filter((c) => product.categorySlugs.includes(c)).length,
    }))
    .filter((r) => r.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        Math.abs(a.product.price - product.price) -
          Math.abs(b.product.price - product.price),
    )
    .slice(0, limit)
    .map((r) => r.product);
}

export function paginate<T>(items: T[], page = 1, perPage = DEFAULT_PER_PAGE) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const start = (safePage - 1) * safePerPage;
  const slice = items.slice(start, start + safePerPage);

  return {
    items: slice,
    total: items.length,
    page: safePage,
    perPage: safePerPage,
    hasMore: start + slice.length < items.length,
  };
}
