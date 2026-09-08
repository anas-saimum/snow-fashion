import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortDropdown } from "@/components/shop/SortDropdown";
import { productRepository, categoryRepository } from "@/lib/repositories";
import { parseProductQuery, type RawSearchParams } from "@/lib/url-state";
import { pageMetadata } from "@/lib/seo";
import { pluralize } from "@/lib/utils";

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return pageMetadata({
    title: query ? 'Search results for "' + query + '"' : "Search",
    description: "Search the Snow Fashion collection by name, category or description.",
    path: "/search",
    // Search result pages are not index-worthy, but the products they link to are.
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const term = (typeof params.q === "string" ? params.q : "").trim();

  const query = { ...parseProductQuery(params), perPage: 60 };

  const [result, categories] = await Promise.all([
    term ? productRepository.list(query) : Promise.resolve(null),
    categoryRepository.getFeatured(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={term ? 'Search results for: "' + term + '"' : "Search"}
        description={
          result
            ? result.total +
              " " +
              pluralize(result.total, "product") +
              " found"
            : "Type in the search bar above to find a piece by name, category or colour."
        }
        trail={[
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        {!term ? (
          <div>
            <p className="u-eyebrow mb-5">Browse by category</p>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={"/category/" + category.slug}
                    className="inline-flex min-h-11 items-center border border-stone px-4 text-caption text-ink transition-colors hover:border-ink hover:bg-canvas"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : result && result.items.length > 0 ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone pb-5">
              <p className="text-caption text-muted tabular-nums">
                {result.total + " " + pluralize(result.total, "result")}
              </p>
              <SortDropdown />
            </div>

            <ProductGrid products={result.items} priorityCount={4} />
          </>
        ) : (
          <EmptyState
            icon={<SearchX className="size-6" aria-hidden="true" />}
            title={'No results for "' + term + '"'}
            description="Check the spelling, try a broader term, or browse the full collection."
            action={{ href: "/shop", label: "Shop all" }}
            secondaryAction={{ href: "/new-arrivals", label: "New arrivals" }}
          />
        )}
      </div>
    </>
  );
}
