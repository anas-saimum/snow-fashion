import type { Category, Paginated, Product } from "@/types";
import type {
  AdminProductListQuery,
  AdminProductSummary,
  AdminStats,
  ProductInput,
  SiteSettings,
} from "@/types/admin";

/**
 * The write side of the catalogue.
 *
 * Kept separate from ProductRepository on purpose: the storefront should not
 * be able to reach a mutation by accident, and the read interface stays
 * usable by a read-only backend (a CDN cache, a static export) that has no
 * business implementing create/update/delete.
 */
export interface AdminProductRepository {
  /** Unlike the storefront, this sees drafts and archived products. */
  list(query?: AdminProductListQuery): Promise<Paginated<AdminProductSummary>>;
  getById(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
  /** Cheap status flip for the list view, without a full round trip. */
  setStatus(id: string, status: Product["status"]): Promise<void>;
  /** Is this slug free? Excludes `exceptId` so editing a product is not blocked by itself. */
  isSlugAvailable(slug: string, exceptId?: string): Promise<boolean>;
  stats(): Promise<AdminStats>;
}

export interface AdminCategoryRepository {
  list(): Promise<Category[]>;
}

export interface AdminSettingsRepository {
  get(): Promise<SiteSettings>;
  update(settings: SiteSettings): Promise<SiteSettings>;
}

/**
 * How the running instance is persisting data. The admin UI surfaces this so
 * nobody edits for an hour in a mode that forgets everything on restart.
 */
export type PersistenceMode =
  /** Supabase Postgres + Storage. Real, durable, multi-device. */
  | "supabase"
  /** In-memory, seeded from the demo catalogue. Dev only; resets on restart. */
  | "memory"
  /** No backend: the storefront reads local demo data and the admin is disabled. */
  | "read-only";
