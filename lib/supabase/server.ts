import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseConfig } from "./config";

/**
 * Supabase client for Server Components, Server Actions and route handlers.
 *
 * Reads the session from cookies. The cookie writes are wrapped in try/catch
 * because Server Components are not allowed to set cookies — in that context
 * the middleware has already refreshed the session, so silently ignoring the
 * write is correct rather than a swallowed bug.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware owns the refresh.
        }
      },
    },
  });
}
