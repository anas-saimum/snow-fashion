/**
 * Whether a Supabase backend is configured.
 *
 * The storefront must keep working without one — a fresh clone with no
 * credentials should still run — so every consumer checks this rather than
 * assuming the client can be built. See lib/repositories/index.ts for how the
 * three cases (configured / dev without config / production without config)
 * are handled.
 */

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Bucket created by supabase/migrations/0001_catalogue.sql. */
export const MEDIA_BUCKET = "product-media";

/** Throws with an actionable message rather than a cryptic client error. */
export function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see README → Admin dashboard).",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}
