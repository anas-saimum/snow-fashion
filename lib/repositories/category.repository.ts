import type { Category, Collection } from "@/types";

export interface CategoryRepository {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  getChildren(slug: string): Promise<Category[]>;
  getFeatured(): Promise<Category[]>;
  getAllSlugs(): Promise<string[]>;
}

export interface CollectionRepository {
  list(): Promise<Collection[]>;
  getBySlug(slug: string): Promise<Collection | null>;
}
