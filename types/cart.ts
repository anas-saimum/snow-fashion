import type { Money } from "./common";

export interface CartItem {
  /** `${productId}:${colorSlug}:${sizeSlug}` — the de-duplication key. */
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  colorName?: string;
  sizeLabel?: string;
  /** Price snapshot taken when the item was added. */
  unitPrice: Money;
  compareAtPrice?: Money;
  quantity: number;
  maxQuantity: number;
  addedAt: string;
}

export interface CartTotals {
  subtotal: Money;
  shipping: Money;
  discount: Money;
  total: Money;
  itemCount: number;
  freeShippingRemaining: Money;
}
