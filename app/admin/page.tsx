import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Boxes,
  FileEdit,
  PackageX,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AdminProductRow } from "@/components/admin/AdminProductRow";
import { ImportDemoCatalogue } from "@/components/admin/ImportDemoCatalogue";
import { LOW_STOCK_THRESHOLD } from "@/lib/repositories/admin-query";
import { persistenceMode, requireAdminProductRepository } from "@/lib/repositories";
import { formatMoney } from "@/lib/pricing";
import { pluralize } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const repo = requireAdminProductRepository();

  const [stats, needsAttention, recent] = await Promise.all([
    repo.stats(),
    repo.list({ lowStockAtOrBelow: LOW_STOCK_THRESHOLD, sort: "stock-asc", perPage: 6 }),
    repo.list({ sort: "updated", perPage: 5 }),
  ]);

  // A fresh Supabase project is empty, which leaves the storefront looking
  // broken. Offer the demo catalogue as a starting point.
  if (stats.totalProducts === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <header>
          <p className="u-eyebrow">Overview</p>
          <h1 className="mt-2 text-h2">Your catalogue is empty</h1>
        </header>
        <div className="mt-8">
          <ImportDemoCatalogue canImport={persistenceMode === "supabase"} />
        </div>
      </div>
    );
  }

  const tiles = [
    {
      label: "Live products",
      value: String(stats.activeProducts),
      detail: stats.totalProducts + " in the catalogue",
      Icon: Boxes,
    },
    {
      label: "Drafts",
      value: String(stats.draftProducts),
      detail: stats.draftProducts === 0 ? "Nothing waiting" : "Not on the site yet",
      Icon: FileEdit,
    },
    {
      label: "Out of stock",
      value: String(stats.outOfStockProducts),
      detail:
        stats.outOfStockProducts === 0
          ? "Everything is available"
          : "Still listed, but unbuyable",
      Icon: PackageX,
      alert: stats.outOfStockProducts > 0,
    },
    {
      label: "On sale",
      value: String(stats.onSaleProducts),
      detail: "Have an original price set",
      Icon: BadgePercent,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="u-eyebrow">Overview</p>
          <h1 className="mt-2 text-h2">Your catalogue</h1>
        </div>
        <ButtonLink href="/admin/products/new">Add product</ButtonLink>
      </header>

      {/* Stat tiles */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border border-stone bg-paper p-5">
            <div className="flex items-start justify-between gap-3">
              <dt className="u-eyebrow text-muted">{tile.label}</dt>
              <tile.Icon
                className={
                  "size-4 shrink-0 " + (tile.alert ? "text-sale" : "text-accent")
                }
                aria-hidden="true"
              />
            </div>
            <dd className="mt-3 font-serif text-h2 tabular-nums text-ink">
              {tile.value}
            </dd>
            <dd className="mt-1 text-micro text-muted">{tile.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border border-stone bg-paper p-5">
          <p className="u-eyebrow text-muted">Total stock</p>
          <p className="mt-3 font-serif text-h3 tabular-nums text-ink">
            {stats.totalInventory + " " + pluralize(stats.totalInventory, "unit")}
          </p>
        </div>
        <div className="border border-stone bg-paper p-5">
          <p className="u-eyebrow text-muted">Stock value at retail</p>
          <p className="mt-3 font-serif text-h3 tabular-nums text-ink">
            {formatMoney(stats.inventoryValue)}
          </p>
          <p className="mt-1 text-micro text-muted">
            Every unit in stock at its selling price.
          </p>
        </div>
      </div>

      {/* Needs attention */}
      <section aria-labelledby="attention-heading" className="mt-12">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-sale" aria-hidden="true" />
          <h2 id="attention-heading" className="u-eyebrow text-ink">
            Needs attention
          </h2>
        </div>

        {needsAttention.items.length === 0 ? (
          <p className="mt-4 border border-stone bg-paper p-5 text-caption text-muted">
            Nothing is low on stock. Every size of every product has more than{" "}
            {LOW_STOCK_THRESHOLD} in stock.
          </p>
        ) : (
          <>
            <p className="mt-2 text-caption text-muted">
              {"At or below " + LOW_STOCK_THRESHOLD + " in stock on at least one size."}
            </p>
            <ul className="mt-4 divide-y divide-stone border border-stone bg-paper">
              {needsAttention.items.map((product) => (
                <AdminProductRow key={product.id} product={product} />
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Recently edited */}
      <section aria-labelledby="recent-heading" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent-heading" className="u-eyebrow text-ink">
            Recently updated
          </h2>
          <Link
            href="/admin/products"
            className="group inline-flex items-center gap-2 text-micro font-medium uppercase tracking-[0.12em] text-ink"
          >
            <span className="u-link">All products</span>
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-stone border border-stone bg-paper">
          {recent.items.map((product) => (
            <AdminProductRow key={product.id} product={product} />
          ))}
        </ul>
      </section>
    </div>
  );
}
