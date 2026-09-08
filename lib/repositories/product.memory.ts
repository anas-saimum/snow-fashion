import {
  buildFacets,
  DEFAULT_PER_PAGE,
  paginate,
  relatedProducts,
  resolveProducts,
} from "./catalogue-query";
import { memoryStore } from "./memory-store";
import type { Product } from "@/types";
import type { ProductQuery, ProductRepository } from "./product.repository";

/**
 * Storefront reads backed by the in-memory store, so changes made in the
 * admin show up on the site immediately during local development.
 */
export const memoryProductRepository: ProductRepository = {
  async list(query: ProductQuery = {}) {
    const all = resolveProducts(memoryStore.all(), query);
    return paginate(all, query.page ?? 1, query.perPage ?? DEFAULT_PER_PAGE);
  },

  async getBySlug(slug) {
    const product = memoryStore.bySlug(slug);
    return product && product.status === "active" ? product : null;
  },

  async getManyByIds(ids) {
    return ids
      .map((id) => memoryStore.byId(id))
      .filter((p): p is Product => Boolean(p) && p!.status === "active");
  },

  async getRelated(slug, limit = 4) {
    return relatedProducts(memoryStore.all(), slug, limit);
  },

  async getFacets(query: ProductQuery = {}) {
    return buildFacets(memoryStore.all(), query);
  },

  async getAllSlugs() {
    return memoryStore
      .all()
      .filter((p) => p.status === "active")
      .map((p) => p.slug);
  },
};
