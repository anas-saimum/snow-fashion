import { describe, expect, it } from "vitest";
import {
  buildSearchString,
  describeActiveFilters,
  parseProductQuery,
  toggleInCsv,
  PAGE_SIZE,
} from "@/lib/url-state";

describe("parseProductQuery", () => {
  it("splits comma-separated facets and lowercases them", () => {
    const query = parseProductQuery({ category: "Dresses,Tops", size: "M,L" });
    expect(query.categorySlugs).toEqual(["dresses", "tops"]);
    expect(query.sizes).toEqual(["m", "l"]);
  });

  it("converts dollar params into minor units", () => {
    const query = parseProductQuery({ min: "50", max: "299.99" });
    expect(query.minPrice).toBe(5000);
    expect(query.maxPrice).toBe(29999);
  });

  it("ignores malformed and negative prices", () => {
    const query = parseProductQuery({ min: "abc", max: "-10" });
    expect(query.minPrice).toBeUndefined();
    expect(query.maxPrice).toBeUndefined();
  });

  it("falls back to featured for an unknown sort", () => {
    expect(parseProductQuery({ sort: "cheapest-ever" }).sort).toBe("featured");
    expect(parseProductQuery({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("rounds `show` up to a whole page and caps it", () => {
    expect(parseProductQuery({}).perPage).toBe(PAGE_SIZE);
    expect(parseProductQuery({ show: "13" }).perPage).toBe(PAGE_SIZE * 2);
    expect(parseProductQuery({ show: "99999" }).perPage).toBe(120);
    expect(parseProductQuery({ show: "-5" }).perPage).toBe(PAGE_SIZE);
  });

  it("maps the filter shorthand onto flags", () => {
    expect(parseProductQuery({ filter: "new" }).flags).toEqual({ newArrival: true });
    expect(parseProductQuery({ filter: "sale" }).flags).toEqual({ onSale: true });
    expect(parseProductQuery({}).flags).toBeUndefined();
  });

  it("trims an empty search to undefined", () => {
    expect(parseProductQuery({ q: "  " }).search).toBeUndefined();
    expect(parseProductQuery({ q: " dress " }).search).toBe("dress");
  });
});

describe("buildSearchString", () => {
  it("sets and removes params", () => {
    const params = new URLSearchParams("category=dresses&sort=newest");
    expect(buildSearchString(params, { sort: null })).toBe("?category=dresses");
    expect(buildSearchString(params, { color: "black" })).toContain("color=black");
  });

  it("drops `show` whenever a filter changes", () => {
    const params = new URLSearchParams("show=24&category=tops");
    expect(buildSearchString(params, { color: "black" })).not.toContain("show");
  });

  it("keeps `show` when `show` is the change", () => {
    const params = new URLSearchParams("category=tops");
    expect(buildSearchString(params, { show: "24" })).toContain("show=24");
  });

  it("returns an empty string when nothing is left", () => {
    expect(buildSearchString(new URLSearchParams("sort=newest"), { sort: null })).toBe("");
  });
});

describe("toggleInCsv", () => {
  it("adds, removes and clears", () => {
    expect(toggleInCsv(null, "m")).toBe("m");
    expect(toggleInCsv("m", "l")).toBe("m,l");
    expect(toggleInCsv("m,l", "m")).toBe("l");
    expect(toggleInCsv("m", "m")).toBeNull();
  });
});

describe("describeActiveFilters", () => {
  it("labels every active filter", () => {
    const filters = describeActiveFilters(
      { category: "dresses", size: "m", color: "black", min: "50", filter: "sale" },
      {
        category: new Map([["dresses", "Dresses"]]),
        color: new Map([["black", "Black"]]),
      },
    );

    expect(filters.map((f) => f.label)).toEqual([
      "Dresses",
      "Size M",
      "Black",
      "Min $50",
      "On sale",
    ]);
  });

  it("returns nothing when no filters are set", () => {
    expect(describeActiveFilters({})).toHaveLength(0);
  });
});
