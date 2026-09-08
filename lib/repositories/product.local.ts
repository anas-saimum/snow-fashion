import { products } from "@/data/products";
import {
  buildFacets,
  DEFAULT_PER_PAGE,
  paginate,
  relatedProducts,
  resolveProducts,
} from "./catalogue-query";
import type { Product } from "@/types";
import type { ProductQuery, ProductRepository } from "./product.repository";

/**
 * Read-only repository over the local demo catalogue.
 *
 * This is what runs when no backend is configured, so a fresh clone still has
 * a working storefront. All the logic lives in catalogue-query.ts, shared with
 * the in-memory admin repository.
 */
export const localProductRepository: ProductRepository = {
  async list(query: ProductQuery = {}) {
    const all = resolveProducts(products, query);
    return paginate(all, query.page ?? 1, query.perPage ?? DEFAULT_PER_PAGE);
  },

  async getBySlug(slug) {
    return (
      products.find((p) => p.slug === slug && p.status === "active") ?? null
    );
  },

  async getManyByIds(ids) {
    // Preserve the caller's ordering (wishlist order, collection order).
    return ids
      .map((id) => products.find((p) => p.id === id && p.status === "active"))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelated(slug, limit = 4) {
    return relatedProducts(products, slug, limit);
  },

  async getFacets(query: ProductQuery = {}) {
    return buildFacets(products, query);
  },

  async getAllSlugs() {
    return products.filter((p) => p.status === "active").map((p) => p.slug);
  },
};
