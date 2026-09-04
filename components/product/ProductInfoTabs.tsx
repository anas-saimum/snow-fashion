import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { shippingConfig } from "@/config/shipping.config";
import { formatMoney, formatMoneyCompact } from "@/lib/pricing";
import type { Product } from "@/types";

/**
 * Product information as a disclosure list. An accordion beats tabs here:
 * it works identically at every width and needs no roving tabindex.
 */
export function ProductInfoTabs({ product }: { product: Product }) {
  const items: AccordionItem[] = [
    {
      id: "description",
      title: "Description",
      content: (
        <p className="max-w-2xl text-caption leading-relaxed text-ink-soft">
          {product.description}
        </p>
      ),
    },
  ];

  if (product.materials?.length) {
    items.push({
      id: "materials",
      title: "Materials",
      content: (
        <ul className="flex flex-col gap-2 text-caption text-ink-soft">
          {product.materials.map((material) => (
            <li key={material} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1 shrink-0 rounded-full bg-accent"
              />
              {material}
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (product.careInstructions?.length) {
    items.push({
      id: "care",
      title: "Care instructions",
      content: (
        <ul className="flex flex-col gap-2 text-caption text-ink-soft">
          {product.careInstructions.map((instruction) => (
            <li key={instruction} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1 shrink-0 rounded-full bg-accent"
              />
              {instruction}
            </li>
          ))}
        </ul>
      ),
    });
  }

  items.push(
    {
      id: "shipping",
      title: "Shipping",
      content: (
        <div className="flex flex-col gap-2 text-caption leading-relaxed text-ink-soft">
          <p>
            {"Standard delivery is " +
              formatMoney(shippingConfig.flatRate) +
              " and arrives in " +
              shippingConfig.estimatedDays +
              "."}
          </p>
          <p>
            {"Orders over " +
              formatMoneyCompact(shippingConfig.freeShippingThreshold) +
              " ship free."}
          </p>
          <p className="text-muted">
            Delivery estimates begin from dispatch, not from the moment the
            order is placed. Taxes and duties, where applicable, are calculated
            at dispatch.
          </p>
        </div>
      ),
    },
    {
      id: "returns",
      title: "Returns",
      content: (
        <div className="flex flex-col gap-2 text-caption leading-relaxed text-ink-soft">
          <p>
            Unworn items may be returned within 30 days of delivery, with tags
            attached and in their original packaging.
          </p>
          <p className="text-muted">
            Full return terms are on the{" "}
            <a href="/returns" className="u-link text-ink">
              returns page
            </a>
            .
          </p>
        </div>
      ),
    },
  );

  return (
    <section aria-labelledby="product-info-heading" className="mt-16 lg:mt-24">
      <h2 id="product-info-heading" className="text-h2">
        Product Information
      </h2>
      <div className="mt-8">
        <Accordion items={items} defaultOpen={["description"]} />
      </div>
    </section>
  );
}
