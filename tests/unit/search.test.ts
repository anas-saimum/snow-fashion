import { describe, expect, it } from "vitest";
import { searchProducts, scoreProduct, suggestProducts } from "@/lib/search";
import { products } from "@/data/products";

describe("searchProducts", () => {
  it("finds a product by an exact name word", () => {
    const results = searchProducts(products, "corduroy");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain("corduroy");
  });

  it("ranks a name match above a description-only match", () => {
    const results = searchProducts(products, "gown");
    expect(results[0].name.toLowerCase()).toContain("gown");
  });

  it("searches by category name", () => {
    const results = searchProducts(products, "accessories");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((p) => p.categorySlugs.includes("accessories")),
    ).toBe(true);
  });

  it("searches by colour name", () => {
    const results = searchProducts(products, "burgundy");
    expect(
      results.some((p) => p.colors.some((c) => c.name === "Burgundy")),
    ).toBe(true);
  });

  it("searches descriptions", () => {
    const results = searchProducts(products, "selvedge");
    expect(results.length).toBeGreaterThan(0);
  });

  it("requires every term to land somewhere", () => {
    // "dress" matches plenty; "helicopter" matches nothing, so the pair must not.
    expect(searchProducts(products, "dress helicopter")).toHaveLength(0);
  });

  it("returns nothing for gibberish", () => {
    expect(searchProducts(products, "zzzzqqqq")).toHaveLength(0);
  });

  it("ignores empty and single-character queries", () => {
    expect(searchProducts(products, "")).toHaveLength(0);
    expect(searchProducts(products, "   ")).toHaveLength(0);
    expect(searchProducts(products, "a")).toHaveLength(0);
  });

  it("is case and punctuation insensitive", () => {
    const a = searchProducts(products, "Wool Overcoat");
    const b = searchProducts(products, "wool-overcoat!!");
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it("scores a non-match at zero", () => {
    const product = products[0];
    expect(scoreProduct(product, "zzzzqqqq")).toBe(0);
    expect(scoreProduct(product, "")).toBe(0);
  });

  it("caps suggestions at the requested limit", () => {
    expect(suggestProducts(products, "tee", 3).length).toBeLessThanOrEqual(3);
  });
});
