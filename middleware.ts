import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { categorySlugs } from "@/data/category-slugs";
import {
  ADMIN_SESSION_COOKIE,
  getLocalAuthConfig,
  verifySessionToken,
  type LocalAuthConfig,
} from "@/lib/admin/local-auth";
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
 * 2. Keep unauthenticated visitors out of /admin. With Supabase, this also
 *    refreshes the session cookie. Authentication only — whether the
 *    signed-in user is actually an admin is checked in the admin layout
 *    against the `admins` table, so a stolen session still cannot edit
 *    anything. Without Supabase, a login ID and password from the
 *    environment sign a cookie that is verified here.
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

/** Sends an anonymous visitor to the login page, remembering where they were headed. */
function redirectToLogin(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const login = new URL("/admin/login", request.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

async function guardWithSupabase(
  request: NextRequest,
  url: string,
  anonKey: string,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
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

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) return redirectToLogin(request);

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

async function guardWithCredentials(
  request: NextRequest,
  config: LocalAuthConfig,
): Promise<NextResponse> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(config, token);
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!session && !isLoginPage) {
    const response = redirectToLogin(request);
    // A cookie that failed verification is worthless; drop it.
    if (token) response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next({ request });
}

async function guardAdmin(request: NextRequest): Promise<NextResponse> {
  if (supabaseUrl && supabaseAnonKey) {
    return guardWithSupabase(request, supabaseUrl, supabaseAnonKey);
  }

  const local = getLocalAuthConfig();
  if (local) return guardWithCredentials(request, local);

  // No credentials of any kind. The admin layout refuses to load in
  // production, and in development it runs in a clearly labelled in-memory
  // demo mode.
  return NextResponse.next({ request });
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
