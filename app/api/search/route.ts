import { NextResponse } from "next/server";
import { productRepository } from "@/lib/repositories";
import { categoryBySlug } from "@/data/categories";

/**
 * Search suggestions for the header overlay.
 *
 * Runs the search on the server so the catalogue never ships to the browser,
 * and returns only the fields the suggestion list renders.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 12) : 6;

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { items } = await productRepository.list({
    search: query,
    perPage: limit,
  });

  const results = items.map((product) => {
    const image = product.images[0];
    const categorySlug = product.categorySlugs[0];

    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: image?.url ?? "",
      imageAlt: image?.alt ?? product.name,
      categoryName: categorySlug
        ? (categoryBySlug.get(categorySlug)?.name ?? undefined)
        : undefined,
    };
  });

  return NextResponse.json({ results });
}
