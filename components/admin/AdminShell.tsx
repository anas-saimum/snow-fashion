"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { PersistenceMode } from "@/lib/repositories/admin.repository";

const NAV = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/settings", label: "Brand & logo", Icon: ImageIcon },
];

interface AdminShellProps {
  mode: PersistenceMode;
  email?: string;
  children: ReactNode;
}

/**
 * Admin chrome: sidebar, mode banner, sign out.
 *
 * Denser and more utilitarian than the storefront on purpose — this is a
 * back office, and it should not be mistaken for a customer-facing page —
 * but built from the same tokens so it still looks like the same company.
 */
export function AdminShell({ mode, email, children }: AdminShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setNavOpen(false)}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 px-4 text-caption transition-colors",
            isActive(href)
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-canvas hover:text-ink",
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {mode === "memory" && (
        <p
          role="status"
          className="bg-sale px-4 py-2 text-center text-micro uppercase tracking-[0.12em] text-paper"
        >
          Demo mode — changes are kept in memory only and disappear when the
          dev server restarts. Connect Supabase to save properly.
        </p>
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone bg-paper px-4 py-3 lg:hidden">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close admin menu" : "Open admin menu"}
            className="flex size-10 items-center justify-center text-ink"
          >
            {navOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <aside
          className={cn(
            "shrink-0 border-stone bg-paper lg:w-60 lg:border-r",
            navOpen ? "block border-b" : "hidden lg:block",
          )}
        >
          <div className="hidden px-4 py-6 lg:block">
            <Logo size="sm" />
            <p className="u-eyebrow mt-2">Admin</p>
          </div>

          <div className="py-2 lg:py-0">{nav}</div>

          <div className="mt-2 flex flex-col gap-1 border-t border-stone py-2 lg:mt-6">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-3 px-4 text-caption text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
            >
              <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              View store
            </a>

            {mode === "supabase" && (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-caption text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                >
                  <LogOut className="size-4 shrink-0" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            )}
          </div>

          {email && (
            <p className="px-4 py-4 text-micro text-muted lg:mt-auto">
              Signed in as
              <br />
              <span className="text-ink-soft">{email}</span>
            </p>
          )}
        </aside>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
