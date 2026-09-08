import { createSupabaseServerClient } from "@/lib/supabase/server";
import { paginate } from "./catalogue-query";
import { computeStats, resolveAdminProducts } from "./admin-query";
import {
  inputToPayload,
  PRODUCT_SELECT,
  rowToProduct,
} from "./supabase-mapper";
import type { Category, Product } from "@/types";
import type {
  AdminProductListQuery,
  ProductInput,
  SiteSettings,
} from "@/types/admin";
import type {
  AdminCategoryRepository,
  AdminProductRepository,
  AdminSettingsRepository,
} from "./admin.repository";

/**
 * Admin reads and writes against Supabase, using the request's session so
 * RLS applies. A non-admin session cannot read drafts or write anything, even
 * if it somehow reached this code.
 *
 * Admin reads are intentionally uncached: after saving a product you must see
 * what you saved, not a stale copy.
 */

async function loadAll(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Could not load products: " + error.message);
  return (data ?? []).map(rowToProduct);
}

export const supabaseAdminProductRepository: AdminProductRepository = {
  async list(query: AdminProductListQuery = {}) {
    const all = resolveAdminProducts(await loadAll(), query);
    return paginate(all, query.page ?? 1, query.perPage ?? 20);
  },

  async getById(id) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error("Could not load product: " + error.message);
    return data ? rowToProduct(data) : null;
  },

  async create(input: ProductInput) {
    return saveProduct(input);
  },

  async update(id, input: ProductInput) {
    return saveProduct(input, id);
  },

  async remove(id) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error("Could not delete product: " + error.message);
  },

  async setStatus(id, status) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error("Could not change status: " + error.message);
  },

  async isSlugAvailable(slug, exceptId) {
    const supabase = await createSupabaseServerClient();

    let query = supabase.from("products").select("id").eq("slug", slug);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.maybeSingle();
    if (error && error.code !== "PGRST116") {
      throw new Error("Could not check the URL: " + error.message);
    }
    return !data;
  },

  async stats() {
    return computeStats(await loadAll());
  },
};

/** One transaction, via the upsert_product RPC. See migration 0002. */
async function saveProduct(input: ProductInput, id?: string): Promise<Product> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("upsert_product", {
    payload: inputToPayload(input, id),
  });

  if (error) {
    // Surface the constraint the database rejected in words a shopkeeper can act on.
    if (error.message.includes("products_slug_key")) {
      throw new Error('A product with the URL "' + input.slug + '" already exists.');
    }
    if (error.message.includes("compare_at_above_price")) {
      throw new Error("The original price must be higher than the sale price.");
    }
    if (error.message.includes("product_variants_sku_key")) {
      throw new Error("One of the SKUs is already used by another product.");
    }
    throw new Error("Could not save the product: " + error.message);
  }

  const savedId = typeof data === "string" ? data : id;
  if (!savedId) throw new Error("The product was saved but no id came back.");

  const saved = await supabaseAdminProductRepository.getById(savedId);
  if (!saved) throw new Error("The product was saved but could not be re-read.");
  return saved;
}

export const supabaseAdminCategoryRepository: AdminCategoryRepository = {
  async list(): Promise<Category[]> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, image_url, image_alt, parent_slug, featured, sort_order")
      .order("sort_order");

    if (error) throw new Error("Could not load categories: " + error.message);

    return (data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      description: (row.description as string | null) ?? undefined,
      image: {
        id: (row.id as string) + "-img",
        url: (row.image_url as string | null) ?? "",
        alt: (row.image_alt as string | null) ?? (row.name as string),
        width: 900,
        height: 1200,
      },
      parentSlug: (row.parent_slug as string | null) ?? undefined,
      featured: Boolean(row.featured),
      sortOrder: Number(row.sort_order ?? 0),
    }));
  },
};

export const supabaseAdminSettingsRepository: AdminSettingsRepository = {
  async get() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("logo_url")
      .eq("id", true)
      .maybeSingle();

    return { logoUrl: (data?.logo_url as string | null) ?? undefined };
  },

  async update(settings: SiteSettings) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_url: settings.logoUrl ?? null })
      .eq("id", true);

    if (error) throw new Error("Could not save settings: " + error.message);
    return settings;
  },
};
