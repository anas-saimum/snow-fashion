import { resolveSiteUrl } from "./site-url";
import type { CurrencyCode } from "@/types";

/**
 * Everything a non-developer might want to change lives here or in /data.
 * No component should hard-code brand copy, handles or contact details.
 */
export const siteConfig = {
  name: "Snow Fashion",
  wordmark: "Snow Fashion",
  tagline: "Style That Defines You",
  description:
    "Snow Fashion is a modern fashion label offering stylish, high-quality clothing — designed for effortless style and everyday confidence.",
  /** Always a valid origin — see config/site-url.ts for why that matters. */
  url: resolveSiteUrl(),
  locale: "en-US",
  currency: "USD" as CurrencyCode,

  contact: {
    email: "hello@snowfashion.com",
    phone: "+1 (555) 014-2200",
    address: "24 Atelier Lane, Suite 3, New York, NY 10013",
    hours: "Monday – Saturday, 9:00 – 18:00",
  },

  social: {
    instagram: { handle: "@snowfashion", url: "https://instagram.com/snowfashion" },
    facebook: { handle: "Snow Fashion", url: "https://facebook.com/snowfashion" },
    tiktok: { handle: "@snowfashion", url: "https://tiktok.com/@snowfashion" },
  },

  features: {
    /**
     * Ratings in /data are DEMO placeholders for layout, not customer reviews.
     * Leave this on to preview the component; switch to false to ship a store
     * with no review UI until a real reviews provider is connected.
     */
    showRatings: true,
    /** Account/auth is not in scope for the MVP. */
    accountsEnabled: false,
  },
} as const;

export type SiteConfig = typeof siteConfig;
