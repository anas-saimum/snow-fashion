import { isOnSale } from "@/lib/pricing";
import type { Product } from "@/types";
import type {
  AdminProductListQuery,
  AdminProductSummary,
  AdminStats,
} from "@/types/admin";

/**
 * Admin-side list and stats logic, as pure functions over products.
 *
 * Unlike the storefront engine in catalogue-query.ts, this deliberately
 * includes drafts and archived products, and sorts by things a shopkeeper
 * cares about — last edited, lowest stock — rather than merchandising order.
 */

export function summarise(product: Product): AdminProductSummary {
  const primary = product.images[0];
  const stocks = product.variants.map((v) => v.inventory);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    status: product.status,
    categorySlugs: product.categorySlugs,
    imageUrl: primary?.url,
    imageAlt: primary?.alt,
    inventory: product.inventory,
    variantCount: product.variants.length,
    lowestVariantStock: stocks.length ? Math.min(...stocks) : 0,
    updatedAt: product.publishedAt,
  };
}

function matches(product: Product, query: AdminProductListQuery): boolean {
  const { search, status, categorySlug, lowStockAtOrBelow } = query;

  if (status && status !== "all" && product.status !== status) return false;
  if (categorySlug && !product.categorySlugs.includes(categorySlug)) return false;

  if (lowStockAtOrBelow !== undefined) {
    const lowest = product.variants.length
      ? Math.min(...product.variants.map((v) => v.inventory))
      : 0;
    if (lowest > lowStockAtOrBelow) return false;
  }

  if (search?.trim()) {
    // Admin search is a plain substring over the fields you would actually
    // type: name, slug and SKU. Relevance ranking is unhelpful here — you are
    // looking for one known product, not browsing.
    const needle = search.trim().toLowerCase();
    const haystack = [
      product.name,
      product.slug,
      ...product.variants.map((v) => v.sku),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

export function resolveAdminProducts(
  all: Product[],
  query: AdminProductListQuery = {},
): AdminProductSummary[] {
  const filtered = all.filter((p) => matches(p, query));
  const summaries = filtered.map(summarise);

  switch (query.sort) {
    case "name":
      return summaries.sort((a, b) => a.name.localeCompare(b.name));
    case "price-asc":
      return summaries.sort((a, b) => a.price - b.price);
    case "price-desc":
      return summaries.sort((a, b) => b.price - a.price);
    case "stock-asc":
      return summaries.sort((a, b) => a.inventory - b.inventory);
    case "updated":
    default:
      return summaries.sort(
        (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
      );
  }
}

export const LOW_STOCK_THRESHOLD = 3;

export function computeStats(all: Product[]): AdminStats {
  const byStatus = (status: Product["status"]) =>
    all.filter((p) => p.status === status).length;

  const outOfStock = all.filter((p) => p.inventory === 0).length;

  const lowStock = all.filter(
    (p) =>
      p.inventory > 0 &&
      p.variants.some(
        (v) => v.inventory > 0 && v.inventory <= LOW_STOCK_THRESHOLD,
      ),
  ).length;

  const totalInventory = all.reduce((sum, p) => sum + p.inventory, 0);

  const inventoryValue = all.reduce(
    (sum, p) =>
      sum +
      p.variants.reduce((n, v) => n + v.inventory * (v.price ?? p.price), 0),
    0,
  );

  return {
    totalProducts: all.length,
    activeProducts: byStatus("active"),
    draftProducts: byStatus("draft"),
    archivedProducts: byStatus("archived"),
    outOfStockProducts: outOfStock,
    lowStockProducts: lowStock,
    onSaleProducts: all.filter((p) => isOnSale(p.price, p.compareAtPrice)).length,
    totalInventory,
    inventoryValue,
  };
}
