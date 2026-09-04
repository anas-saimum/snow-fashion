import { describe, expect, it } from "vitest";
import { localProductRepository as repo } from "@/lib/repositories/product.local";
import { products } from "@/data/products";

describe("catalogue integrity", () => {
  it("has unique slugs and ids", () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it("gives every product at least two images with alt text", () => {
    for (const product of products) {
      expect(product.images.length).toBeGreaterThanOrEqual(2);
      for (const image of product.images) {
        expect(image.alt.trim().length).toBeGreaterThan(8);
        expect(image.url.startsWith("/images/")).toBe(true);
      }
    }
  });

  it("never prices a product above its compare-at price", () => {
    for (const product of products) {
      if (product.compareAtPrice) {
        expect(product.compareAtPrice).toBeGreaterThan(product.price);
      }
    }
  });

  it("builds one variant per colour and size combination", () => {
    for (const product of products) {
      expect(product.variants.length).toBe(
        product.colors.length * product.sizes.length,
      );
      expect(new Set(product.variants.map((v) => v.id)).size).toBe(
        product.variants.length,
      );
    }
  });

  it("derives product inventory from its variants", () => {
    for (const product of products) {
      const sum = product.variants.reduce((n, v) => n + v.inventory, 0);
      expect(product.inventory).toBe(sum);
    }
  });
});

describe("list", () => {
  it("paginates without dropping or duplicating items", async () => {
    const first = await repo.list({ perPage: 10, page: 1 });
    const second = await repo.list({ perPage: 10, page: 2 });

    expect(first.items).toHaveLength(10);
    expect(first.hasMore).toBe(true);
    expect(first.total).toBe(second.total);

    const overlap = first.items.filter((a) =>
      second.items.some((b) => b.id === a.id),
    );
    expect(overlap).toHaveLength(0);
  });

  it("reports hasMore false on the final page", async () => {
    const all = await repo.list({ perPage: 500 });
    const last = await repo.list({ perPage: all.total });
    expect(last.hasMore).toBe(false);
  });

  it("sorts by price ascending and descending", async () => {
    const asc = await repo.list({ sort: "price-asc", perPage: 500 });
    const desc = await repo.list({ sort: "price-desc", perPage: 500 });

    const ascPrices = asc.items.map((p) => p.price);
    expect([...ascPrices].sort((a, b) => a - b)).toEqual(ascPrices);
    expect(desc.items[0].price).toBe(ascPrices[ascPrices.length - 1]);
  });

  it("sorts newest by publish date", async () => {
    const { items } = await repo.list({ sort: "newest", perPage: 500 });
    const dates = items.map((p) => Date.parse(p.publishedAt));
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
  });

  it("filters by category including child categories", async () => {
    const dresses = await repo.list({ categorySlugs: ["dresses"], perPage: 500 });
    expect(dresses.total).toBeGreaterThan(0);
    for (const product of dresses.items) {
      expect(product.categorySlugs).toContain("dresses");
    }

    // Dresses sits under Women's Fashion, so the parent must include them.
    const womens = await repo.list({
      categorySlugs: ["womens-fashion"],
      perPage: 500,
    });
    const womensIds = new Set(womens.items.map((p) => p.id));
    for (const dress of dresses.items) {
      expect(womensIds.has(dress.id)).toBe(true);
    }
  });

  it("filters by price range inclusively", async () => {
    const { items } = await repo.list({
      minPrice: 20000,
      maxPrice: 40000,
      perPage: 500,
    });
    expect(items.length).toBeGreaterThan(0);
    for (const product of items) {
      expect(product.price).toBeGreaterThanOrEqual(20000);
      expect(product.price).toBeLessThanOrEqual(40000);
    }
  });

  it("only returns sizes that are actually purchasable", async () => {
    const { items } = await repo.list({ sizes: ["xs"], perPage: 500 });
    for (const product of items) {
      const hasStock = product.variants.some(
        (v) => v.sizeSlug === "xs" && v.inventory > 0,
      );
      expect(hasStock).toBe(true);
    }
  });

  it("honours flag filters", async () => {
    const news = await repo.list({ flags: { newArrival: true }, perPage: 500 });
    expect(news.total).toBeGreaterThan(0);
    expect(news.items.every((p) => p.newArrival)).toBe(true);

    const sale = await repo.list({ flags: { onSale: true }, perPage: 500 });
    expect(sale.items.every((p) => Boolean(p.compareAtPrice))).toBe(true);
  });

  it("returns nothing for an unknown category rather than everything", async () => {
    const { total } = await repo.list({ categorySlugs: ["not-a-category"] });
    expect(total).toBe(0);
  });
});

describe("getBySlug / getManyByIds / getRelated", () => {
  it("finds a product by slug and misses cleanly", async () => {
    expect(await repo.getBySlug("aria-floral-wrap-dress")).not.toBeNull();
    expect(await repo.getBySlug("no-such-product")).toBeNull();
  });

  it("preserves the caller's id ordering", async () => {
    const ids = ["p-tapered-slim-jeans", "p-essential-crew-tee"];
    const found = await repo.getManyByIds(ids);
    expect(found.map((p) => p.id)).toEqual(ids);
  });

  it("ignores unknown ids", async () => {
    const found = await repo.getManyByIds(["p-essential-crew-tee", "p-nope"]);
    expect(found).toHaveLength(1);
  });

  it("returns related products sharing a category, excluding itself", async () => {
    const related = await repo.getRelated("aria-floral-wrap-dress", 4);
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(related.some((p) => p.slug === "aria-floral-wrap-dress")).toBe(false);
  });
});

describe("getFacets", () => {
  it("counts each facet with its own field relaxed", async () => {
    const facets = await repo.getFacets({ sizes: ["xs"] });
    // Relaxing "sizes" means other sizes still show non-zero counts.
    expect(facets.sizes.filter((f) => f.count > 0).length).toBeGreaterThan(1);
  });

  it("only lists categories that have products", async () => {
    const facets = await repo.getFacets();
    expect(facets.categories.every((f) => f.count > 0)).toBe(true);
  });

  it("returns a sane price range", async () => {
    const facets = await repo.getFacets();
    expect(facets.priceRange.min).toBeGreaterThan(0);
    expect(facets.priceRange.max).toBeGreaterThan(facets.priceRange.min);
  });

  it("attaches a hex value to every colour facet", async () => {
    const facets = await repo.getFacets();
    for (const facet of facets.colors) {
      expect(facet.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
