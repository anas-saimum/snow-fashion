import type { Money } from "@/types";

/** Estimated shipping rules. Replace with carrier/zone rates when a backend lands. */
export const shippingConfig = {
  flatRate: 995 as Money, // $9.95
  freeShippingThreshold: 15000 as Money, // $150.00
  estimatedDays: "3 – 6 business days",
  /** Countries offered in the checkout selector. */
  countries: [
    "United States",
    "Canada",
    "United Kingdom",
    "Ireland",
    "France",
    "Germany",
    "Netherlands",
    "Spain",
    "Italy",
    "Australia",
    "New Zealand",
    "United Arab Emirates",
    "Pakistan",
    "India",
    "Singapore",
    "Japan",
  ],
} as const;
