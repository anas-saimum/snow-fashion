import { NextResponse, type NextRequest } from "next/server";
import { categorySlugs } from "@/data/category-slugs";

/**
 * Hard 404 for unknown category URLs.
 *
 * The category page has to read searchParams (filters live in the URL), which
 * makes the route dynamic — and by the time notFound() runs, the response has
 * already begun streaming as a 200. That produces a "soft 404": 404 content
 * served with a success status, which search engines treat as a thin duplicate
 * page rather than a dead one.
 *
 * Matching the slug here, before rendering starts, gives a real 404 status
 * with the branded not-found page. The slug list is generated from the same
 * data the pages use, so the two cannot drift.
 */
export function middleware(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];

  if (slug && !categorySlugs.includes(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/category/:slug",
};
