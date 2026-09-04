import { SearchX } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { FilterDrawer } from "./FilterDrawer";
import { SortDropdown } from "./SortDropdown";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { LoadMoreButton } from "./LoadMoreButton";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { describeActiveFilters, type RawSearchParams } from "@/lib/url-state";
import { pluralize } from "@/lib/utils";
import type { Facets, Product } from "@/types";

interface ShopViewProps {
  products: Product[];
  total: number;
  facets: Facets;
  searchParams: RawSearchParams;
  /** Category pages fix the category, so its filter group is hidden. */
  hideCategories?: boolean;
}

/**
 * The listing surface shared by /shop and /category/[slug]. Both pages differ
 * only in which ProductQuery they hand in, so filtering, sorting and paging
 * exist in exactly one place.
 */
export function ShopView({
  products,
  total,
  facets,
  searchParams,
  hideCategories = false,
}: ShopViewProps) {
  const categoryLabels = new Map(facets.categories.map((f) => [f.value, f.label]));
  const colorLabels = new Map(facets.colors.map((f) => [f.value, f.label]));

  const activeFilters = describeActiveFilters(searchParams, {
    category: hideCategories ? new Map() : categoryLabels,
    color: colorLabels,
  }).filter((filter) => !(hideCategories && filter.key === "category"));

  return (
    <div className="u-container pb-20 pt-8 lg:pb-28">
      <div className="flex gap-10 xl:gap-14">
        <FilterSidebar facets={facets} hideCategories={hideCategories} />

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone pb-5">
            <p className="text-caption text-muted tabular-nums" aria-live="polite">
              {total + " " + pluralize(total, "product")}
            </p>

            <div className="flex items-center gap-3">
              <FilterDrawer
                facets={facets}
                hideCategories={hideCategories}
                activeCount={activeFilters.length}
              />
              <SortDropdown />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="pt-5">
              <ActiveFilterChips filters={activeFilters} />
            </div>
          )}

          {/* Results */}
          {products.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-6" aria-hidden="true" />}
              title="No products match those filters"
              description="Try removing a filter or widening your price range."
              action={{ href: "/shop", label: "Clear filters" }}
            />
          ) : (
            <>
              <div className="pt-8 lg:pt-10">
                <ProductGrid products={products} priorityCount={4} />
              </div>
              <LoadMoreButton shown={products.length} total={total} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
