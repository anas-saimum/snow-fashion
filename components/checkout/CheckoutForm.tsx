"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PaymentNotice } from "./PaymentNotice";
import { shippingConfig } from "@/config/shipping.config";
import { placeOrder } from "@/lib/orders/order.service";
import {
  emptyCheckoutValues,
  hasErrors,
  validateCheckout,
  type CheckoutField,
  type CheckoutValues,
  type Errors,
} from "@/lib/validation/forms";
import { selectCartItems, useCartStore } from "@/store/cart";

const countryOptions = shippingConfig.countries.map((country) => ({
  value: country,
  label: country,
}));

/**
 * MVP checkout. Collects contact and shipping details, validates them
 * client-side, then hands off to OrderService -> PaymentProvider. With no
 * provider connected the order is recorded as unpaid and the customer is told
 * so on the confirmation screen.
 */
export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const clear = useCartStore((s) => s.clear);

  const [values, setValues] = useState<CheckoutValues>(emptyCheckoutValues);
  const [errors, setErrors] = useState<Errors<CheckoutField>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const set = (field: CheckoutField) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors = validateCheckout(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      // Move focus to the first problem so keyboard users are not stranded.
      const firstField = Object.keys(nextErrors).find(
        (key) => nextErrors[key as CheckoutField],
      );
      if (firstField) {
        document
          .querySelector<HTMLElement>('[name="' + firstField + '"]')
          ?.focus();
      }
      return;
    }

    if (items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const { order } = await placeOrder({
        items,
        customer: {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
        },
        shippingAddress: {
          line1: values.line1.trim(),
          line2: values.line2.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim() || undefined,
          postalCode: values.postalCode.trim(),
          country: values.country,
        },
        notes: values.notes.trim() || undefined,
      });

      clear();
      router.push("/checkout/confirmation/" + order.id);
    } catch (error) {
      setSubmitting(false);
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not record your order. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <PaymentNotice />

      <fieldset className="flex flex-col gap-5">
        <legend className="u-eyebrow mb-1 text-ink">Contact details</legend>

        <Input
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={values.fullName}
          onChange={set("fullName")}
          error={errors.fullName}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={set("email")}
            error={errors.email}
            hint="For your order confirmation."
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={set("phone")}
            error={errors.phone}
            hint="In case we need to reach you about delivery."
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="u-eyebrow mb-1 text-ink">Shipping address</legend>

        <Input
          label="Street address"
          name="line1"
          autoComplete="address-line1"
          required
          value={values.line1}
          onChange={set("line1")}
          error={errors.line1}
        />

        <Input
          label="Apartment, suite (optional)"
          name="line2"
          autoComplete="address-line2"
          value={values.line2}
          onChange={set("line2")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="City"
            name="city"
            autoComplete="address-level2"
            required
            value={values.city}
            onChange={set("city")}
            error={errors.city}
          />
          <Input
            label="State / region (optional)"
            name="state"
            autoComplete="address-level1"
            value={values.state}
            onChange={set("state")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Postal code"
            name="postalCode"
            autoComplete="postal-code"
            required
            value={values.postalCode}
            onChange={set("postalCode")}
            error={errors.postalCode}
          />
          <Select
            label="Country"
            name="country"
            autoComplete="country-name"
            required
            placeholder="Select a country"
            options={countryOptions}
            value={values.country}
            onChange={set("country")}
            error={errors.country}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="u-eyebrow mb-1 text-ink">Delivery notes</legend>
        <Textarea
          label="Anything we should know? (optional)"
          name="notes"
          rows={3}
          value={values.notes}
          onChange={set("notes")}
        />
      </fieldset>

      <div aria-live="polite">
        {formError && (
          <p className="mb-4 border border-error bg-paper p-4 text-caption text-error">
            {formError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting || items.length === 0}
        >
          {submitting ? "Recording your order…" : "Place order request"}
        </Button>

        <p className="text-micro leading-relaxed text-muted">
          By placing this request you agree to our{" "}
          <a href="/terms" className="u-link text-ink">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" className="u-link text-ink">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
