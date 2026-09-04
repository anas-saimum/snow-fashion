/** Money is always stored in minor units (cents). 12999 === $129.99 */
export type Money = number;

export type CurrencyCode = "USD" | "EUR" | "GBP" | "PKR" | "INR" | "AED";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface FacetValue {
  label: string;
  value: string;
  count: number;
  /** Present on colour facets so swatches can render. */
  hex?: string;
}

export interface Facets {
  categories: FacetValue[];
  sizes: FacetValue[];
  colors: FacetValue[];
  priceRange: { min: Money; max: Money };
}
