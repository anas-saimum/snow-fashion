import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { searchProducts } from "@/lib/search";
import { isOnSale } from "@/lib/pricing";
import type { FacetValue, Facets, Paginated, Product } from "@/types";
import type { ProductQuery, ProductRepository } from "./product.repository";

const DEFAULT_PER_PAGE = 12;

function activeProducts(): Product[] {
  return products.filter((p) => p.status === "active");
}

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

function resolve(query: ProductQuery = {}): Product[] {
  const items = activeProducts().filter((p) => matchesFacets(p, query));

  if (query.search?.trim()) {
    // Search returns relevance order; an explicit sort overrides it.
    const ranked = searchProducts(items, query.search);
    return query.sort && query.sort !== "featured" ? applySort(ranked, query) : ranked;
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

export const localProductRepository: ProductRepository = {
  async list(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const all = resolve(query);
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(1, query.perPage ?? DEFAULT_PER_PAGE);
    const start = (page - 1) * perPage;
    const items = all.slice(start, start + perPage);

    return {
      items,
      total: all.length,
      page,
      perPage,
      hasMore: start + items.length < all.length,
    };
  },

  async getBySlug(slug) {
    return activeProducts().find((p) => p.slug === slug) ?? null;
  },

  async getManyByIds(ids) {
    const wanted = new Set(ids);
    // Preserve the caller's ordering (wishlist order, collection order).
    const found = activeProducts().filter((p) => wanted.has(p.id));
    return ids
      .map((id) => found.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelated(slug, limit = 4) {
    const product = await this.getBySlug(slug);
    if (!product) return [];

    const scored = activeProducts()
      .filter((p) => p.slug !== slug)
      .map((p) => ({
        product: p,
        shared: p.categorySlugs.filter((c) => product.categorySlugs.includes(c))
          .length,
      }))
      .filter((r) => r.shared > 0)
      .sort(
        (a, b) =>
          b.shared - a.shared ||
          Math.abs(a.product.price - product.price) -
            Math.abs(b.product.price - product.price),
      );

    return scored.slice(0, limit).map((r) => r.product);
  },

  async getFacets(query: ProductQuery = {}): Promise<Facets> {
    // Each facet is counted against the query with its OWN field relaxed, so
    // selecting a size does not zero out every other size's count.
    const relax = (field: keyof ProductQuery): Product[] => {
      const relaxed: ProductQuery = { ...query, [field]: undefined };
      return resolve(relaxed);
    };

    const categoryCounts = countFacet(relax("categorySlugs"), (p) => p.categorySlugs);
    const sizeCounts = countFacet(relax("sizes"), (p) => p.sizes.map((s) => s.slug));
    const colorCounts = countFacet(relax("colors"), (p) => p.colors.map((c) => c.slug));

    const colorHex = new Map<string, string>();
    const colorName = new Map<string, string>();
    for (const p of activeProducts()) {
      for (const c of p.colors) {
        if (!colorHex.has(c.slug)) {
          colorHex.set(c.slug, c.hex);
          colorName.set(c.slug, c.name);
        }
      }
    }

    const sizeOrder = [
      "xs", "s", "m", "l", "xl", "xxl",
      "24", "26", "28", "30", "32", "34", "36", "38",
      "one size",
    ];

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
      .sort((a, b) => sizeOrder.indexOf(a.value) - sizeOrder.indexOf(b.value));

    const colorFacets: FacetValue[] = [...colorCounts.entries()]
      .map(([value, count]) => ({
        label: colorName.get(value) ?? value,
        value,
        count,
        hex: colorHex.get(value),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const prices = activeProducts().map((p) => p.price);

    return {
      categories: categoryFacets,
      sizes: sizeFacets,
      colors: colorFacets,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    };
  },

  async getAllSlugs() {
    return activeProducts().map((p) => p.slug);
  },
};
