import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const suggestions = [
  { label: "Shop all", href: "/shop" },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Women's fashion", href: "/category/womens-fashion" },
  { label: "Men's fashion", href: "/category/mens-fashion" },
  { label: "Contact us", href: "/contact" },
];

export default function NotFound() {
  return (
    <div className="u-container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="u-eyebrow">Error 404</p>

      <h1 className="mt-4 text-h1">This page has moved on</h1>

      <p className="mt-4 max-w-md text-caption leading-relaxed text-muted sm:text-body">
        The page you were looking for is not here. It may have been renamed, or
        the piece may no longer be in the collection.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/shop" size="lg">
          Shop the collection
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" size="lg">
          Back to home
        </ButtonLink>
      </div>

      <nav aria-label="Suggested pages" className="mt-14 border-t border-stone pt-8">
        <p className="u-eyebrow mb-4">Or try one of these</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {suggestions.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="u-link text-caption text-ink">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
