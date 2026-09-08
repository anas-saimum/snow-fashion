import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";

/**
 * Everything that wraps a shop page: skip link, header, main landmark,
 * footer, the global overlays and the site-level structured data.
 *
 * Extracted from the layout so app/not-found.tsx can use it too — the 404
 * page lives outside the (shop) route group (the middleware rewrites to
 * /_not-found for unknown categories) but should still look like the shop.
 */
export function StorefrontChrome({
  children,
  logoUrl,
}: {
  children: ReactNode;
  logoUrl?: string;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-90 focus:bg-ink focus:px-5 focus:py-3 focus:text-micro focus:uppercase focus:tracking-[0.12em] focus:text-paper"
      >
        Skip to content
      </a>

      <Header logoUrl={logoUrl} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer logoUrl={logoUrl} />

      <MobileNav />
      <CartDrawer />
      <SearchOverlay />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
    </>
  );
}
