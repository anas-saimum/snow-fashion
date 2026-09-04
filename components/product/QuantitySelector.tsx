"use client";

import { Minus, Plus } from "lucide-react";
import { clamp } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Announced as the control's purpose, e.g. the product name. */
  label?: string;
  size?: "sm" | "md";
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
  size = "md",
}: QuantitySelectorProps) {
  const dimension = size === "sm" ? "size-9" : "size-11";

  return (
    <div className="inline-flex items-center border border-stone-dark">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1, min, max))}
        disabled={value <= min}
        aria-label={"Decrease " + label.toLowerCase()}
        className={
          dimension +
          " flex items-center justify-center text-ink transition-colors hover:bg-canvas disabled:opacity-30 disabled:hover:bg-transparent"
        }
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>

      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(clamp(next, min, max));
        }}
        className={
          (size === "sm" ? "h-9 w-10" : "h-11 w-12") +
          " border-x border-stone-dark bg-transparent text-center text-caption tabular-nums focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
        }
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1, min, max))}
        disabled={value >= max}
        aria-label={"Increase " + label.toLowerCase()}
        className={
          dimension +
          " flex items-center justify-center text-ink transition-colors hover:bg-canvas disabled:opacity-30 disabled:hover:bg-transparent"
        }
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
