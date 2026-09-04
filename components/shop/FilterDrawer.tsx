"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { FilterControls } from "./FilterControls";
import { useUIStore } from "@/store/ui";
import type { Facets } from "@/types";

interface FilterDrawerProps {
  facets: Facets;
  hideCategories?: boolean;
  activeCount: number;
}

/**
 * Mobile filters in a side sheet — the same FilterControls the desktop rail
 * uses, wrapped in different chrome. The trigger button lives here too so the
 * count badge and the panel can never disagree.
 */
export function FilterDrawer({
  facets,
  hideCategories,
  activeCount,
}: FilterDrawerProps) {
  const open = useUIStore((s) => s.filterOpen);
  const toggleFilters = useUIStore((s) => s.toggleFilters);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const clearAll = () => {
    const next = new URLSearchParams(params.toString());
    for (const key of ["category", "size", "color", "min", "max", "filter", "show"]) {
      next.delete(key);
    }
    const qs = next.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
    toggleFilters(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => toggleFilters(true)}
        className="inline-flex min-h-11 items-center gap-2 border border-stone-dark px-4 text-micro font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filter
        {activeCount > 0 && (
          <span className="ml-1 flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[0.625rem] leading-5 text-paper tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer
        open={open}
        onClose={() => toggleFilters(false)}
        title="Filter"
        side="left"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={clearAll} fullWidth>
              Clear all
            </Button>
            <Button onClick={() => toggleFilters(false)} fullWidth>
              Show results
            </Button>
          </div>
        }
      >
        <div className="px-5 py-5">
          <FilterControls
            facets={facets}
            hideCategories={hideCategories}
            onApplied={() => toggleFilters(false)}
          />
        </div>
      </Drawer>
    </>
  );
}
