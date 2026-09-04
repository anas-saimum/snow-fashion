"use client";

import { cn } from "@/lib/utils";
import type { ColorOption, SizeOption } from "@/types";

/* ------------------------------ colour swatches --------------------------- */

interface ColorSwatchesProps {
  colors: ColorOption[];
  value?: string;
  onChange: (slug: string) => void;
  size?: "sm" | "md";
}

export function ColorSwatches({
  colors,
  value,
  onChange,
  size = "md",
}: ColorSwatchesProps) {
  if (colors.length <= 1) return null;
  const dimension = size === "sm" ? "size-6" : "size-8";

  return (
    <fieldset>
      <legend className="sr-only">Colour</legend>
      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((color) => {
          const selected = color.slug === value;

          return (
            <button
              key={color.slug}
              type="button"
              onClick={() => onChange(color.slug)}
              aria-pressed={selected}
              title={color.name}
              className={cn(
                "relative flex items-center justify-center rounded-full transition-transform",
                dimension,
                selected
                  ? "ring-1 ring-ink ring-offset-2 ring-offset-paper"
                  : "hover:scale-105",
              )}
            >
              <span
                aria-hidden="true"
                className="size-full rounded-full border border-stone-dark"
                style={{ backgroundColor: color.hex }}
              />
              <span className="sr-only">{color.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------- size selector ---------------------------- */

interface SizeSelectorProps {
  sizes: SizeOption[];
  value?: string;
  onChange: (slug: string) => void;
  /** Slugs that are in stock for the chosen colour. */
  available: Set<string>;
  size?: "sm" | "md";
}

export function SizeSelector({
  sizes,
  value,
  onChange,
  available,
  size = "md",
}: SizeSelectorProps) {
  if (sizes.length === 1 && sizes[0].slug === "one size") return null;

  return (
    <fieldset>
      <legend className="sr-only">Size</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((option) => {
          const selected = option.slug === value;
          const inStock = available.has(option.slug);

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => inStock && onChange(option.slug)}
              disabled={!inStock}
              aria-pressed={selected}
              className={cn(
                "relative border text-micro font-medium uppercase tracking-[0.08em] transition-colors",
                size === "sm" ? "min-h-9 min-w-11 px-2.5" : "min-h-11 min-w-13 px-3",
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-stone-dark text-ink hover:border-ink",
                !inStock &&
                  "cursor-not-allowed border-stone text-stone-dark hover:border-stone",
              )}
            >
              {option.label}
              {!inStock && (
                <>
                  {/* Diagonal strike communicates sold out without colour alone. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="h-px w-[130%] rotate-[-32deg] bg-stone-dark" />
                  </span>
                  <span className="sr-only"> — out of stock</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
