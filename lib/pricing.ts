import { shippingConfig } from "@/config/shipping.config";
import { siteConfig } from "@/config/site.config";
import type { CartItem, CartTotals, CurrencyCode, Money } from "@/types";

/**
 * All money is handled as integer minor units. Never introduce floats into
 * these calculations — format only at the render edge.
 */

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: CurrencyCode, maximumFractionDigits: number) {
  const key = currency + ":" + maximumFractionDigits;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(siteConfig.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });
    formatters.set(key, f);
  }
  return f;
}

/** 12999 -> "$129.99" */
export function formatMoney(
  minor: Money,
  currency: CurrencyCode = siteConfig.currency,
): string {
  return formatter(currency, 2).format(minor / 100);
}

/** 12900 -> "$129" — drops the decimals when the amount is whole. */
export function formatMoneyCompact(
  minor: Money,
  currency: CurrencyCode = siteConfig.currency,
): string {
  return minor % 100 === 0
    ? formatter(currency, 0).format(minor / 100)
    : formatMoney(minor, currency);
}

/** Rounded whole-percent saving, or null when there is no valid discount. */
export function discountPercent(
  price: Money,
  compareAtPrice?: Money,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function isOnSale(price: Money, compareAtPrice?: Money): boolean {
  return discountPercent(price, compareAtPrice) !== null;
}

export function shippingFor(subtotal: Money): Money {
  if (subtotal <= 0) return 0;
  return subtotal >= shippingConfig.freeShippingThreshold
    ? 0
    : shippingConfig.flatRate;
}

export function calculateTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const compareTotal = items.reduce(
    (sum, item) => sum + (item.compareAtPrice ?? item.unitPrice) * item.quantity,
    0,
  );

  const shipping = shippingFor(subtotal);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    shipping,
    discount: Math.max(0, compareTotal - subtotal),
    total: subtotal + shipping,
    itemCount,
    freeShippingRemaining: Math.max(
      0,
      shippingConfig.freeShippingThreshold - subtotal,
    ),
  };
}
