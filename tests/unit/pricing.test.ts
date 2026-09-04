import { describe, expect, it } from "vitest";
import {
  calculateTotals,
  discountPercent,
  formatMoney,
  formatMoneyCompact,
  isOnSale,
  shippingFor,
} from "@/lib/pricing";
import { shippingConfig } from "@/config/shipping.config";
import type { CartItem } from "@/types";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    key: "k1",
    productId: "p1",
    variantId: "v1",
    slug: "slug",
    name: "Test piece",
    image: "/x.jpg",
    imageAlt: "x",
    unitPrice: 5000,
    quantity: 1,
    maxQuantity: 10,
    addedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("formatMoney", () => {
  it("renders minor units as currency", () => {
    expect(formatMoney(12999)).toBe("$129.99");
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("drops decimals only when the amount is whole", () => {
    expect(formatMoneyCompact(12900)).toBe("$129");
    expect(formatMoneyCompact(12999)).toBe("$129.99");
  });
});

describe("discountPercent", () => {
  it("returns a rounded whole percent", () => {
    expect(discountPercent(14800, 18900)).toBe(22);
    expect(discountPercent(4200, 5500)).toBe(24);
  });

  it("returns null when there is no genuine discount", () => {
    expect(discountPercent(5000, undefined)).toBeNull();
    expect(discountPercent(5000, 5000)).toBeNull();
    expect(discountPercent(5000, 4000)).toBeNull();
  });

  it("drives isOnSale", () => {
    expect(isOnSale(4000, 5000)).toBe(true);
    expect(isOnSale(5000, 5000)).toBe(false);
  });
});

describe("shippingFor", () => {
  it("charges the flat rate below the threshold", () => {
    expect(shippingFor(1000)).toBe(shippingConfig.flatRate);
  });

  it("is free at or above the threshold", () => {
    expect(shippingFor(shippingConfig.freeShippingThreshold)).toBe(0);
    expect(shippingFor(shippingConfig.freeShippingThreshold + 1)).toBe(0);
  });

  it("charges nothing for an empty cart", () => {
    expect(shippingFor(0)).toBe(0);
  });
});

describe("calculateTotals", () => {
  it("sums line totals using integer arithmetic", () => {
    const totals = calculateTotals([
      item({ unitPrice: 3333, quantity: 3 }),
      item({ key: "k2", unitPrice: 1, quantity: 1 }),
    ]);

    expect(totals.subtotal).toBe(10000);
    expect(Number.isInteger(totals.subtotal)).toBe(true);
    expect(totals.itemCount).toBe(4);
  });

  it("adds shipping to the total below the free threshold", () => {
    const totals = calculateTotals([item({ unitPrice: 5000, quantity: 1 })]);
    expect(totals.shipping).toBe(shippingConfig.flatRate);
    expect(totals.total).toBe(5000 + shippingConfig.flatRate);
  });

  it("reports the saving against compare-at prices", () => {
    const totals = calculateTotals([
      item({ unitPrice: 4000, compareAtPrice: 5000, quantity: 2 }),
    ]);
    expect(totals.discount).toBe(2000);
  });

  it("never reports a negative saving", () => {
    const totals = calculateTotals([
      item({ unitPrice: 5000, compareAtPrice: 4000, quantity: 1 }),
    ]);
    expect(totals.discount).toBe(0);
  });

  it("tracks how much more is needed for free shipping", () => {
    const totals = calculateTotals([item({ unitPrice: 10000, quantity: 1 })]);
    expect(totals.freeShippingRemaining).toBe(
      shippingConfig.freeShippingThreshold - 10000,
    );
  });

  it("zeroes an empty cart", () => {
    const totals = calculateTotals([]);
    expect(totals).toMatchObject({
      subtotal: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    });
  });
});
