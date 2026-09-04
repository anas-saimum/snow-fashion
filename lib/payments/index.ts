import { pendingPaymentProvider } from "./pending.provider";
import type { PaymentProvider } from "./provider";

/**
 * Provider registry. Add real providers here and select one with
 * NEXT_PUBLIC_PAYMENT_PROVIDER.
 *
 *   const registry = { none: pendingPaymentProvider, stripe: stripeProvider };
 */
const registry: Record<string, PaymentProvider> = {
  none: pendingPaymentProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const key = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "none";
  return registry[key] ?? pendingPaymentProvider;
}

export type { PaymentProvider, PaymentResult, PaymentIntentRequest } from "./provider";
