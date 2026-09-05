/**
 * Resolving the canonical site URL.
 *
 * This is load-bearing at build time: `metadataBase` in app/layout.tsx feeds
 * it to `new URL()`, and an invalid value fails the whole build with
 * "Failed to collect configuration for /_not-found". That is exactly what
 * happened on the first Vercel deploy — the env var existed but was empty,
 * and `??` only falls back on null/undefined, so `""` sailed through.
 *
 * So: treat blank as missing, accept a bare host (Vercel supplies
 * `VERCEL_URL` without a protocol), and never return something `new URL()`
 * would reject.
 */

export const FALLBACK_SITE_URL = "http://localhost:3000";

/** The env vars consulted, in order of preference. */
export const SITE_URL_ENV_KEYS = [
  // Explicitly configured — always wins.
  "NEXT_PUBLIC_SITE_URL",
  // Vercel's stable production domain, then the per-deployment URL.
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "NEXT_PUBLIC_VERCEL_URL",
  "VERCEL_URL",
] as const;

type EnvLike = Record<string, string | undefined>;

/**
 * Returns an origin with no trailing slash, e.g. "https://snowfashion.com".
 * Guaranteed to be parseable by `new URL()`.
 */
export function resolveSiteUrl(env: EnvLike = process.env): string {
  for (const key of SITE_URL_ENV_KEYS) {
    const value = env[key]?.trim();
    if (!value) continue;

    // VERCEL_URL and friends arrive as a bare host.
    const candidate = /^https?:\/\//i.test(value) ? value : "https://" + value;

    try {
      return new URL(candidate).origin;
    } catch {
      // Malformed value — try the next source rather than failing the build.
      continue;
    }
  }

  return FALLBACK_SITE_URL;
}
