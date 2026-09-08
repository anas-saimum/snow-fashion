"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Category } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Lowest stock first" },
];

const control =
  "h-11 border border-stone-dark bg-paper px-3 text-caption text-ink " +
  "focus:border-ink focus:outline-none focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-ink";

/**
 * Admin list filters. Like the storefront, state lives in the URL — so a
 * filtered view can be bookmarked, and the back button behaves.
 *
 * Search is debounced rather than submitted, because typing and waiting for
 * a page load is the wrong feel for a tool you use all day.
 */
export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(params.get("q") ?? "");
  const debounced = useDebounce(search, 300);

  const push = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    // Any filter change invalidates the page number.
    if (!("page" in changes)) next.delete("page");

    const qs = next.toString();
    startTransition(() => {
      router.replace(pathname + (qs ? "?" + qs : ""), { scroll: false });
    });
  };

  // Keep the URL in step with the debounced search box.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (debounced.trim() === current) return;
    push({ q: debounced.trim() || null });
    // push is recreated each render; the debounced value is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const activeCategory = params.get("category") ?? "";
  const activeStatus = params.get("status") ?? "all";
  const activeSort = params.get("sort") ?? "updated";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <label htmlFor="admin-product-search" className="sr-only">
          Search products by name, URL or SKU
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, URL or SKU"
          className={control + " w-full pl-9 pr-9"}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <label className="sr-only" htmlFor="admin-status">
        Filter by status
      </label>
      <select
        id="admin-status"
        value={activeStatus}
        onChange={(event) =>
          push({ status: event.target.value === "all" ? null : event.target.value })
        }
        className={control}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="admin-category">
        Filter by category
      </label>
      <select
        id="admin-category"
        value={activeCategory}
        onChange={(event) => push({ category: event.target.value || null })}
        className={control}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="admin-sort">
        Sort products
      </label>
      <select
        id="admin-sort"
        value={activeSort}
        onChange={(event) =>
          push({ sort: event.target.value === "updated" ? null : event.target.value })
        }
        className={control}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
