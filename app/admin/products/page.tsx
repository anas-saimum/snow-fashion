import { Suspense } from "react";
import { Package } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductFilters } from "@/components/admin/ProductFilters";
import {
  adminCategoryRepository,
  requireAdminProductRepository,
} from "@/lib/repositories";
import { pluralize } from "@/lib/utils";
import type { ProductStatus } from "@/types";
import type { AdminProductListQuery } from "@/types/admin";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

const STATUSES = new Set<ProductStatus | "all">([
  "all",
  "active",
  "draft",
  "archived",
]);

const SORTS = new Set<NonNullable<AdminProductListQuery["sort"]>>([
  "updated",
  "name",
  "price-asc",
  "price-desc",
  "stock-asc",
]);

export default function AdminProductsPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="u-eyebrow">Catalogue</p>
          <h1 className="mt-2 text-h2">Products</h1>
        </div>
        <ButtonLink href="/admin/products/new">Add product</ButtonLink>
      </header>

      <Suspense fallback={<TableSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = STATUSES.has(params.status as ProductStatus)
    ? (params.status as ProductStatus | "all")
    : "all";

  const sort = SORTS.has(params.sort as never)
    ? (params.sort as AdminProductListQuery["sort"])
    : "updated";

  const page = Number(params.page);

  const query: AdminProductListQuery = {
    search: params.q?.trim() || undefined,
    status,
    categorySlug: params.category || undefined,
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: 20,
  };

  const repo = requireAdminProductRepository();
  const [result, categories] = await Promise.all([
    repo.list(query),
    adminCategoryRepository.list(),
  ]);

  const filtered = Boolean(query.search || params.category || status !== "all");

  return (
    <>
      <div className="mt-8">
        <ProductFilters categories={categories} />
      </div>

      <p
        className="mt-5 text-caption text-muted tabular-nums"
        aria-live="polite"
      >
        {result.total + " " + pluralize(result.total, "product")}
        {filtered ? " matching" : ""}
      </p>

      <div className="mt-4">
        {result.items.length === 0 ? (
          <div className="border border-stone bg-paper">
            <EmptyState
              icon={<Package className="size-6" aria-hidden="true" />}
              title={filtered ? "No products match" : "No products yet"}
              description={
                filtered
                  ? "Try a different search term, or clear the filters."
                  : "Add your first product and it will appear on the storefront once you set it live."
              }
              action={
                filtered
                  ? { href: "/admin/products", label: "Clear filters" }
                  : { href: "/admin/products/new", label: "Add product" }
              }
            />
          </div>
        ) : (
          <ProductTable
            products={result.items}
            total={result.total}
            page={result.page}
            perPage={result.perPage}
          />
        )}
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <Skeleton className="h-11 w-full" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
