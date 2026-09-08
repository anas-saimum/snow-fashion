"use client";

import { formatPriceInput, parsePriceInput } from "@/lib/admin/product-validation";
import { LOW_STOCK_THRESHOLD } from "@/lib/repositories/admin-query";
import { cn } from "@/lib/utils";
import type { ColorOption, SizeOption } from "@/types";
import type { ProductVariantInput } from "@/types/admin";

interface VariantGridProps {
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
  colors: ColorOption[];
  sizes: SizeOption[];
  error?: string;
}

const cell =
  "h-10 w-full border border-stone-dark bg-paper px-2 text-caption tabular-nums text-ink " +
  "focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink";

/**
 * Stock and SKU per colour × size.
 *
 * This is where overselling gets prevented, so it is a table of real inputs
 * rather than a summary: the shopkeeper can see and set every sellable
 * combination. Setting a row to 0 is how you mark one size sold out — the
 * storefront then disables that size with a reason, rather than hiding it.
 */
export function VariantGrid({
  variants,
  onChange,
  colors,
  sizes,
  error,
}: VariantGridProps) {
  const update = (index: number, patch: Partial<ProductVariantInput>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const setAll = (inventory: number) => {
    onChange(variants.map((v) => ({ ...v, inventory })));
  };

  const colorName = (slug?: string) =>
    colors.find((c) => c.slug === slug)?.name ?? "—";
  const sizeLabel = (slug?: string) =>
    sizes.find((s) => s.slug === slug)?.label ?? "One size";

  const total = variants.reduce((sum, v) => sum + (v.inventory || 0), 0);

  if (variants.length === 0) {
    return (
      <p className="border border-stone-dark bg-canvas p-4 text-caption text-ink-soft">
        Add a colour or a size above and the sellable combinations will appear
        here for you to set stock against.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-muted tabular-nums">
          {variants.length +
            (variants.length === 1 ? " combination · " : " combinations · ") +
            total +
            " in stock"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAll(10)}
            className="u-link text-micro uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
          >
            Set all to 10
          </button>
          <span aria-hidden="true" className="text-stone-dark">
            ·
          </span>
          <button
            type="button"
            onClick={() => setAll(0)}
            className="u-link text-micro uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
          >
            Mark all sold out
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-stone bg-paper">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone">
              {["Colour", "Size", "SKU", "Stock", "Price override"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-3 py-2.5 text-micro font-medium uppercase tracking-[0.1em] text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone">
            {variants.map((variant, index) => {
              const soldOut = variant.inventory === 0;
              const low = !soldOut && variant.inventory <= LOW_STOCK_THRESHOLD;

              return (
                <tr key={(variant.colorSlug ?? "-") + ":" + (variant.sizeSlug ?? "-")}>
                  <td className="px-3 py-2 text-caption text-ink">
                    <span className="flex items-center gap-2">
                      {variant.colorSlug && (
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full border border-stone-dark"
                          style={{
                            backgroundColor: colors.find(
                              (c) => c.slug === variant.colorSlug,
                            )?.hex,
                          }}
                        />
                      )}
                      {colorName(variant.colorSlug)}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-caption text-ink">
                    {sizeLabel(variant.sizeSlug)}
                  </td>

                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={"sku-" + index}>
                      {"SKU for " + colorName(variant.colorSlug) + " " + sizeLabel(variant.sizeSlug)}
                    </label>
                    <input
                      id={"sku-" + index}
                      type="text"
                      value={variant.sku}
                      onChange={(event) => update(index, { sku: event.target.value })}
                      className={cell + " min-w-40"}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={"stock-" + index}>
                      {"Stock for " + colorName(variant.colorSlug) + " " + sizeLabel(variant.sizeSlug)}
                    </label>
                    <input
                      id={"stock-" + index}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={variant.inventory}
                      onChange={(event) =>
                        update(index, {
                          inventory: Math.max(0, Math.floor(Number(event.target.value) || 0)),
                        })
                      }
                      className={cn(
                        cell,
                        "w-24",
                        soldOut && "border-sale text-sale",
                        low && "border-accent",
                      )}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <label className="sr-only" htmlFor={"price-" + index}>
                      {"Price override for " + colorName(variant.colorSlug) + " " + sizeLabel(variant.sizeSlug)}
                    </label>
                    <input
                      id={"price-" + index}
                      type="text"
                      inputMode="decimal"
                      value={formatPriceInput(variant.price)}
                      onChange={(event) =>
                        update(index, { price: parsePriceInput(event.target.value) })
                      }
                      placeholder="—"
                      className={cell + " w-28"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-micro leading-relaxed text-muted">
        Leave the price override empty to use the product price. A stock of 0
        marks that combination sold out — the size stays visible on the site,
        disabled, with the reason announced to screen readers.
      </p>

      <div aria-live="polite">
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    </div>
  );
}
