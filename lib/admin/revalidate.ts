import { revalidatePath, revalidateTag } from "next/cache";
import { PRODUCTS_CACHE_TAG } from "@/lib/repositories/product.supabase";

/**
 * Clears the storefront caches after a catalogue change.
 *
 * Without this, saving a product in the admin would leave the shop showing
 * the old price until the cache expired — the single most confusing thing an
 * admin panel can do. Called from every mutating action.
 */
export function revalidateStorefront(slug?: string) {
  // The cached Supabase catalogue query.
  revalidateTag(PRODUCTS_CACHE_TAG);

  // Prerendered pages that list or show products.
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/new-arrivals");
  revalidatePath("/collections");
  revalidatePath("/category/[slug]", "page");

  if (slug) revalidatePath("/product/" + slug);
  else revalidatePath("/product/[slug]", "page");

  // The sitemap lists every product URL.
  revalidatePath("/sitemap.xml");
}

/** The admin's own views, after a change. */
export function revalidateAdmin(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  if (id) revalidatePath("/admin/products/" + id);
}
