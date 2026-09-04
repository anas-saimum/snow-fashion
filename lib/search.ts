import type { Product } from "@/types";
import { categoryBySlug } from "@/data/categories";

/**
 * Weighted, field-aware product search. Deliberately dependency-free —
 * a catalogue of this size does not justify a search index. When the
 * catalogue outgrows this, swap the body for Algolia/Typesense/pg_trgm
 * behind the same signature.
 */

const WEIGHTS = {
  nameExact: 100,
  namePrefix: 60,
  nameWord: 40,
  category: 25,
  shortDescription: 12,
  description: 6,
  material: 4,
  color: 8,
} as const;

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

function haystack(product: Product) {
  const categoryNames = product.categorySlugs
    .map((slug) => categoryBySlug.get(slug)?.name ?? slug)
    .join(" ");

  return {
    name: product.name.toLowerCase(),
    nameWords: tokenize(product.name),
    categories: categoryNames.toLowerCase(),
    shortDescription: product.shortDescription.toLowerCase(),
    description: product.description.toLowerCase(),
    materials: (product.materials ?? []).join(" ").toLowerCase(),
    colors: product.colors.map((c) => c.name).join(" ").toLowerCase(),
  };
}

export function scoreProduct(product: Product, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const h = haystack(product);
  const terms = tokenize(q);
  if (terms.length === 0) return 0;

  let score = 0;

  if (h.name === q) score += WEIGHTS.nameExact;
  if (h.name.startsWith(q)) score += WEIGHTS.namePrefix;

  for (const term of terms) {
    if (h.nameWords.some((w) => w === term)) score += WEIGHTS.nameWord;
    else if (h.nameWords.some((w) => w.startsWith(term))) score += WEIGHTS.nameWord / 2;

    if (h.categories.includes(term)) score += WEIGHTS.category;
    if (h.colors.includes(term)) score += WEIGHTS.color;
    if (h.shortDescription.includes(term)) score += WEIGHTS.shortDescription;
    if (h.description.includes(term)) score += WEIGHTS.description;
    if (h.materials.includes(term)) score += WEIGHTS.material;
  }

  // Every term must land somewhere, otherwise a two-word query matches too much.
  const allTermsHit = terms.every((term) => {
    return (
      h.name.includes(term) ||
      h.categories.includes(term) ||
      h.colors.includes(term) ||
      h.shortDescription.includes(term) ||
      h.description.includes(term) ||
      h.materials.includes(term)
    );
  });

  return allTermsHit ? score : 0;
}

export function searchProducts(products: Product[], query: string): Product[] {
  return products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map((r) => r.product);
}

/** Suggestions for the header overlay — cheap and capped. */
export function suggestProducts(
  products: Product[],
  query: string,
  limit = 5,
): Product[] {
  return searchProducts(products, query).slice(0, limit);
}
