import { products as demoProducts } from "@/data/products";
import { categories as demoCategories } from "@/data/categories";
import { inputFromProduct } from "@/lib/repositories/product-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { inputToPayload } from "@/lib/repositories/supabase-mapper";

/**
 * Loads the demo catalogue into an empty Supabase project.
 *
 * A new project has no rows, which would leave the storefront looking broken —
 * every grid empty, every category page a dead end. This gives something real
 * to look at and to edit, and it exercises the whole write path end to end
 * before you trust it with your own photography.
 *
 * Guarded: it refuses when products already exist, so it can never overwrite
 * real work. Categories are upserted because the storefront's navigation
 * expects those slugs to exist regardless.
 */
export interface ImportResult {
  categories: number;
  products: number;
}

export async function importDemoCatalogue(): Promise<ImportResult> {
  const supabase = await createSupabaseServerClient();

  const { count, error: countFailed } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countFailed) {
    throw new Error("Could not check the catalogue: " + countFailed.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "The catalogue already has products. Importing would duplicate them, " +
        "so nothing was changed.",
    );
  }

  // Categories first: products reference them by slug.
  const categoryRows = demoCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description ?? null,
    image_url: category.image.url,
    image_alt: category.image.alt,
    parent_slug: null as string | null,
    featured: category.featured,
    sort_order: category.sortOrder,
  }));

  const { error: categoriesFailed } = await supabase
    .from("categories")
    .upsert(categoryRows, { onConflict: "slug" });

  if (categoriesFailed) {
    throw new Error("Could not import categories: " + categoriesFailed.message);
  }

  // Parent links are a second pass: the parent row has to exist first.
  for (const category of demoCategories) {
    if (!category.parentSlug) continue;
    const { error } = await supabase
      .from("categories")
      .update({ parent_slug: category.parentSlug })
      .eq("slug", category.slug);
    if (error) {
      throw new Error("Could not link categories: " + error.message);
    }
  }

  // Products one at a time, through the same atomic function the editor uses.
  let imported = 0;

  for (const product of demoProducts) {
    const { error } = await supabase.rpc("upsert_product", {
      payload: inputToPayload(inputFromProduct(product)),
    });

    if (error) {
      throw new Error(
        "Imported " +
          imported +
          " of " +
          demoProducts.length +
          ' products, then failed on "' +
          product.name +
          '": ' +
          error.message,
      );
    }

    imported += 1;
  }

  return { categories: categoryRows.length, products: imported };
}
