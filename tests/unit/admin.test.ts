import { beforeEach, describe, expect, it } from "vitest";
import {
  computeStats,
  LOW_STOCK_THRESHOLD,
  resolveAdminProducts,
  summarise,
} from "@/lib/repositories/admin-query";
import {
  buildVariantGrid,
  inputFromProduct,
  productFromInput,
} from "@/lib/repositories/product-mapper";
import { memoryStore } from "@/lib/repositories/memory-store";
import { memoryAdminProductRepository as repo } from "@/lib/repositories/admin.memory";
import {
  formatPriceInput,
  hasFieldErrors,
  parsePriceInput,
  slugify,
  validateProductInput,
} from "@/lib/admin/product-validation";
import { products } from "@/data/products";
import type { ProductInput } from "@/types/admin";

function validInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    slug: "test-piece",
    name: "Test Piece",
    shortDescription: "A short line.",
    description: "A longer description.",
    price: 12000,
    compareAtPrice: undefined,
    categorySlugs: ["dresses"],
    colors: [{ name: "Ivory", slug: "ivory", hex: "#EFE7DC" }],
    sizes: [
      { label: "S", slug: "s" },
      { label: "M", slug: "m" },
    ],
    images: [
      { url: "/images/products/x-1.jpg", alt: "A test photo", width: 1200, height: 1600 },
    ],
    variants: [
      { sku: "SF-TEST-IVO-S", colorSlug: "ivory", sizeSlug: "s", inventory: 4 },
      { sku: "SF-TEST-IVO-M", colorSlug: "ivory", sizeSlug: "m", inventory: 0 },
    ],
    materials: ["100% cotton"],
    careInstructions: ["Machine wash cold"],
    sizeGuideId: "womens-apparel",
    featured: false,
    bestseller: false,
    newArrival: true,
    status: "draft",
    publishedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("slugify", () => {
  it("produces a clean URL segment", () => {
    expect(slugify("Ivory Silk Wrap Dress")).toBe("ivory-silk-wrap-dress");
    expect(slugify("  Crimson  &  Tulle  ")).toBe("crimson-and-tulle");
    expect(slugify("Size 40 / Wide")).toBe("size-40-wide");
  });

  it("never leaves leading or trailing hyphens", () => {
    expect(slugify("!!! Hello !!!")).toBe("hello");
  });
});

describe("price inputs", () => {
  it("converts typed amounts to minor units", () => {
    expect(parsePriceInput("148")).toBe(14800);
    expect(parsePriceInput("148.50")).toBe(14850);
    expect(parsePriceInput("$1,480")).toBe(148000);
    expect(parsePriceInput("")).toBeUndefined();
    expect(parsePriceInput("abc")).toBeUndefined();
  });

  it("round-trips through the display format", () => {
    for (const minor of [14800, 14850, 999, 100000]) {
      expect(parsePriceInput(formatPriceInput(minor))).toBe(minor);
    }
  });

  it("shows whole amounts without decimals", () => {
    expect(formatPriceInput(14800)).toBe("148");
    expect(formatPriceInput(14850)).toBe("148.50");
    expect(formatPriceInput(undefined)).toBe("");
  });
});

