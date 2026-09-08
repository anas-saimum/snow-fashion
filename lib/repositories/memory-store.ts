import { products as demoProducts } from "@/data/products";
import type { Product } from "@/types";
import type { SiteSettings } from "@/types/admin";

/**
 * In-memory catalogue for local development.
 *
 * Seeded from the demo data, then mutated by the admin. It exists so the
 * dashboard is fully usable — and testable — before any Supabase project
 * exists. Two honest limitations, surfaced in the admin UI rather than hidden:
 *
 *   * it resets whenever the dev server restarts;
 *   * it is per-process, so it cannot work on serverless production.
 *
 * lib/repositories/index.ts therefore only selects this in development.
 */

function clone<T>(value: T): T {
  return structuredClone(value);
}

interface MemoryState {
  products: Product[];
  settings: SiteSettings;
}

// Stashed on globalThis so Next's dev-mode module reloading does not wipe
// edits on every hot update.
const globalRef = globalThis as typeof globalThis & {
  __snowFashionMemoryStore?: MemoryState;
};

function state(): MemoryState {
  if (!globalRef.__snowFashionMemoryStore) {
    globalRef.__snowFashionMemoryStore = {
      products: clone(demoProducts) as Product[],
      settings: {},
    };
  }
  return globalRef.__snowFashionMemoryStore;
}

export const memoryStore = {
  all(): Product[] {
    return state().products;
  },

  byId(id: string): Product | undefined {
    return state().products.find((p) => p.id === id);
  },

  bySlug(slug: string): Product | undefined {
    return state().products.find((p) => p.slug === slug);
  },

  insert(product: Product): Product {
    state().products.unshift(product);
    return product;
  },

  replace(id: string, product: Product): Product {
    const list = state().products;
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found: " + id);
    list[index] = product;
    return product;
  },

  remove(id: string): void {
    const list = state().products;
    const index = list.findIndex((p) => p.id === id);
    if (index !== -1) list.splice(index, 1);
  },

  settings(): SiteSettings {
    return state().settings;
  },

  updateSettings(next: SiteSettings): SiteSettings {
    state().settings = { ...state().settings, ...next };
    return state().settings;
  },

  /** Used by tests to get a predictable starting point. */
  reset(): void {
    globalRef.__snowFashionMemoryStore = {
      products: clone(demoProducts) as Product[],
      settings: {},
    };
  },
};
