import { localProductRepository } from "./product.local";
import {
  localCategoryRepository,
  localCollectionRepository,
} from "./category.local";

/**
 * Single wiring point for data access.
 *
 * To move to a real backend, implement the interfaces in *.repository.ts
 * against your API and swap the three exports below. Nothing else in the
 * application imports a concrete implementation.
 *
 *   export const productRepository = supabaseProductRepository;
 */
export const productRepository = localProductRepository;
export const categoryRepository = localCategoryRepository;
export const collectionRepository = localCollectionRepository;

export type {
  ProductQuery,
  ProductRepository,
} from "./product.repository";
export type {
  CategoryRepository,
  CollectionRepository,
} from "./category.repository";
