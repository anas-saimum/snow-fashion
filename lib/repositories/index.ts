import { isSupabaseConfigured } from "@/lib/supabase/config";

import { localProductRepository } from "./product.local";
import { memoryProductRepository } from "./product.memory";
import { supabaseProductRepository } from "./product.supabase";
import {
  localCategoryRepository,
  localCollectionRepository,
} from "./category.local";
import {
  memoryAdminCategoryRepository,
  memoryAdminProductRepository,
  memoryAdminSettingsRepository,
} from "./admin.memory";
import {
  supabaseAdminCategoryRepository,
  supabaseAdminProductRepository,
  supabaseAdminSettingsRepository,
} from "./admin.supabase";
import type { PersistenceMode } from "./admin.repository";

/**
 * Single wiring point for data access.
 *
 * Three cases, and the difference matters enough that the admin UI shows
 * which one is live:
 *
 *  1. Supabase configured — real, durable, works in production.
 *  2. No config, development — in-memory store seeded from the demo
 *     catalogue. The dashboard is fully usable, but edits vanish on restart.
 *     This exists so the admin can be built and tested before any Supabase
 *     project does.
 *  3. No config, production — the storefront reads the local demo catalogue
 *     and the admin refuses to load. Anything else would mean an admin that
 *     appears to save and silently discards the work, because serverless
 *     instances share no memory.
 */
export const persistenceMode: PersistenceMode = isSupabaseConfigured
  ? "supabase"
  : process.env.NODE_ENV === "development"
    ? "memory"
    : "read-only";

export const productRepository =
  persistenceMode === "supabase"
    ? supabaseProductRepository
    : persistenceMode === "memory"
      ? memoryProductRepository
      : localProductRepository;

export const categoryRepository = localCategoryRepository;
export const collectionRepository = localCollectionRepository;

/** Null when no writable backend is available — the admin checks this. */
export const adminProductRepository =
  persistenceMode === "supabase"
    ? supabaseAdminProductRepository
    : persistenceMode === "memory"
      ? memoryAdminProductRepository
      : null;

export const adminCategoryRepository =
  persistenceMode === "supabase"
    ? supabaseAdminCategoryRepository
    : memoryAdminCategoryRepository;

export const adminSettingsRepository =
  persistenceMode === "supabase"
    ? supabaseAdminSettingsRepository
    : persistenceMode === "memory"
      ? memoryAdminSettingsRepository
      : null;

/** Throws a clear error instead of letting a null slip into a page. */
export function requireAdminProductRepository() {
  if (!adminProductRepository) {
    throw new Error(
      "No writable catalogue backend is configured. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and NEXT_PUBLIC_SUPABASE_ANON_KEY (see README → Admin dashboard).",
    );
  }
  return adminProductRepository;
}

export type {
  ProductQuery,
  ProductRepository,
} from "./product.repository";
export type {
  CategoryRepository,
  CollectionRepository,
} from "./category.repository";
export type {
  AdminCategoryRepository,
  AdminProductRepository,
  AdminSettingsRepository,
  PersistenceMode,
} from "./admin.repository";
