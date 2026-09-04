import { ShopView } from "./ShopView";
import { productRepository } from "@/lib/repositories";
import { parseProductQuery, type RawSearchParams } from "@/lib/url-state";
import type { ProductQuery } from "@/lib/repositories";

interface ShopResultsProps {
  searchParams: Promise<RawSearchParams>;
  /** Pins the listing to one category (category pages). */
  categorySlug?: string;
  /** Extra query constraints, e.g. the new-arrivals flag. */
  overrides?: Partial<ProductQuery>;
  hideCategories?: boolean;
}

/**
 * Awaiting `searchParams` is what makes a route dynamic. Doing it here — in a
 * component the page renders inside <Suspense> — keeps the page shell
 * statically prerenderable. Two things follow from that:
 *
 *  1. The page-level `dynamicParams = false` gate still applies, so an unknown
 *     category answers with a real 404 status instead of a soft 404.
 *  2. The masthead paints from the static shell while the grid streams in.
 */
export async function ShopResults({
  searchParams,
  categorySlug,
  overrides,
  hideCategories = false,
}: ShopResultsProps) {
  const params = await searchParams;

  const query: ProductQuery = {
    ...parseProductQuery(params),
    ...overrides,
    ...(categorySlug ? { categorySlugs: [categorySlug] } : {}),
  };

  const [result, facets] = await Promise.all([
    productRepository.list(query),
    productRepository.getFacets(query),
  ]);

  return (
    <ShopView
      products={result.items}
      total={result.total}
      facets={facets}
      searchParams={params}
      hideCategories={hideCategories}
    />
  );
}
