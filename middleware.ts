import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { categorySlugs } from "@/data/category-slugs";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Two unrelated jobs, both of which have to happen before rendering starts.
 *
 * 1. Hard 404 for unknown category URLs. The category page has to read
 *    searchParams (filters live in the URL), which makes the route dynamic —
 *    and by the time notFound() runs the response has already begun streaming
 *    as a 200. That is a "soft 404": 404 content served with a success status,
 *    which search engines treat as a thin duplicate rather than a dead page.
 *
 * 2. Refresh the Supabase session cookie and keep unauthenticated visitors
 *    out of /admin. Authentication only — whether the signed-in user is
 *    actually an admin is checked in the admin layout against the `admins`
 *    table, so a stolen session still cannot edit anything.
 */

function guardCategory(request: NextRequest): NextResponse | null {
  const slug = request.nextUrl.pathname.split("/")[2];

  if (slug && !categorySlugs.includes(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  return null;
}

async function guardAdmin(request: NextRequest): Promise<NextResponse> {
  // Without a backend there is no session to check. The admin layout refuses
  // to load in production, and in development it runs in a clearly labelled
  // in-memory demo mode.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() revalidates against Supabase rather than trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const login = new URL("/admin/login", request.url);
    // Remember where they were headed so login can return them there.
    if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return guardAdmin(request);
  }

  if (pathname.startsWith("/category/")) {
    return guardCategory(request) ?? NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/category/:slug", "/admin/:path*"],
};
