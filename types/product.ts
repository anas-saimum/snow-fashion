import type { CurrencyCode, Money } from "./common";

export interface ProductImage {
  id: string;
  url: string;
  /** Required, not optional — alt text is an accessibility contract. */
  alt: string;
  width: number;
  height: number;
  /** Ties an image to a colour option so the gallery can follow the swatch. */
  colorSlug?: string;
}

export interface ColorOption {
  name: string;
  slug: string;
  hex: string;
}

export interface SizeOption {
  label: string;
  slug: string;
}

/** The unit inventory is actually tracked against. */
export interface ProductVariant {
  id: string;
  sku: string;
  colorSlug?: string;
  sizeSlug?: string;
  /** Optional override; falls back to Product.price. */
  price?: Money;
  inventory: number;
}

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Card copy and meta description. */
  shortDescription: string;
  /** Product detail page body copy. */
  description: string;
  price: Money;
  /** Original price. Discount percentage is always derived, never stored. */
  compareAtPrice?: Money;
  currency: CurrencyCode;
  categorySlugs: string[];
  /** images[0] is primary, images[1] is the card hover image. */
  images: ProductImage[];
  colors: ColorOption[];
  sizes: SizeOption[];
  variants: ProductVariant[];
  materials?: string[];
  careInstructions?: string[];
  /** Key into data/size-guides.ts */
  sizeGuideId?: string;
  /**
   * Demo values. These are placeholder figures for layout purposes only and are
   * NOT customer reviews. Real values must come from a reviews provider before
   * launch; see config/site.config.ts -> features.showRatings.
   */
  rating?: number;
  reviewCount?: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  /** Derived sum of variant inventory. */
  inventory: number;
  status: ProductStatus;
  /** ISO date — drives the "Newest" sort. */
  publishedAt: string;
  seo?: { title?: string; description?: string };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image: ProductImage;
  parentSlug?: string;
  featured: boolean;
  sortOrder: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  heroImage: ProductImage;
  productIds: string[];
}

export interface SizeGuide {
  id: string;
  title: string;
  note?: string;
  columns: string[];
  rows: string[][];
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";
