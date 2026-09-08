import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
  buildFacets,
  DEFAULT_PER_PAGE,
  paginate,
  relatedProducts,
  resolveProducts,
} from "./catalogue-query";
import { PRODUCT_SELECT, rowToProduct } from "./supabase-mapper";
import type { Product } from "@/types";
import type { ProductQuery, ProductRepository } from "./product.repository";

/** Tag revalidated whenever the admin saves. See lib/admin/revalidate.ts. */
export const PRODUCTS_CACHE_TAG = "products";

/**
 * Storefront reads from Supabase.
 *
 * Design decision worth knowing: this fetches the active catalogue once
 * (cached, tag-invalidated on admin writes) and then filters, sorts and
 * facets it in memory with the same engine the demo repository uses.
 *
 * Why not filter in SQL? Because the filtering rules are non-trivial — parent
 * categories match their children, size and colour match only purchasable
 * variants, and facet counts relax their own field — and a second
 * implementation in SQL would drift from the tested one. For a catalogue of
 * tens to a few hundred products this is a single cached query and the
 * difference is unmeasurable.
 *
 * When the catalogue reaches thousands of products, push `resolveProducts`
 * into SQL — and hold the new implementation to tests/unit/repository.test.ts,
 * which describes the behaviour rather than the mechanism.
 */
const loadActiveCatalogue = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createSupabasePublicClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .order("published_at", { ascending: false });

    if (error) {
      throw new Error("Failed to load catalogue: " + error.message);
    }

    return (data ?? []).map(rowToProduct);
  },
  ["snow-fashion-active-catalogue"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 300 },
);

export const supabaseProductRepository: ProductRepository = {
  async list(query: ProductQuery = {}) {
    const all = await loadActiveCatalogue();
    const resolved = resolveProducts(all, query);
    return paginate(resolved, query.page ?? 1, query.perPage ?? DEFAULT_PER_PAGE);
  },

  async getBySlug(slug) {
    const all = await loadActiveCatalogue();
    return all.find((p) => p.slug === slug) ?? null;
  },

  async getManyByIds(ids) {
    const all = await loadActiveCatalogue();
    return ids
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  },

  async getRelated(slug, limit = 4) {
    return relatedProducts(await loadActiveCatalogue(), slug, limit);
  },

  async getFacets(query: ProductQuery = {}) {
    return buildFacets(await loadActiveCatalogue(), query);
  },

  async getAllSlugs() {
    const all = await loadActiveCatalogue();
    return all.map((p) => p.slug);
  },
};
