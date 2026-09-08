"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ColorEditor, ListEditor, SizeEditor } from "./OptionEditors";
import { ImageManager } from "./ImageManager";
import { VariantGrid } from "./VariantGrid";
import { saveProductAction } from "@/app/admin/actions";
import {
  formatPriceInput,
  parsePriceInput,
  slugify,
} from "@/lib/admin/product-validation";
import { sizeGuideOptions } from "@/lib/admin/size-presets";
import { buildVariantGrid } from "@/lib/repositories/product-mapper";
import { discountPercent, formatMoney } from "@/lib/pricing";
import { useUIStore } from "@/store/ui";
import type { Category, ColorOption, ProductStatus, SizeOption } from "@/types";
import type { ProductInput } from "@/types/admin";

interface ProductEditorProps {
  /** Null when creating. */
  productId: string | null;
  initial: ProductInput;
  categories: Category[];
  canUpload: boolean;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft — not on the site" },
  { value: "active", label: "Live — visible to shoppers" },
  { value: "archived", label: "Archived — hidden, kept for records" },
];

/**
 * The product editor.
 *
 * One form, sectioned, with the variant grid derived from the chosen colours
 * and sizes. Deriving it means the shopkeeper cannot create a combination
 * that has no colour to pick or a size that is not offered — the two ways a
 * hand-managed variant list goes wrong.
 */
