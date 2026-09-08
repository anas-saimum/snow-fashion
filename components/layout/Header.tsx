"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";
import { DesktopNav } from "./DesktopNav";
import { HeaderActions } from "./HeaderActions";
import { Logo } from "./Logo";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

/**
 * Sticky header.
 *
 * Layout differs by breakpoint rather than being squeezed:
 *   mobile  — hamburger | wordmark | search + cart
 *   desktop — wordmark | nav | search + wishlist + cart + account
 */
export function Header({ logoUrl }: { logoUrl?: string }) {
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-60 bg-paper">
      <AnnouncementBar />

      <div
        className={cn(
          "border-b transition-colors duration-300",
          scrolled ? "border-stone" : "border-transparent",
        )}
      >
        <div className="u-container flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Left — hamburger on mobile, wordmark on desktop */}
          <div className="flex flex-1 items-center lg:flex-none">
            <button
              type="button"
              onClick={() => toggleMobileNav()}
              aria-label="Open menu"
              className="-ml-2 flex size-10 items-center justify-center text-ink transition-colors hover:text-accent lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <Logo className="hidden lg:block" size="md" logoUrl={logoUrl} />
          </div>

          {/* Centre — wordmark on mobile, nav on desktop */}
          <div className="flex items-center justify-center lg:flex-1">
            <Logo className="block lg:hidden" size="sm" logoUrl={logoUrl} />
            <DesktopNav />
          </div>

          {/* Right — actions */}
          <div className="flex flex-1 items-center justify-end lg:flex-none">
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
}
