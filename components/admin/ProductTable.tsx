"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { deleteProductAction, setProductStatusAction } from "@/app/admin/actions";
import { discountPercent, formatMoney } from "@/lib/pricing";
import { LOW_STOCK_THRESHOLD } from "@/lib/repositories/admin-query";
import { useUIStore } from "@/store/ui";
import { cn, pluralize } from "@/lib/utils";
import type { AdminProductSummary } from "@/types/admin";

interface ProductTableProps {
  products: AdminProductSummary[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * The product list.
 *
 * A real <table> so it is navigable and announced correctly, with the row
 * actions inline. Publish/unpublish is one click from here because it is the
 * thing you do most; deletion asks first, because it is not undoable.
 */
export function ProductTable({ products, total, page, perPage }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pushToast = useUIStore((s) => s.pushToast);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<AdminProductSummary | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = (
    id: string,
    work: () => Promise<{ ok: boolean; message?: string }>,
  ) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await work();
      setBusyId(null);
      pushToast({
        title: result.ok ? (result.message ?? "Done.") : "Something went wrong",
        description: result.ok ? undefined : result.message,
      });
      if (result.ok) router.refresh();
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const goToPage = (next: number) => {
    const search = new URLSearchParams(params.toString());
    if (next <= 1) search.delete("page");
    else search.set("page", String(next));
    const qs = search.toString();
    router.push(pathname + (qs ? "?" + qs : ""), { scroll: false });
  };

  return (
    <>
      <div className="overflow-x-auto border border-stone bg-paper">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">
            {"Products, page " + page + " of " + totalPages}
          </caption>
          <thead>
            <tr className="border-b border-stone">
              {["Product", "Price", "Stock", "Status", "Actions"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-micro font-medium uppercase tracking-[0.1em] text-muted",
                    heading === "Actions" && "text-right",
                  )}
                >
                  {heading === "Actions" ? (
                    <span className="sr-only">Actions</span>
                  ) : (
                    heading
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone">
            {products.map((product) => {
              const discount = discountPercent(product.price, product.compareAtPrice);
              const soldOut = product.inventory === 0;
              const low = !soldOut && product.lowestVariantStock <= LOW_STOCK_THRESHOLD;
              const busy = pending && busyId === product.id;

              return (
                <tr
                  key={product.id}
                  className={cn("align-middle", busy && "opacity-50")}
                >
                  <th scope="row" className="px-4 py-3 font-normal">
                    <Link
                      href={"/admin/products/" + product.id}
                      className="flex items-center gap-3"
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden bg-canvas">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-caption font-medium text-ink">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block truncate text-micro text-muted">
                          {"/" + product.slug}
                        </span>
                      </span>
                    </Link>
                  </th>

                  <td className="px-4 py-3">
                    <span className="block text-caption tabular-nums text-ink">
                      {formatMoney(product.price)}
                    </span>
                    {discount !== null && (
                      <span className="mt-0.5 block text-micro text-sale tabular-nums">
                        {"was " + formatMoney(product.compareAtPrice!) + " · −" + discount + "%"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "block text-caption tabular-nums",
                        soldOut ? "text-sale" : "text-ink",
                      )}
                    >
                      {soldOut ? "Out of stock" : product.inventory}
                    </span>
                    <span className="mt-0.5 block text-micro text-muted">
                      {product.variantCount +
                        " " +
                        pluralize(product.variantCount, "variant") +
                        (low ? " · low" : "")}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(product.id, () =>
                            setProductStatusAction(
                              product.id,
                              product.status === "active" ? "draft" : "active",
                            ),
                          )
                        }
                        aria-label={
                          (product.status === "active" ? "Unpublish " : "Publish ") +
                          product.name
                        }
                        title={
                          product.status === "active"
                            ? "Take off the site"
                            : "Put live on the site"
                        }
                        className="flex size-9 items-center justify-center text-ink-soft transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
                      >
                        {product.status === "active" ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>

                      <Link
                        href={"/admin/products/" + product.id}
                        aria-label={"Edit " + product.name}
                        className="flex size-9 items-center justify-center text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setConfirming(product)}
                        aria-label={"Delete " + product.name}
                        className="flex size-9 items-center justify-center text-ink-soft transition-colors hover:bg-canvas hover:text-error disabled:opacity-40"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Product list pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </Button>
          <p className="text-micro text-muted tabular-nums">
            {"Page " + page + " of " + totalPages}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Delete this product?"
        size="sm"
      >
        <div className="p-6">
          <p className="text-caption leading-relaxed text-ink-soft">
            {'"' +
              (confirming?.name ?? "") +
              '" will be removed permanently, along with its images, sizes and stock. This cannot be undone.'}
          </p>
          <p className="mt-3 text-caption leading-relaxed text-muted">
            If you only want it off the site, unpublish it instead — that keeps
            everything and you can put it back later.
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setConfirming(null)}
            >
              Keep it
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={pending}
              onClick={() => {
                const target = confirming;
                setConfirming(null);
                if (target) run(target.id, () => deleteProductAction(target.id));
              }}
            >
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
