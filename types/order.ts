import type { CartItem, CartTotals } from "./cart";

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "authorized"
  | "paid"
  | "refunded"
  | "failed";

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totals: CartTotals;
  customer: CustomerDetails;
  shippingAddress: Address;
  notes?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** "none" while no payment provider is connected. */
  paymentProvider: string;
  createdAt: string;
}
