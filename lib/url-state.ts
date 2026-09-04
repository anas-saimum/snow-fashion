import type { SortOption } from "@/types";
import type { ProductQuery } from "@/lib/repositories";

/**
 * Filters live in the URL, not in React state. That makes every filtered view
 * shareable, back-button correct and server-renderable.
 *
 *   /shop?category=dresses,tops&size=m&color=black&min=50&max=300&sort=price-asc&show=24
 */

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

const VALID_SORTS = new Set(SORT_OPTIONS.map((o) => o.value));

export const PAGE_SIZE = 12;

/** Next 15 hands page components a plain object of string | string[]. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function csv(value: string | string[] | undefined): string[] | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

/** Dollars in the URL, cents in the domain. */
function money(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (raw === undefined || raw === "") return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed * 100);
}

export function parseProductQuery(params: RawSearchParams): ProductQuery {
  const sortRaw = first(params.sort) as SortOption | undefined;
  const showRaw = Number(first(params.show));
  const show =
    Number.isFinite(showRaw) && showRaw > 0
      ? Math.min(Math.ceil(showRaw / PAGE_SIZE) * PAGE_SIZE, 120)
      : PAGE_SIZE;

  const flags: NonNullable<ProductQuery["flags"]> = {};
  if (first(params.filter) === "new") flags.newArrival = true;
  if (first(params.filter) === "sale") flags.onSale = true;
  if (first(params.filter) === "bestseller") flags.bestseller = true;

  return {
    categorySlugs: csv(params.category),
    sizes: csv(params.size),
    colors: csv(params.color),
    minPrice: money(params.min),
    maxPrice: money(params.max),
    search: first(params.q)?.trim() || undefined,
    sort: sortRaw && VALID_SORTS.has(sortRaw) ? sortRaw : "featured",
    page: 1,
    perPage: show,
    flags: Object.keys(flags).length ? flags : undefined,
  };
}

/** Serialise a partial change onto the existing params. */
export function buildSearchString(
  current: URLSearchParams | RawSearchParams,
  changes: Record<string, string | string[] | null | undefined>,
): string {
  const next =
    current instanceof URLSearchParams
      ? new URLSearchParams(current.toString())
      : new URLSearchParams(
          Object.entries(current).flatMap(([key, value]) =>
            value === undefined
              ? []
              : Array.isArray(value)
                ? [[key, value.join(",")] as [string, string]]
                : [[key, value] as [string, string]],
          ),
        );

  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  }

  // Any filter change invalidates how many items were loaded.
  if (!("show" in changes)) next.delete("show");

  const str = next.toString();
  return str ? "?" + str : "";
}

export function toggleInCsv(
  currentValue: string | null,
  item: string,
): string | null {
  const items = new Set(
    (currentValue ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  if (items.has(item)) items.delete(item);
  else items.add(item);
  const next = [...items];
  return next.length ? next.join(",") : null;
}

/** Human-readable chips for the active filter bar. */
export interface ActiveFilter {
  key: "category" | "size" | "color" | "min" | "max" | "filter" | "q";
  value: string;
  label: string;
}

export function describeActiveFilters(
  params: RawSearchParams,
  labels: {
    category?: Map<string, string>;
    color?: Map<string, string>;
  } = {},
): ActiveFilter[] {
  const out: ActiveFilter[] = [];

  for (const value of csv(params.category) ?? []) {
    out.push({
      key: "category",
      value,
      label: labels.category?.get(value) ?? value,
    });
  }
  for (const value of csv(params.size) ?? []) {
    out.push({ key: "size", value, label: "Size " + value.toUpperCase() });
  }
  for (const value of csv(params.color) ?? []) {
    out.push({ key: "color", value, label: labels.color?.get(value) ?? value });
  }
  const min = first(params.min);
  if (min) out.push({ key: "min", value: min, label: "Min $" + min });
  const max = first(params.max);
  if (max) out.push({ key: "max", value: max, label: "Max $" + max });
  const filter = first(params.filter);
  if (filter) {
    const map: Record<string, string> = {
      new: "New arrivals",
      sale: "On sale",
      bestseller: "Best sellers",
    };
    out.push({ key: "filter", value: filter, label: map[filter] ?? filter });
  }

  return out;
}
