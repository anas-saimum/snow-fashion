import { FilterControls } from "./FilterControls";
import type { Facets } from "@/types";

/** Desktop filter rail. Sticky so it stays reachable down a long grid. */
export function FilterSidebar({
  facets,
  hideCategories,
}: {
  facets: Facets;
  hideCategories?: boolean;
}) {
  return (
    <aside
      aria-label="Product filters"
      className="hidden w-60 shrink-0 lg:block xl:w-64"
    >
      <div className="sticky top-32">
        <h2 className="u-eyebrow mb-5 border-b border-stone pb-4 text-ink">
          Filter
        </h2>
        <FilterControls facets={facets} hideCategories={hideCategories} />
      </div>
    </aside>
  );
}
