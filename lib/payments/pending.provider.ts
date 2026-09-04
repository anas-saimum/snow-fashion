import type { PaymentProvider, PaymentResult } from "./provider";

/**
 * The MVP provider. It does NOT take payment and does not pretend to.
 *
 * An order placed through it is recorded with paymentStatus "unpaid", and the
 * confirmation screen tells the customer plainly that no payment was taken.
 * Replace this with a real provider before accepting orders from the public.
 */
export const pendingPaymentProvider: PaymentProvider = {
  id: "none",
  label: "No payment provider connected",
  isLive: false,

  async createPayment(): Promise<PaymentResult> {
    return {
      collected: false,
      status: "unpaid",
      message:
        "No payment was taken. This store has no payment provider connected yet, so your order has been recorded as unpaid.",
    };
  },
};
