"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { buildSearchString, toggleInCsv } from "@/lib/url-state";
import type { Facets } from "@/types";

interface FilterControlsProps {
  facets: Facets;
  /** Hide the category group on category pages, where it is fixed. */
  hideCategories?: boolean;
  onApplied?: () => void;
}

type FacetKey = "category" | "size" | "color";

type Selections = Record<FacetKey, string[]>;

function csvList(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The filter atoms. Rendered once, wrapped either by FilterSidebar (desktop)
 * or FilterDrawer (mobile) — there is no second copy of this logic.
 *
 * State lives in the URL so a filtered view is shareable and the back button
 * behaves. Because a URL round trip is not instant, the controls also hold an
 * optimistic copy: a tick or a highlight lands on the frame you click it, and
 * reverts on its own if the navigation fails.
 */
export function FilterControls({
  facets,
  hideCategories = false,
  onApplied,
}: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSelections = useMemo<Selections>(
    () => ({
      category: csvList(params.get("category")),
      size: csvList(params.get("size")),
      color: csvList(params.get("color")),
    }),
    [params],
  );

  const [selections, setSelections] = useOptimistic(urlSelections);

  const [minDraft, setMinDraft] = useState(params.get("min") ?? "");
  const [maxDraft, setMaxDraft] = useState(params.get("max") ?? "");

  const push = (changes: Record<string, string | null>, next?: Selections) => {
    startTransition(() => {
      if (next) setSelections(next);
      router.push(pathname + buildSearchString(params, changes), { scroll: false });
    });
  };

  const toggle = (key: FacetKey, value: string) => {
    const nextCsv = toggleInCsv(params.get(key), value);
    push({ [key]: nextCsv }, { ...selections, [key]: csvList(nextCsv) });
  };

  const isSelected = (key: FacetKey, value: string) =>
    selections[key].includes(value);

  const applyPrice = () => {
    push({ min: minDraft.trim() || null, max: maxDraft.trim() || null });
    onApplied?.();
  };

  const minFloor = Math.floor(facets.priceRange.min / 100);
  const maxCeil = Math.ceil(facets.priceRange.max / 100);

  return (
    <div
      aria-busy={isPending || undefined}
      className="flex flex-col divide-y divide-stone"
    >
      {!hideCategories && facets.categories.length > 0 && (
        <FilterGroup title="Category">
          <ul className="flex flex-col gap-3">
            {facets.categories.map((facet) => (
              <li key={facet.value}>
                <Checkbox
                  label={facet.label}
                  count={facet.count}
                  checked={isSelected("category", facet.value)}
                  onChange={() => toggle("category", facet.value)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="u-eyebrow mb-1.5 block text-muted">Min</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(minFloor)}
              value={minDraft}
              onChange={(event) => setMinDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && applyPrice()}
              className="h-11 w-full border border-stone-dark bg-paper px-3 text-caption tabular-nums focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            />
          </label>

          <span aria-hidden="true" className="pb-3.5 text-muted">
            –
          </span>

          <label className="flex-1">
            <span className="u-eyebrow mb-1.5 block text-muted">Max</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={String(maxCeil)}
              value={maxDraft}
              onChange={(event) => setMaxDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && applyPrice()}
              className="h-11 w-full border border-stone-dark bg-paper px-3 text-caption tabular-nums focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            />
          </label>
        </div>

        <Button variant="ghost" size="sm" onClick={applyPrice} className="mt-3">
          Apply price
        </Button>
      </FilterGroup>

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((facet) => {
              const selected = isSelected("size", facet.value);
              return (
                <button
                  key={facet.value}
                  type="button"
                  onClick={() => toggle("size", facet.value)}
                  aria-pressed={selected}
                  className={
                    "min-h-10 min-w-12 border px-3 text-micro font-medium uppercase tracking-[0.08em] transition-colors " +
                    (selected
                      ? "border-ink bg-ink text-paper"
                      : "border-stone-dark text-ink hover:border-ink")
                  }
                >
                  {facet.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour">
          <ul className="flex flex-col gap-3">
            {facets.colors.map((facet) => (
              <li key={facet.value}>
                <Checkbox
                  label={facet.label}
                  count={facet.count}
                  swatch={facet.hex}
                  checked={isSelected("color", facet.value)}
                  onChange={() => toggle("color", facet.value)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="py-6 first:pt-0 last:pb-0">
      <legend className="u-eyebrow mb-4 text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}
