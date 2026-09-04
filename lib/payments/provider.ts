import type { CartItem, CartTotals, CustomerDetails, Address, PaymentStatus } from "@/types";

/**
 * PAYMENT ABSTRACTION
 *
 * No payment provider is connected in this MVP. This interface exists so a
 * real one can be added without touching the checkout UI. See
 * `pending.provider.ts` for the honest no-op used today, and README.md
 * ("Connecting a payment provider") for the Stripe wiring steps.
 */

export interface PaymentIntentRequest {
  items: CartItem[];
  totals: CartTotals;
  customer: CustomerDetails;
  shippingAddress: Address;
  currency: string;
}

export interface PaymentResult {
  /** Whether the provider took responsibility for collecting the money. */
  collected: boolean;
  status: PaymentStatus;
  /** Provider-side reference, when there is one. */
  reference?: string;
  /** Where to send the customer next (a hosted checkout, say). */
  redirectUrl?: string;
  /** Shown to the customer verbatim. Must never overstate what happened. */
  message: string;
}

export interface PaymentProvider {
  /** Stable identifier persisted on the order. */
  readonly id: string;
  readonly label: string;
  /** False while the provider is a placeholder, so the UI can say so. */
  readonly isLive: boolean;
  createPayment(request: PaymentIntentRequest): Promise<PaymentResult>;
}
