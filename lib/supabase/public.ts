import { createClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./config";

/**
 * Anonymous client for public catalogue reads.
 *
 * Deliberately does NOT touch cookies. Reading cookies would opt every
 * storefront page into dynamic rendering and make the results uncacheable —
 * the same trap that produced the soft-404 bug on category pages. The public
 * catalogue needs no session: RLS already restricts anonymous reads to active
 * products.
 */
let cached: ReturnType<typeof createClient> | null = null;

export function createSupabasePublicClient() {
  if (!cached) {
    const { url, anonKey } = requireSupabaseConfig();
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
