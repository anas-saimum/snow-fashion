import { categories } from "@/data/categories";
import { paginate } from "./catalogue-query";
import { computeStats, resolveAdminProducts } from "./admin-query";
import { memoryStore } from "./memory-store";
import { productFromInput } from "./product-mapper";
import type { Product } from "@/types";
import type { AdminProductListQuery, ProductInput, SiteSettings } from "@/types/admin";
import type {
  AdminCategoryRepository,
  AdminProductRepository,
  AdminSettingsRepository,
} from "./admin.repository";

/**
 * Admin writes against the in-memory store. Development only — see
 * memory-store.ts for why, and lib/repositories/index.ts for where that is
 * enforced.
 */

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "p-" + Math.random().toString(36).slice(2, 12);
}

export const memoryAdminProductRepository: AdminProductRepository = {
  async list(query: AdminProductListQuery = {}) {
    const all = resolveAdminProducts(memoryStore.all(), query);
    return paginate(all, query.page ?? 1, query.perPage ?? 20);
  },

  async getById(id) {
    return memoryStore.byId(id) ?? null;
  },

  async create(input: ProductInput) {
    if (!(await this.isSlugAvailable(input.slug))) {
      throw new Error('A product with the URL "' + input.slug + '" already exists.');
    }
    const product = productFromInput(newId(), input);
    return memoryStore.insert(product);
  },

  async update(id, input: ProductInput) {
    const existing = memoryStore.byId(id);
    if (!existing) throw new Error("Product not found.");

    if (!(await this.isSlugAvailable(input.slug, id))) {
      throw new Error('A product with the URL "' + input.slug + '" already exists.');
    }

    return memoryStore.replace(id, productFromInput(id, input));
  },

  async remove(id) {
    memoryStore.remove(id);
  },

  async setStatus(id, status: Product["status"]) {
    const existing = memoryStore.byId(id);
    if (!existing) throw new Error("Product not found.");
    memoryStore.replace(id, { ...existing, status });
  },

  async isSlugAvailable(slug, exceptId) {
    const match = memoryStore.bySlug(slug);
    return !match || match.id === exceptId;
  },

  async stats() {
    return computeStats(memoryStore.all());
  },
};

export const memoryAdminCategoryRepository: AdminCategoryRepository = {
  async list() {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },
};

export const memoryAdminSettingsRepository: AdminSettingsRepository = {
  async get() {
    return memoryStore.settings();
  },
  async update(settings: SiteSettings) {
    return memoryStore.updateSettings(settings);
  },
};
