import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopResults } from "@/components/shop/ShopResults";
import { ShopSkeleton } from "@/components/shop/ShopSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { categoryRepository, productRepository } from "@/lib/repositories";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";
import type { RawSearchParams } from "@/lib/url-state";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

export async function generateStaticParams() {
  const slugs = await categoryRepository.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Any slug not returned above is a genuine 404 — with a 404 *status*, not a
 * soft 404 rendered at 200. This only holds because the page itself never
 * awaits searchParams; see ShopResults for why that matters. Flip to true once
 * categories can appear between deployments.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryRepository.getBySlug(slug);

  if (!category) {
    return pageMetadata({
      title: "Category not found",
      description: "This category could not be found.",
      path: "/category/" + slug,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: category.name,
    description:
      category.description ?? "Shop " + category.name + " at Snow Fashion.",
    path: "/category/" + category.slug,
    image: category.image.url,
    imageAlt: category.image.alt,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = await categoryRepository.getBySlug(slug);
  if (!category) notFound();

  // The unfiltered count is static, so it can go in the structured data
  // without dragging searchParams into this component.
  const [children, parent, unfiltered] = await Promise.all([
    categoryRepository.getChildren(category.slug),
    category.parentSlug
      ? categoryRepository.getBySlug(category.parentSlug)
      : Promise.resolve(null),
    productRepository.list({ categorySlugs: [category.slug], perPage: 1 }),
  ]);

  const trail = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(parent ? [{ name: parent.name, path: "/category/" + parent.slug }] : []),
    { name: category.name, path: "/category/" + category.slug },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={category.description}
        trail={trail}
        image={{ url: category.image.url, alt: category.image.alt }}
      />

      {children.length > 0 && (
        <nav aria-label="Subcategories" className="border-b border-stone">
          <div className="u-container">
            <ul className="u-no-scrollbar flex gap-2 overflow-x-auto py-4">
              {children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={"/category/" + child.slug}
                    className="inline-flex min-h-10 items-center whitespace-nowrap border border-stone px-4 text-caption text-ink transition-colors hover:border-ink hover:bg-canvas"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults
          searchParams={searchParams}
          categorySlug={category.slug}
          hideCategories
        />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            collectionPageSchema(category, unfiltered.total),
            breadcrumbSchema(trail),
          ]),
        }}
      />
    </>
  );
}
