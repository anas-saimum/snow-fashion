"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildSearchString, SORT_OPTIONS } from "@/lib/url-state";

/**
 * Native select on purpose: it is keyboard accessible, screen-reader correct
 * and renders as the platform picker on mobile, which beats any custom
 * dropdown for a shopping list.
 */
export function SortDropdown() {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = params.get("sort") ?? "featured";

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        className="u-eyebrow hidden shrink-0 text-muted sm:block"
      >
        Sort
      </label>

      <div className="relative">
        <select
          id={id}
          value={current}
          onChange={(event) =>
            router.push(
              pathname +
                buildSearchString(params, {
                  sort: event.target.value === "featured" ? null : event.target.value,
                }),
              { scroll: false },
            )
          }
          className="h-11 appearance-none border border-stone-dark bg-paper pl-4 pr-10 text-caption text-ink transition-colors hover:border-ink focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-ink stroke-[1.5]"
        >
          <path d="M1 1l5 5 5-5" strokeLinecap="square" />
        </svg>
      </div>
    </div>
  );
}
