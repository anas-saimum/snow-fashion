"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { buildSearchString, toggleInCsv, type ActiveFilter } from "@/lib/url-state";

const CSV_KEYS = new Set(["category", "size", "color"]);

/** Removable chips for everything currently narrowing the grid. */
export function ActiveFilterChips({ filters }: { filters: ActiveFilter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (filters.length === 0) return null;

  const removeOne = (filter: ActiveFilter) => {
    const changes: Record<string, string | null> = CSV_KEYS.has(filter.key)
      ? { [filter.key]: toggleInCsv(params.get(filter.key), filter.value) }
      : { [filter.key]: null };

    router.push(pathname + buildSearchString(params, changes), { scroll: false });
  };

  const clearAll = () => {
    const next = new URLSearchParams(params.toString());
    for (const key of ["category", "size", "color", "min", "max", "filter", "show"]) {
      next.delete(key);
    }
    const qs = next.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {filters.map((filter) => (
        <li key={filter.key + ":" + filter.value}>
          <button
            type="button"
            onClick={() => removeOne(filter)}
            className="inline-flex min-h-9 items-center gap-2 border border-stone bg-canvas px-3 text-micro text-ink transition-colors hover:border-ink"
          >
            {filter.label}
            <X className="size-3" aria-hidden="true" />
            <span className="sr-only">{" — remove filter"}</span>
          </button>
        </li>
      ))}

      <li>
        <button
          type="button"
          onClick={clearAll}
          className="u-link min-h-9 px-1 text-micro font-medium uppercase tracking-[0.1em] text-muted hover:text-ink"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
