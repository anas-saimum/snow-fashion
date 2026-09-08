"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/admin/product-validation";
import { sizePresets } from "@/lib/admin/size-presets";
import { cn } from "@/lib/utils";
import type { ColorOption, SizeOption } from "@/types";

const input =
  "h-10 border border-stone-dark bg-paper px-3 text-caption text-ink placeholder:text-muted " +
  "focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink";

/* ------------------------------------------------------------------ colours -- */

interface ColorEditorProps {
  colors: ColorOption[];
  onChange: (colors: ColorOption[]) => void;
  error?: string;
}

export function ColorEditor({ colors, onChange, error }: ColorEditorProps) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#111111");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const slug = slugify(trimmed);
    if (colors.some((c) => c.slug === slug)) return;

    onChange([...colors, { name: trimmed, slug, hex }]);
    setName("");
    setHex("#111111");
  };

  return (
    <div className="flex flex-col gap-3">
      {colors.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <li
              key={color.slug}
              className="flex items-center gap-2 border border-stone bg-paper py-1.5 pl-2 pr-1"
            >
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full border border-stone-dark"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-caption text-ink">{color.name}</span>
              <button
                type="button"
                onClick={() => onChange(colors.filter((c) => c.slug !== color.slug))}
                aria-label={"Remove colour " + color.name}
                className="flex size-6 items-center justify-center text-muted hover:text-error"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="new-color-name">
          Colour name
        </label>
        <input
          id="new-color-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Colour name, e.g. Ivory Bloom"
          className={input + " min-w-52 flex-1"}
        />

        <label className="flex items-center gap-2 text-micro text-muted">
          <span className="sr-only sm:not-sr-only">Swatch</span>
          <input
            type="color"
            value={hex}
            onChange={(event) => setHex(event.target.value)}
            aria-label="Colour swatch"
            className="size-10 cursor-pointer border border-stone-dark bg-paper p-1"
          />
        </label>

        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-10 items-center gap-1.5 border border-stone-dark px-3 text-micro font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add
        </button>
      </div>

      <p className="text-micro text-muted">
        The swatch is what shoppers click on the product page. Leave colours
        empty for a product that only comes one way.
      </p>

      <div aria-live="polite">
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- sizes -- */

interface SizeEditorProps {
  sizes: SizeOption[];
  onChange: (sizes: SizeOption[], sizeGuideId?: string) => void;
  error?: string;
}

export function SizeEditor({ sizes, onChange, error }: SizeEditorProps) {
  const [label, setLabel] = useState("");

  const add = () => {
    const trimmed = label.trim();
    if (!trimmed) return;

    const slug = trimmed.toLowerCase();
    if (sizes.some((s) => s.slug === slug)) return;

    onChange([...sizes, { label: trimmed, slug }]);
    setLabel("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {sizePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.sizes, preset.sizeGuideId)}
            className="inline-flex min-h-9 items-center border border-stone px-3 text-micro text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {sizes.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <li
              key={size.slug}
              className="flex items-center gap-1 border border-stone bg-paper py-1.5 pl-3 pr-1"
            >
              <span className="text-caption uppercase text-ink">{size.label}</span>
              <button
                type="button"
                onClick={() => onChange(sizes.filter((s) => s.slug !== size.slug))}
                aria-label={"Remove size " + size.label}
                className="flex size-6 items-center justify-center text-muted hover:text-error"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="new-size-label">
          Size label
        </label>
        <input
          id="new-size-label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Add a size, e.g. XXL or 40"
          className={input + " min-w-52 flex-1"}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-10 items-center gap-1.5 border border-stone-dark px-3 text-micro font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add
        </button>
      </div>

      <div aria-live="polite">
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- list editor -- */

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  className?: string;
}

/** For materials and care instructions: an ordered list of short lines. */
export function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  className,
}: ListEditorProps) {
  const [value, setValue] = useState("");

  const add = () => {
    const trimmed = value.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setValue("");
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-2 border border-stone bg-paper py-2 pl-3 pr-1"
            >
              <span className="flex-1 text-caption text-ink-soft">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={"Remove " + item}
                className="flex size-7 items-center justify-center text-muted hover:text-error"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only">{addLabel}</label>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={input + " min-w-52 flex-1"}
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-10 items-center gap-1.5 border border-stone-dark px-3 text-micro font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
