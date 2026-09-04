import type { Facets, Money, Paginated, Product, SortOption } from "@/types";

/**
 * THE SWAP SEAM.
 *
 * Every read of product data in the app goes through this interface. It is
 * async by design even though the demo implementation is synchronous, so
 * moving to Postgres / Supabase / Shopify / a REST API is an implementation
 * change with no call-site churn.
 */

export interface ProductQuery {
  categorySlugs?: string[];
  sizes?: string[];
  colors?: string[];
  minPrice?: Money;
  maxPrice?: Money;
  search?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
  flags?: {
    newArrival?: boolean;
    bestseller?: boolean;
    featured?: boolean;
    onSale?: boolean;
  };
}

export interface ProductRepository {
  list(query?: ProductQuery): Promise<Paginated<Product>>;
  getBySlug(slug: string): Promise<Product | null>;
  getManyByIds(ids: string[]): Promise<Product[]>;
  getRelated(slug: string, limit?: number): Promise<Product[]>;
  /** Filter counts for the current query, with the facet's own field relaxed. */
  getFacets(query?: ProductQuery): Promise<Facets>;
  /** Every slug, for generateStaticParams and the sitemap. */
  getAllSlugs(): Promise<string[]>;
}
