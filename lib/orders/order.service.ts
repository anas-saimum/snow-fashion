import { getPaymentProvider } from "@/lib/payments";
import { calculateTotals } from "@/lib/pricing";
import { orderNumber } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
import type { Address, CartItem, CustomerDetails, Order } from "@/types";
import type { PaymentResult } from "@/lib/payments";

const STORAGE_KEY = "snow-fashion.orders.v1";
const MAX_STORED = 20;

/**
 * MVP order service.
 *
 * Orders are recorded in the browser only — there is no server database yet.
 * IMPORTANT for production: totals must be recalculated server-side from the
 * product repository before any payment is authorised. The client price
 * snapshot in CartItem is display data and must never be trusted as the
 * amount to charge. See README ("Going to production").
 */

export interface PlaceOrderInput {
  items: CartItem[];
  customer: CustomerDetails;
  shippingAddress: Address;
  notes?: string;
}

export interface PlaceOrderResult {
  order: Order;
  payment: PaymentResult;
}

function readAll(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(orders.slice(0, MAX_STORED)),
    );
  } catch {
    // Storage full or blocked — the order object is still returned to the
    // caller so the confirmation screen can render this session.
  }
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  if (input.items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  const provider = getPaymentProvider();
  const totals = calculateTotals(input.items);

  const payment = await provider.createPayment({
    items: input.items,
    totals,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    currency: siteConfig.currency,
  });

  const number = orderNumber();

  const order: Order = {
    id: number.toLowerCase(),
    orderNumber: number,
    items: input.items,
    totals,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    notes: input.notes,
    status: "pending",
    paymentStatus: payment.status,
    paymentProvider: provider.id,
    createdAt: new Date().toISOString(),
  };

  writeAll([order, ...readAll()]);

  return { order, payment };
}

export function getOrder(id: string): Order | null {
  return readAll().find((o) => o.id === id) ?? null;
}

export function getRecentOrders(): Order[] {
  return readAll();
}