describe("validateProductInput", () => {
  it("accepts a complete product", () => {
    expect(validateProductInput(validInput())).toEqual({});
  });

  it("requires the basics", () => {
    const errors = validateProductInput(
      validInput({
        name: "",
        shortDescription: "",
        price: 0,
        categorySlugs: [],
        images: [],
        variants: [],
      }),
    );

    expect(Object.keys(errors).sort()).toEqual(
      ["categorySlugs", "images", "name", "price", "shortDescription", "variants"].sort(),
    );
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it("rejects a slug that is not URL-safe", () => {
    expect(validateProductInput(validInput({ slug: "Not A Slug" })).slug).toBeTruthy();
    expect(validateProductInput(validInput({ slug: "trailing-" })).slug).toBeTruthy();
    expect(validateProductInput(validInput({ slug: "ok-slug-2" })).slug).toBeUndefined();
  });

  it("insists a discount is actually a discount", () => {
    expect(
      validateProductInput(validInput({ price: 12000, compareAtPrice: 10000 }))
        .compareAtPrice,
    ).toMatch(/higher/i);

    expect(
      validateProductInput(validInput({ price: 12000, compareAtPrice: 12000 }))
        .compareAtPrice,
    ).toBeTruthy();

    expect(
      validateProductInput(validInput({ price: 12000, compareAtPrice: 15000 }))
        .compareAtPrice,
    ).toBeUndefined();
  });

  it("requires alt text on every image, naming which one", () => {
    const errors = validateProductInput(
      validInput({
        images: [
          { url: "/a.jpg", alt: "Fine", width: 1200, height: 1600 },
          { url: "/b.jpg", alt: "   ", width: 1200, height: 1600 },
        ],
      }),
    );
    expect(errors.images).toContain("Image 2");
  });

  it("rejects duplicate SKUs and negative stock", () => {
    expect(
      validateProductInput(
        validInput({
          variants: [
            { sku: "SAME", colorSlug: "ivory", sizeSlug: "s", inventory: 1 },
            { sku: "SAME", colorSlug: "ivory", sizeSlug: "m", inventory: 1 },
          ],
        }),
      ).variants,
    ).toMatch(/same SKU/i);

    expect(
      validateProductInput(
        validInput({
          variants: [
            { sku: "A", colorSlug: "ivory", sizeSlug: "s", inventory: -1 },
          ],
        }),
      ).variants,
    ).toMatch(/negative/i);
  });

  it("rejects a colour without a valid swatch", () => {
    expect(
      validateProductInput(
        validInput({ colors: [{ name: "Bad", slug: "bad", hex: "red" }] }),
      ).colors,
    ).toBeTruthy();
  });
});

describe("productFromInput", () => {
  it("derives inventory from the variants, never storing it separately", () => {
    const product = productFromInput("p-1", validInput());
    expect(product.inventory).toBe(4);
    expect(product.inventory).toBe(
      product.variants.reduce((n, v) => n + v.inventory, 0),
    );
  });

  it("never accepts a hand-typed rating", () => {
    const product = productFromInput("p-1", validInput());
    expect(product.rating).toBeUndefined();
    expect(product.reviewCount).toBeUndefined();
  });

  it("drops empty material and care lists rather than storing []", () => {
    const product = productFromInput(
      "p-1",
      validInput({ materials: [], careInstructions: [] }),
    );
    expect(product.materials).toBeUndefined();
    expect(product.careInstructions).toBeUndefined();
  });

  it("round-trips an existing product through the editor shape", () => {
    const original = products[0];
    const rebuilt = productFromInput(original.id, inputFromProduct(original));

    expect(rebuilt.slug).toBe(original.slug);
    expect(rebuilt.price).toBe(original.price);
    expect(rebuilt.inventory).toBe(original.inventory);
    expect(rebuilt.variants).toHaveLength(original.variants.length);
    expect(rebuilt.images.map((i) => i.alt)).toEqual(
      original.images.map((i) => i.alt),
    );
  });
});

describe("buildVariantGrid", () => {
  it("produces one row per colour and size", () => {
    const grid = buildVariantGrid("test", ["ivory", "ink"], ["s", "m", "l"]);
    expect(grid).toHaveLength(6);
  });

  it("preserves stock and SKUs when another colour is added", () => {
    const first = buildVariantGrid("test", ["ivory"], ["s", "m"]);
    first[0].inventory = 9;
    first[0].sku = "CUSTOM-SKU";

    const second = buildVariantGrid("test", ["ivory", "ink"], ["s", "m"], first);

    const kept = second.find((v) => v.colorSlug === "ivory" && v.sizeSlug === "s");
    expect(kept?.inventory).toBe(9);
    expect(kept?.sku).toBe("CUSTOM-SKU");

    // The new colour starts empty rather than inheriting someone else's stock.
    const added = second.find((v) => v.colorSlug === "ink" && v.sizeSlug === "s");
    expect(added?.inventory).toBe(0);
  });

  it("handles a product with no options at all", () => {
    const grid = buildVariantGrid("test", [], []);
    expect(grid).toHaveLength(1);
    expect(grid[0].colorSlug).toBeUndefined();
    expect(grid[0].sizeSlug).toBeUndefined();
  });

  it("generates distinct SKUs", () => {
    const grid = buildVariantGrid("aria-floral", ["ivory", "ink"], ["s", "m"]);
    expect(new Set(grid.map((v) => v.sku)).size).toBe(grid.length);
  });
});

describe("admin list and stats", () => {
  it("summarises a product for the table", () => {
    const summary = summarise(products[0]);
    expect(summary.variantCount).toBe(products[0].variants.length);
    expect(summary.lowestVariantStock).toBe(
      Math.min(...products[0].variants.map((v) => v.inventory)),
    );
  });

  it("includes drafts, unlike the storefront", () => {
    const drafted = [{ ...products[0], status: "draft" as const }, products[1]];
    expect(resolveAdminProducts(drafted, { status: "all" })).toHaveLength(2);
    expect(resolveAdminProducts(drafted, { status: "draft" })).toHaveLength(1);
  });

  it("searches name, slug and SKU", () => {
    const target = products[0];
    expect(resolveAdminProducts(products, { search: target.name }).length).toBeGreaterThan(0);
    expect(resolveAdminProducts(products, { search: target.slug }).length).toBeGreaterThan(0);
    expect(
      resolveAdminProducts(products, { search: target.variants[0].sku }).length,
    ).toBeGreaterThan(0);
    expect(resolveAdminProducts(products, { search: "zzzznope" })).toHaveLength(0);
  });

  it("sorts lowest stock first", () => {
    const sorted = resolveAdminProducts(products, { sort: "stock-asc" });
    const stocks = sorted.map((s) => s.inventory);
    expect([...stocks].sort((a, b) => a - b)).toEqual(stocks);
  });

  it("filters to products low on stock", () => {
    const low = resolveAdminProducts(products, {
      lowStockAtOrBelow: LOW_STOCK_THRESHOLD,
    });
    for (const summary of low) {
      expect(summary.lowestVariantStock).toBeLessThanOrEqual(LOW_STOCK_THRESHOLD);
    }
  });

  it("computes catalogue statistics", () => {
    const stats = computeStats(products);

    expect(stats.totalProducts).toBe(products.length);
    expect(stats.activeProducts + stats.draftProducts + stats.archivedProducts).toBe(
      products.length,
    );
    expect(stats.totalInventory).toBe(
      products.reduce((n, p) => n + p.inventory, 0),
    );
    expect(stats.inventoryValue).toBeGreaterThan(0);
  });
});

describe("in-memory admin repository", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("creates a product and makes it findable", async () => {
    const created = await repo.create(validInput({ slug: "brand-new" }));

    expect(created.id).toBeTruthy();
    expect(await repo.getById(created.id)).not.toBeNull();

    const listed = await repo.list({ search: "brand-new" });
    expect(listed.total).toBe(1);
  });

  it("refuses a duplicate slug", async () => {
    await expect(
      repo.create(validInput({ slug: products[0].slug })),
    ).rejects.toThrow(/already exists/i);
  });

  it("allows a product to keep its own slug when edited", async () => {
    const existing = products[0];
    expect(await repo.isSlugAvailable(existing.slug, existing.id)).toBe(true);
    expect(await repo.isSlugAvailable(existing.slug)).toBe(false);
  });

  it("updates in place without changing the id", async () => {
    const existing = products[0];
    const updated = await repo.update(
      existing.id,
      inputFromProduct({ ...existing, name: "Renamed" }),
    );

    expect(updated.id).toBe(existing.id);
    expect(updated.name).toBe("Renamed");
    expect((await repo.list({ perPage: 500 })).total).toBe(products.length);
  });

  it("flips status without touching anything else", async () => {
    const existing = products[0];
    await repo.setStatus(existing.id, "archived");

    const after = await repo.getById(existing.id);
    expect(after?.status).toBe("archived");
    expect(after?.price).toBe(existing.price);
    expect(after?.variants).toHaveLength(existing.variants.length);
  });

  it("deletes a product", async () => {
    const existing = products[0];
    await repo.remove(existing.id);

    expect(await repo.getById(existing.id)).toBeNull();
    expect((await repo.list({ perPage: 500 })).total).toBe(products.length - 1);
  });

  it("reports stats that follow the edits", async () => {
    const before = await repo.stats();
    await repo.setStatus(products[0].id, "draft");
    const after = await repo.stats();

    expect(after.draftProducts).toBe(before.draftProducts + 1);
    expect(after.activeProducts).toBe(before.activeProducts - 1);
  });
});
