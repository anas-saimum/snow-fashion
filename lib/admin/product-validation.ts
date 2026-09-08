import type { ProductInput } from "@/types/admin";

/**
 * Validation for the product editor.
 *
 * Runs on the server inside the action — client-side checks are a courtesy,
 * the server's are the rule. Messages are written for a shopkeeper, not a
 * developer: "The sale price must be below the original price", not
 * "constraint compare_at_above_price violated".
 */

export type ProductFieldErrors = Record<string, string>;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validateProductInput(input: ProductInput): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = "Give the product a name.";
  }

  if (!input.slug.trim()) {
    errors.slug = "The web address cannot be empty.";
  } else if (!SLUG_PATTERN.test(input.slug)) {
    errors.slug =
      "Use lowercase letters, numbers and single hyphens — for example ivory-silk-dress.";
  }

  if (!input.shortDescription.trim()) {
    errors.shortDescription =
      "Add a one-line description — it appears on product cards and in search results.";
  }

  if (!Number.isInteger(input.price) || input.price <= 0) {
    errors.price = "Enter a price above zero.";
  }

  if (input.compareAtPrice !== undefined) {
    if (!Number.isInteger(input.compareAtPrice) || input.compareAtPrice <= 0) {
      errors.compareAtPrice = "Enter a valid original price, or leave it empty.";
    } else if (input.compareAtPrice <= input.price) {
      errors.compareAtPrice =
        "The original price must be higher than the current price, otherwise it is not a discount.";
    }
  }

  if (input.categorySlugs.length === 0) {
    errors.categorySlugs = "Choose at least one category so the product is findable.";
  }

  if (input.images.length === 0) {
    errors.images = "Add at least one photograph.";
  } else {
    const missingAlt = input.images.findIndex((i) => !i.alt.trim());
    if (missingAlt !== -1) {
      errors.images =
        "Image " +
        (missingAlt + 1) +
        " needs alt text — a short description for screen readers and for when the image fails to load.";
    }
  }

  const colorSlugs = input.colors.map((c) => c.slug);
  if (new Set(colorSlugs).size !== colorSlugs.length) {
    errors.colors = "Two colours share the same name.";
  }
  const badHex = input.colors.find((c) => !/^#[0-9a-f]{6}$/i.test(c.hex));
  if (badHex) {
    errors.colors = 'Pick a colour swatch for "' + badHex.name + '".';
  }

  const sizeSlugs = input.sizes.map((s) => s.slug);
  if (new Set(sizeSlugs).size !== sizeSlugs.length) {
    errors.sizes = "Two sizes share the same label.";
  }

  if (input.variants.length === 0) {
    errors.variants = "There are no sellable combinations — add a size or a colour.";
  } else {
    const skus = input.variants.map((v) => v.sku.trim());
    if (skus.some((s) => !s)) {
      errors.variants = "Every combination needs a SKU.";
    } else if (new Set(skus).size !== skus.length) {
      errors.variants = "Two combinations share the same SKU.";
    } else if (input.variants.some((v) => !Number.isInteger(v.inventory) || v.inventory < 0)) {
      errors.variants = "Stock cannot be negative.";
    }
  }

  if (input.status === "active" && input.images.length === 0) {
    errors.status = "A product cannot go live without a photograph.";
  }

  return errors;
}

export function hasFieldErrors(errors: ProductFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Converts a price typed as "148" or "148.50" into minor units. */
export function parsePriceInput(value: string): number | undefined {
  const trimmed = value.trim().replace(/[^0-9.]/g, "");
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed * 100);
}

/** Minor units back into a value an input can show. */
export function formatPriceInput(minor: number | undefined): string {
  if (minor === undefined) return "";
  return (minor / 100).toFixed(2).replace(/\.00$/, "");
}
