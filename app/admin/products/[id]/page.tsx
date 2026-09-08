import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { inputFromProduct } from "@/lib/repositories/product-mapper";
import {
  adminCategoryRepository,
  persistenceMode,
  requireAdminProductRepository,
} from "@/lib/repositories";
import { formatMoney } from "@/lib/pricing";
import { pluralize } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = requireAdminProductRepository();

  const [product, categories] = await Promise.all([
    repo.getById(id),
    adminCategoryRepository.list(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <nav aria-label="Breadcrumb" className="text-micro text-muted">
        <Link href="/admin/products" className="u-link hover:text-ink">
          Products
        </Link>
        <span aria-hidden="true" className="px-2 text-stone-dark">
          /
        </span>
        <span aria-current="page" className="text-ink">
          {product.name}
        </span>
      </nav>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{product.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted tabular-nums">
            <span>{formatMoney(product.price, product.currency)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {product.inventory +
                " in stock across " +
                product.variants.length +
                " " +
                pluralize(product.variants.length, "combination")}
            </span>
          </p>
        </div>
        <StatusBadge status={product.status} />
      </header>

      <div className="mt-10">
        <ProductEditor
          productId={product.id}
          initial={inputFromProduct(product)}
          categories={categories}
          canUpload={persistenceMode === "supabase"}
        />
      </div>
    </div>
  );
}
