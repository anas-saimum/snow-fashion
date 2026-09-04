"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockScroll } from "@/hooks/useLockScroll";
import { useUIStore } from "@/store/ui";
import { formatMoneyCompact } from "@/lib/pricing";

export interface SearchSuggestion {
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  imageAlt: string;
  categoryName?: string;
}

const QUICK_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Women's Fashion", href: "/category/womens-fashion" },
  { label: "Men's Fashion", href: "/category/mens-fashion" },
  { label: "Accessories", href: "/category/accessories" },
];

/**
 * Header search. Suggestions come from /api/search so the search index stays
 * on the server and the catalogue is never shipped to the browser.
 */
export function SearchOverlay() {
  const open = useUIStore((s) => s.searchOpen);
  const close = useUIStore((s) => s.closeSearch);
  const router = useRouter();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 220);

  useLockScroll(open);
  useFocusTrap(panelRef, open, close);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    setQuery("");
    setResults([]);
  }, [open]);

  useEffect(() => {
    const term = debounced.trim();

    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch("/api/search?q=" + encodeURIComponent(term) + "&limit=6", {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { results: [] }))
      .then((data: { results?: SearchSuggestion[] }) => {
        setResults(data.results ?? []);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    close();
    router.push("/search?q=" + encodeURIComponent(term));
  };

  const showEmptyMessage =
    debounced.trim().length >= 2 && !loading && results.length === 0;

  return (
    <div className="fixed inset-0 z-70" role="presentation">
      <div
        className="absolute inset-0 bg-ink/40 animate-scrim-in"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        tabIndex={-1}
        className="relative max-h-[88dvh] overflow-y-auto bg-paper shadow-panel animate-slide-up"
      >
        <div className="u-container py-6 lg:py-8">
          <form onSubmit={submit} role="search" className="flex items-center gap-4">
            <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />

            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for products, categories or colours"
              autoComplete="off"
              className="h-12 flex-1 border-0 bg-transparent font-serif text-h3 text-ink placeholder:font-sans placeholder:text-body placeholder:text-muted focus:outline-none"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="shrink-0 p-2 text-ink transition-colors hover:text-accent"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-6 border-t border-stone pt-6">
            {query.trim().length < 2 && (
              <div>
                <p className="u-eyebrow mb-4">Popular right now</p>
                <ul className="flex flex-wrap gap-2">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="inline-flex min-h-10 items-center border border-stone px-4 text-caption text-ink transition-colors hover:border-ink hover:bg-canvas"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div aria-live="polite" aria-busy={loading}>
              {loading && query.trim().length >= 2 && (
                <p className="text-caption text-muted">Searching…</p>
              )}

              {showEmptyMessage && (
                <div>
                  <p className="text-caption text-ink">
                    {'No products match "' + debounced.trim() + '".'}
                  </p>
                  <p className="mt-2 text-caption text-muted">
                    Try a shorter term, or browse{" "}
                    <Link href="/shop" onClick={close} className="u-link text-ink">
                      the full collection
                    </Link>
                    .
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <>
                  <p className="u-eyebrow mb-4">Products</p>
                  <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {results.map((result) => (
                      <li key={result.slug}>
                        <Link
                          href={"/product/" + result.slug}
                          onClick={close}
                          className="group flex items-center gap-4 py-2"
                        >
                          <span className="relative size-16 shrink-0 overflow-hidden bg-canvas">
                            {result.image && (
                              <Image
                                src={result.image}
                                alt={result.imageAlt}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-caption font-medium text-ink group-hover:text-accent">
                              {result.name}
                            </span>
                            {result.categoryName && (
                              <span className="mt-0.5 block text-micro text-muted">
                                {result.categoryName}
                              </span>
                            )}
                          </span>

                          <span className="shrink-0 text-caption tabular-nums text-ink">
                            {formatMoneyCompact(result.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={"/search?q=" + encodeURIComponent(debounced.trim())}
                    onClick={close}
                    className="group mt-6 inline-flex items-center gap-2 text-micro font-medium uppercase tracking-[0.12em] text-ink"
                  >
                    <span className="u-link">See all results</span>
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
