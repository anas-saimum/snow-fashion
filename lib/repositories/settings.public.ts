import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { memoryStore } from "./memory-store";
import type { SiteSettings } from "@/types/admin";

/** Tag revalidated when the admin saves brand settings. */
export const SETTINGS_CACHE_TAG = "site-settings";

/**
 * Storefront-side read of the editable brand settings (currently the logo).
 *
 * Uses the cookie-less public client so the shop layout stays statically
 * renderable — reading cookies here would make every page on the site dynamic,
 * which is the trap that produced the soft-404 bug on category pages.
 */
const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createSupabasePublicClient();

    // The client is untyped (no generated Database types), so name the row
    // shape here rather than letting it infer `never`.
    const { data, error } = await supabase
      .from("site_settings")
      .select("logo_url")
      .eq("id", true)
      .maybeSingle<{ logo_url: string | null }>();

    if (error) return {};
    return { logoUrl: data?.logo_url ?? undefined };
  },
  ["snow-fashion-site-settings"],
  { tags: [SETTINGS_CACHE_TAG], revalidate: 3600 },
);

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured) return loadSettings();

  // Development demo mode keeps them in memory; with no backend at all there
  // is nothing to read and the wordmark is used.
  if (process.env.NODE_ENV === "development") return memoryStore.settings();

  return {};
}
