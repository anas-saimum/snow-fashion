import { describe, expect, it } from "vitest";
import { FALLBACK_SITE_URL, resolveSiteUrl } from "@/config/site-url";

/**
 * These guard a build-breaking failure, not a cosmetic one: `metadataBase`
 * passes this value to `new URL()`, and an unparseable result fails the
 * production build with "Failed to collect configuration for /_not-found".
 */
describe("resolveSiteUrl", () => {
  it("always returns something new URL() accepts", () => {
    const envs = [
      {},
      { NEXT_PUBLIC_SITE_URL: "" },
      { NEXT_PUBLIC_SITE_URL: "   " },
      { NEXT_PUBLIC_SITE_URL: "not a url" },
      { NEXT_PUBLIC_SITE_URL: "https://snowfashion.com" },
      { VERCEL_URL: "snow-fashion.vercel.app" },
    ];

    for (const env of envs) {
      expect(() => new URL(resolveSiteUrl(env))).not.toThrow();
    }
  });

  it("treats an empty or blank variable as missing", () => {
    // The exact Vercel case: the variable exists but holds "".
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe(FALLBACK_SITE_URL);
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " })).toBe(FALLBACK_SITE_URL);
    expect(resolveSiteUrl({})).toBe(FALLBACK_SITE_URL);
  });

  it("falls back rather than propagating a malformed value", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toBe(
      FALLBACK_SITE_URL,
    );
  });

  it("adds a protocol to the bare host Vercel provides", () => {
    expect(resolveSiteUrl({ VERCEL_URL: "snow-fashion-abc.vercel.app" })).toBe(
      "https://snow-fashion-abc.vercel.app",
    );
  });

  it("normalises to an origin, dropping any trailing slash or path", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://snowfashion.com/" })).toBe(
      "https://snowfashion.com",
    );
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://snowfashion.com/shop?a=1" }),
    ).toBe("https://snowfashion.com");
  });

  it("prefers an explicit site URL over Vercel's deployment URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://snowfashion.com",
        VERCEL_URL: "snow-fashion-abc.vercel.app",
      }),
    ).toBe("https://snowfashion.com");
  });

  it("prefers the stable production domain over a per-deployment URL", () => {
    expect(
      resolveSiteUrl({
        VERCEL_PROJECT_PRODUCTION_URL: "snowfashion.com",
        VERCEL_URL: "snow-fashion-abc.vercel.app",
      }),
    ).toBe("https://snowfashion.com");
  });

  it("skips a blank preferred value and uses the next source", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "",
        VERCEL_URL: "snow-fashion-abc.vercel.app",
      }),
    ).toBe("https://snow-fashion-abc.vercel.app");
  });
});
