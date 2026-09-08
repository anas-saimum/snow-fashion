import Link from "next/link";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { adminCategoryRepository, persistenceMode } from "@/lib/repositories";
import type { ProductInput } from "@/types/admin";

/** A new product starts as a draft, so nothing half-finished reaches the shop. */
const BLANK: ProductInput = {
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  categorySlugs: [],
  colors: [],
  sizes: [],
  images: [],
  variants: [],
  materials: [],
  careInstructions: [],
  sizeGuideId: undefined,
  featured: false,
  bestseller: false,
  newArrival: true,
  status: "draft",
  publishedAt: new Date().toISOString(),
};

export default async function NewProductPage() {
  const categories = await adminCategoryRepository.list();

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
          New
        </span>
      </nav>

      <header className="mt-6">
        <h1 className="text-h2">Add a product</h1>
        <p className="mt-2 max-w-xl text-caption text-muted">
          It will be saved as a draft. Set it live once the photographs and
          stock are right.
        </p>
      </header>

      <div className="mt-10">
        <ProductEditor
          productId={null}
          initial={BLANK}
          categories={categories}
          canUpload={persistenceMode === "supabase"}
        />
      </div>
    </div>
  );
}
