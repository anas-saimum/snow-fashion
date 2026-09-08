import type { ColorOption, Money, ProductStatus, SizeOption } from "./index";

/** An image being saved. `id` is present when editing an existing row. */
export interface ProductImageInput {
  id?: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  colorSlug?: string;
}

/** A colour × size combination with its own stock level. */
export interface ProductVariantInput {
  id?: string;
  sku: string;
  colorSlug?: string;
  sizeSlug?: string;
  /** Optional override; falls back to the product price. */
  price?: Money;
  inventory: number;
}

/**
 * Everything the product editor submits. Deliberately close in shape to the
 * domain `Product` so the mapping either way stays boring.
 *
 * Money fields are minor units, as everywhere else.
 */
export interface ProductInput {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: Money;
  compareAtPrice?: Money;
  categorySlugs: string[];
  colors: ColorOption[];
  sizes: SizeOption[];
  images: ProductImageInput[];
  variants: ProductVariantInput[];
  materials: string[];
  careInstructions: string[];
  sizeGuideId?: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  status: ProductStatus;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface AdminProductListQuery {
  search?: string;
  status?: ProductStatus | "all";
  categorySlug?: string;
  /** Only products where some variant is at or below the threshold. */
  lowStockAtOrBelow?: number;
  sort?: "updated" | "name" | "price-asc" | "price-desc" | "stock-asc";
  page?: number;
  perPage?: number;
}

/** Row shape for the admin product table — lighter than a full Product. */
export interface AdminProductSummary {
  id: string;
  slug: string;
  name: string;
  price: Money;
  compareAtPrice?: Money;
  status: ProductStatus;
  categorySlugs: string[];
  imageUrl?: string;
  imageAlt?: string;
  inventory: number;
  variantCount: number;
  lowestVariantStock: number;
  updatedAt: string;
}

export interface SiteSettings {
  logoUrl?: string;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  onSaleProducts: number;
  totalInventory: number;
  /** Catalogue value at retail, in minor units. */
  inventoryValue: Money;
}
