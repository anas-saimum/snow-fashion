import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { discountPercent, formatMoney } from "@/lib/pricing";
import { LOW_STOCK_THRESHOLD } from "@/lib/repositories/admin-query";
import type { AdminProductSummary } from "@/types/admin";

/** One row in an admin product list. Read-only; actions live in the table. */
export function AdminProductRow({ product }: { product: AdminProductSummary }) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.inventory === 0;
  const low = !soldOut && product.lowestVariantStock <= LOW_STOCK_THRESHOLD;

  return (
    <li>
      <Link
        href={"/admin/products/" + product.id}
        className="flex items-center gap-4 p-4 transition-colors hover:bg-canvas"
      >
        <div className="relative size-12 shrink-0 overflow-hidden bg-canvas">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? ""}
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-caption font-medium text-ink">
            {product.name}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-micro text-muted">
            <span className="tabular-nums">{formatMoney(product.price)}</span>
            {discount !== null && (
              <span className="text-sale">{"−" + discount + "%"}</span>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {soldOut
                ? "Out of stock"
                : product.inventory + " in stock"}
            </span>
            {low && <span className="text-sale">Low</span>}
          </p>
        </div>

        <StatusBadge status={product.status} />

        <ChevronRight
          className="size-4 shrink-0 text-stone-dark"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
