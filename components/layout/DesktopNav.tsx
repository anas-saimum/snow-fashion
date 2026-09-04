"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

/**
 * Primary desktop navigation with one hover/focus dropdown for Collections.
 * The dropdown opens on hover for mice and on focus-within for keyboards, so
 * it is reachable without a click.
 */
export function DesktopNav() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-8">
        {mainNav.map((link) => {
          const active = isActive(link.href);
          const hasChildren = Boolean(link.children?.length);

          return (
            <li
              key={link.href}
              className="relative"
              onMouseEnter={() => hasChildren && setOpenLabel(link.label)}
              onMouseLeave={() => hasChildren && setOpenLabel(null)}
              onFocus={() => hasChildren && setOpenLabel(link.label)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setOpenLabel(null);
                }
              }}
            >
              <Link
                href={link.href}
                aria-expanded={hasChildren ? openLabel === link.label : undefined}
                className={cn(
                  "flex items-center gap-1 py-2 text-micro font-medium uppercase tracking-[0.14em] transition-colors",
                  active ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                <span className={cn("u-link", active && "after:scale-x-100")}>
                  {link.label}
                </span>
                {hasChildren && (
                  <ChevronDown className="size-3" aria-hidden="true" />
                )}
              </Link>

              {hasChildren && openLabel === link.label && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                  <ul className="min-w-56 border border-stone bg-paper py-2 shadow-raise animate-fade-in">
                    {link.children?.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-5 py-2.5 text-caption text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
