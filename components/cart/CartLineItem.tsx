"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { formatMoney } from "@/lib/pricing";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

interface CartLineItemProps {
  item: CartItem;
  /** Compact suits the drawer; roomy suits the cart page. */
  layout?: "compact" | "roomy";
}

export function CartLineItem({ item, layout = "compact" }: CartLineItemProps) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const compact = layout === "compact";
  const lineTotal = item.unitPrice * item.quantity;

  const meta = [item.colorName, item.sizeLabel].filter(Boolean).join(" · ");

  return (
    <li className={cn("flex gap-4", compact ? "py-5" : "py-6")}>
      <Link
        href={"/product/" + item.slug}
        className="relative shrink-0 overflow-hidden bg-canvas"
        aria-label={item.name}
      >
        <div className={cn("relative", compact ? "h-28 w-21" : "h-36 w-27 sm:h-44 sm:w-33")}>
          {item.image && (
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="140px"
              className="object-cover"
            />
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-sans text-caption font-medium text-ink">
              <Link href={"/product/" + item.slug} className="hover:text-accent">
                {item.name}
              </Link>
            </h3>
            {meta && <p className="mt-1 text-micro text-muted">{meta}</p>}
          </div>

          <button
            type="button"
            onClick={() => remove(item.key)}
            aria-label={"Remove " + item.name + " from cart"}
            className="-mr-1 -mt-1 shrink-0 p-1.5 text-muted transition-colors hover:text-error"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <QuantitySelector
            value={item.quantity}
            onChange={(next) => setQuantity(item.key, next)}
            max={item.maxQuantity}
            size="sm"
            label={"quantity of " + item.name}
          />

          <div className="text-right">
            <p className="text-caption font-medium tabular-nums text-ink">
              {formatMoney(lineTotal)}
            </p>
            {item.quantity > 1 && (
              <p className="text-micro text-muted tabular-nums">
                {formatMoney(item.unitPrice) + " each"}
              </p>
            )}
          </div>
        </div>

        {item.quantity >= item.maxQuantity && (
          <p className="mt-2 text-micro text-muted">
            {"Only " + item.maxQuantity + " available"}
          </p>
        )}
      </div>
    </li>
  );
}