export function ProductEditor({
  productId,
  initial,
  categories,
  canUpload,
}: ProductEditorProps) {
  const router = useRouter();
  const pushToast = useUIStore((s) => s.pushToast);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<ProductInput>(initial);
  const [priceText, setPriceText] = useState(formatPriceInput(initial.price));
  const [compareText, setCompareText] = useState(
    formatPriceInput(initial.compareAtPrice),
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | undefined>();

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key as string]) {
      setErrors((current) => ({ ...current, [key as string]: "" }));
    }
  };

  /** Colours and sizes drive the variant grid; existing stock is preserved. */
  const syncVariants = (
    colors: ColorOption[],
    sizes: SizeOption[],
    slug: string,
  ) => {
    setForm((current) => ({
      ...current,
      colors,
      sizes,
      variants: buildVariantGrid(
        slug || current.slug,
        colors.map((c) => c.slug),
        sizes.map((s) => s.slug),
        current.variants,
      ),
    }));
  };

  const discount = useMemo(
    () => discountPercent(form.price, form.compareAtPrice),
    [form.price, form.compareAtPrice],
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    startTransition(async () => {
      const result = await saveProductAction(productId, form);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message);

        // Put the first problem on screen rather than leaving them to hunt.
        const firstKey = Object.keys(result.fieldErrors ?? {})[0];
        if (firstKey) {
          document
            .querySelector<HTMLElement>('[data-field="' + firstKey + '"]')
            ?.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        return;
      }

      setErrors({});
      pushToast({
        title: result.message ?? "Saved.",
        description: form.name,
        href: form.status === "active" ? "/product/" + form.slug : undefined,
        hrefLabel: "View on site",
      });

      if (!productId && result.data) {
        router.replace("/admin/products/" + result.data.id);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      {/* ------------------------------------------------------------ basics */}
      <Section
        title="Basics"
        description="What the product is called and how shoppers find it."
      >
        <div data-field="name">
          <Input
            label="Product name"
            required
            value={form.name}
            error={errors.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({ ...current, name }));
              if (!slugTouched) {
                const slug = slugify(name);
                setForm((current) => ({ ...current, slug }));
              }
            }}
          />
        </div>

        <div data-field="slug">
          <Input
            label="Web address"
            required
            value={form.slug}
            error={errors.slug}
            hint={"snowfashion.com/product/" + (form.slug || "…")}
            onChange={(event) => {
              setSlugTouched(true);
              set("slug", slugify(event.target.value));
            }}
          />
        </div>

        <div data-field="shortDescription">
          <Input
            label="One-line description"
            required
            value={form.shortDescription}
            error={errors.shortDescription}
            hint="Shown on product cards and in search results."
            onChange={(event) => set("shortDescription", event.target.value)}
          />
        </div>

        <Textarea
          label="Full description"
          rows={6}
          value={form.description}
          hint="Appears under Product Information on the product page."
          onChange={(event) => set("description", event.target.value)}
        />
      </Section>

      {/* ------------------------------------------------------------- price */}
      <Section
        title="Price"
        description="Set an original price to show a discount. The percentage is worked out for you."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div data-field="price">
            <Input
              label="Price (USD)"
              required
              inputMode="decimal"
              value={priceText}
              error={errors.price}
              onChange={(event) => {
                setPriceText(event.target.value);
                set("price", parsePriceInput(event.target.value) ?? 0);
              }}
            />
          </div>

          <div data-field="compareAtPrice">
            <Input
              label="Original price (optional)"
              inputMode="decimal"
              value={compareText}
              error={errors.compareAtPrice}
              hint="Leave empty if the item is not on sale."
              onChange={(event) => {
                setCompareText(event.target.value);
                set("compareAtPrice", parsePriceInput(event.target.value));
              }}
            />
          </div>
        </div>

        <div
          aria-live="polite"
          className="border border-stone bg-canvas px-4 py-3 text-caption"
        >
          {discount !== null ? (
            <p className="text-ink">
              <span className="font-medium text-sale">
                {"−" + discount + "% off"}
              </span>{" "}
              — shoppers see {formatMoney(form.price)}, was{" "}
              <span className="line-through">
                {formatMoney(form.compareAtPrice!)}
              </span>
              , saving {formatMoney(form.compareAtPrice! - form.price)}.
            </p>
          ) : (
            <p className="text-muted">
              {form.price > 0
                ? "No discount — shoppers see " + formatMoney(form.price) + "."
                : "Enter a price to preview what shoppers will see."}
            </p>
          )}
        </div>
      </Section>

      {/* -------------------------------------------------------- categories */}
      <Section
        title="Categories"
        description="Where the product appears in the navigation and filters."
      >
        <fieldset data-field="categorySlugs">
          <legend className="sr-only">Categories</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {categories.map((category) => {
              const checked = form.categorySlugs.includes(category.slug);
              return (
                <li key={category.slug}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-stone bg-paper px-3 text-caption text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        set(
                          "categorySlugs",
                          checked
                            ? form.categorySlugs.filter((s) => s !== category.slug)
                            : [...form.categorySlugs, category.slug],
                        )
                      }
                      className="size-4 shrink-0 cursor-pointer appearance-none border border-stone-dark bg-paper checked:border-ink checked:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    />
                    {category.name}
                  </label>
                </li>
              );
            })}
          </ul>
          {errors.categorySlugs && (
            <p className="mt-2 text-caption text-error">{errors.categorySlugs}</p>
          )}
        </fieldset>
      </Section>

      {/* ------------------------------------------------------------ photos */}
      <Section
        title="Photographs"
        description="The first image is the card image; the second shows on hover in the grid."
      >
        <div data-field="images">
          <ImageManager
            images={form.images}
            onChange={(images) => set("images", images)}
            colors={form.colors}
            canUpload={canUpload}
            error={errors.images}
          />
        </div>
      </Section>

      {/* ----------------------------------------------------------- options */}
      <Section
        title="Colours and sizes"
        description="These build the sellable combinations below."
      >
        <div className="flex flex-col gap-7">
          <div data-field="colors">
            <p className="u-eyebrow mb-3 text-ink">Colours</p>
            <ColorEditor
              colors={form.colors}
              onChange={(colors) => syncVariants(colors, form.sizes, form.slug)}
              error={errors.colors}
            />
          </div>

          <div data-field="sizes">
            <p className="u-eyebrow mb-3 text-ink">Sizes</p>
            <SizeEditor
              sizes={form.sizes}
              onChange={(sizes, sizeGuideId) => {
                syncVariants(form.colors, sizes, form.slug);
                if (sizeGuideId !== undefined) {
                  setForm((current) => ({ ...current, sizeGuideId }));
                }
              }}
              error={errors.sizes}
            />
          </div>

          <Select
            label="Size guide"
            options={sizeGuideOptions}
            value={form.sizeGuideId ?? ""}
            onChange={(event) => set("sizeGuideId", event.target.value || undefined)}
            hint="Shown as a table beside the size picker."
          />
        </div>
      </Section>

      {/* ---------------------------------------------------------- variants */}
      <Section
        title="Stock"
        description="Every combination a shopper can buy, and how many you have."
      >
        <div data-field="variants">
          <VariantGrid
            variants={form.variants}
            onChange={(variants) => set("variants", variants)}
            colors={form.colors}
            sizes={form.sizes}
            error={errors.variants}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------ detail */}
      <Section
        title="Materials and care"
        description="Listed under Product Information on the product page."
      >
        <div className="flex flex-col gap-7">
          <div>
            <p className="u-eyebrow mb-3 text-ink">Materials</p>
            <ListEditor
              items={form.materials}
              onChange={(materials) => set("materials", materials)}
              placeholder="e.g. 100% viscose"
              addLabel="Add material"
            />
          </div>

          <div>
            <p className="u-eyebrow mb-3 text-ink">Care instructions</p>
            <ListEditor
              items={form.careInstructions}
              onChange={(care) => set("careInstructions", care)}
              placeholder="e.g. Machine wash at 30°C"
              addLabel="Add instruction"
            />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------- merchandising */}
      <Section
        title="Merchandising"
        description="Where the product is promoted on the storefront."
      >
        <ul className="flex flex-col gap-2">
          {(
            [
              ["newArrival", "New arrival", "Appears in New Arrivals and gets a New badge"],
              ["bestseller", "Best seller", "Appears in the Best Sellers row"],
              ["featured", "Featured", "Promoted first in Featured sorting"],
            ] as const
          ).map(([key, label, detail]) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3 border border-stone bg-paper p-3">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => set(key, event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none border border-stone-dark bg-paper checked:border-ink checked:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                />
                <span>
                  <span className="block text-caption font-medium text-ink">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-micro text-muted">{detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Section>

      {/* --------------------------------------------------------------- SEO */}
      <Section
        title="Search engines"
        description="Leave empty to use the product name and one-line description."
      >
        <Input
          label="Page title override"
          value={form.seoTitle ?? ""}
          onChange={(event) => set("seoTitle", event.target.value || undefined)}
        />
        <Textarea
          label="Meta description override"
          rows={3}
          value={form.seoDescription ?? ""}
          onChange={(event) => set("seoDescription", event.target.value || undefined)}
        />
      </Section>

      {/* ------------------------------------------------------------ status */}
      <Section
        title="Visibility"
        description="Drafts are invisible to shoppers, so you can prepare a product before it goes live."
      >
        <div data-field="status">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            error={errors.status}
            onChange={(event) => set("status", event.target.value as ProductStatus)}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------ actions */}
      <div className="sticky bottom-0 -mx-4 border-t border-stone bg-paper px-4 py-4 lg:-mx-8 lg:px-8">
        <div aria-live="polite">
          {formError && (
            <p className="mb-3 border border-error bg-paper p-3 text-caption text-error">
              {formError}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={pending}>
            {pending
              ? "Saving…"
              : productId
                ? "Save changes"
                : "Create product"}
          </Button>

          <Link
            href="/admin/products"
            className="u-link text-caption text-muted hover:text-ink"
          >
            Back to products
          </Link>

          {productId && form.status === "active" && (
            <a
              href={"/product/" + form.slug}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-[0.1em] text-ink"
            >
              <span className="u-link">View on site</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <div>
        <h2 className="font-sans text-caption font-medium uppercase tracking-[0.12em] text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-micro leading-relaxed text-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
