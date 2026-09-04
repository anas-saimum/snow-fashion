"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Instagram, Mail, User } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { mainNav } from "@/data/navigation";
import { siteConfig } from "@/config/site.config";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation as a full side sheet — not a shrunken desktop menu.
 * Large touch targets, secondary account/wishlist links grouped at the
 * bottom, and it closes itself on navigation.
 */
export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const toggle = useUIStore((s) => s.toggleMobileNav);
  const pathname = usePathname();

  useEffect(() => {
    toggle(false);
  }, [pathname, toggle]);

  return (
    <Drawer open={open} onClose={() => toggle(false)} title="Menu" side="left">
      <nav aria-label="Mobile" className="flex flex-col">
        <ul className="divide-y divide-stone">
          {mainNav.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-14 items-center px-5 font-serif text-h3",
                    active ? "text-ink" : "text-ink-soft",
                  )}
                >
                  {link.label}
                </Link>

                {link.children && link.children.length > 0 && (
                  <ul className="pb-3">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="flex min-h-11 items-center px-5 pl-8 text-caption text-muted"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <ul className="mt-4 border-t border-stone">
          <li>
            <Link
              href="/wishlist"
              className="flex min-h-13 items-center gap-3 px-5 text-caption uppercase tracking-[0.12em] text-ink"
            >
              <Heart className="size-4" aria-hidden="true" />
              Wishlist
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="flex min-h-13 items-center gap-3 px-5 text-caption uppercase tracking-[0.12em] text-ink"
            >
              <Mail className="size-4" aria-hidden="true" />
              Contact
            </Link>
          </li>
          <li>
            <span className="flex min-h-13 items-center gap-3 px-5 text-caption uppercase tracking-[0.12em] text-muted">
              <User className="size-4" aria-hidden="true" />
              Account — coming soon
            </span>
          </li>
          <li>
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex min-h-13 items-center gap-3 px-5 text-caption uppercase tracking-[0.12em] text-ink"
            >
              <Instagram className="size-4" aria-hidden="true" />
              {siteConfig.social.instagram.handle}
            </a>
          </li>
        </ul>
      </nav>
    </Drawer>
  );
}
