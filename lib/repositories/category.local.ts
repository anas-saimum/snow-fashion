import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import type {
  CategoryRepository,
  CollectionRepository,
} from "./category.repository";

const sorted = () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

export const localCategoryRepository: CategoryRepository = {
  async list() {
    return sorted();
  },
  async getBySlug(slug) {
    return categories.find((c) => c.slug === slug) ?? null;
  },
  async getChildren(slug) {
    return sorted().filter((c) => c.parentSlug === slug);
  },
  async getFeatured() {
    return sorted().filter((c) => c.featured);
  },
  async getAllSlugs() {
    return categories.map((c) => c.slug);
  },
};

export const localCollectionRepository: CollectionRepository = {
  async list() {
    return collections;
  },
  async getBySlug(slug) {
    return collections.find((c) => c.slug === slug) ?? null;
  },
};
