"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getOrder } from "@/lib/orders/order.service";
import { siteConfig } from "@/config/site.config";
import type { Order } from "@/types";

/**
 * Confirmation screen.
 *
 * It says "order received", never "payment successful", because with no
 * provider connected nothing was charged. The unpaid status is shown
 * explicitly so the customer is not left guessing.
 */
export function ConfirmationContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(getOrder(orderId));
    setLoaded(true);
  }, [orderId]);

  if (!loaded) {
    return (
      <div className="u-container py-20">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full max-w-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <PageHeader
          title="Order not found"
          trail={[
            { name: "Home", path: "/" },
            { name: "Checkout", path: "/checkout" },
          ]}
        />
        <div className="u-container py-12">
          <EmptyState
            icon={<FileText className="size-6" aria-hidden="true" />}
            title="We could not find that order"
            description="Orders in this MVP are stored in the browser that placed them, so they will not appear on another device or after clearing site data."
            action={{ href: "/shop", label: "Back to shop" }}
            secondaryAction={{ href: "/contact", label: "Contact us" }}
          />
        </div>
      </>
    );
  }

  const unpaid = order.paymentStatus === "unpaid";

  return (
    <>
      <PageHeader
        eyebrow="Thank you"
        title="Order received"
        trail={[
          { name: "Home", path: "/" },
          { name: "Order " + order.orderNumber, path: "/checkout/confirmation/" + order.id },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <div className="flex items-start gap-4 border border-stone p-6">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-paper">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-h3">
                  {"Order " + order.orderNumber + " is recorded"}
                </h2>
                <p className="mt-2 text-caption leading-relaxed text-ink-soft">
                  {"We have your details, " +
                    order.customer.fullName.split(" ")[0] +
                    ". A copy of this reference is worth keeping."}
                </p>
              </div>
            </div>

            {unpaid && (
              <div className="mt-6 flex items-start gap-4 border border-sale/40 bg-canvas p-6">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0 text-sale"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-caption font-medium uppercase tracking-[0.1em] text-ink">
                    Payment status: unpaid
                  </h3>
                  <p className="mt-2 text-caption leading-relaxed text-ink-soft">
                    No payment has been taken and no card details were
                    collected. This store has no payment provider connected
                    yet, so your order is held as a request rather than a
                    confirmed purchase.
                  </p>
                  <p className="mt-3 text-caption leading-relaxed text-ink-soft">
                    {"Our team will be in touch at " +
                      order.customer.email +
                      " to arrange payment and confirm dispatch. You can also reach us at " +
                      siteConfig.contact.email +
                      "."}
                  </p>
                </div>
              </div>
            )}

            <dl className="mt-8 grid gap-6 border-t border-stone pt-8 sm:grid-cols-2">
              <div>
                <dt className="u-eyebrow mb-2 text-ink">Contact</dt>
                <dd className="text-caption leading-relaxed text-ink-soft">
                  {order.customer.fullName}
                  <br />
                  {order.customer.email}
                  <br />
                  {order.customer.phone}
                </dd>
              </div>

              <div>
                <dt className="u-eyebrow mb-2 text-ink">Shipping to</dt>
                <dd className="text-caption leading-relaxed text-ink-soft">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && (
                    <>
                      <br />
                      {order.shippingAddress.line2}
                    </>
                  )}
                  <br />
                  {order.shippingAddress.city}
                  {order.shippingAddress.state
                    ? ", " + order.shippingAddress.state
                    : ""}
                  <br />
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </dd>
              </div>

              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="u-eyebrow mb-2 text-ink">Your notes</dt>
                  <dd className="text-caption leading-relaxed text-ink-soft">
                    {order.notes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/shop">Continue shopping</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Contact us
              </ButtonLink>
            </div>
          </div>

          <aside>
            <OrderSummary
              items={order.items}
              totals={order.totals}
              heading="What you ordered"
            />
          </aside>
        </div>
      </div>
    </>
  );
}
