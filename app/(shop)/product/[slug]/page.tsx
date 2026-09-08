import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductInfoTabs } from "@/components/product/ProductInfoTabs";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { categoryRepository, productRepository } from "@/lib/repositories";
import { sizeGuideById } from "@/data/size-guides";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/structured-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await productRepository.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * A genuine trade-off, and Next requires a literal here so it cannot follow
 * the backend:
 *
 *  * true  — a product created after the last deploy is not in
 *            generateStaticParams, but still resolves. Required for the admin
 *            dashboard to be of any use.
 *  * false — an unknown slug answers with a real 404 *status* instead of a 200
 *            carrying 404 content (a "soft 404"), but anything added after the
 *            build 404s until the next one.
 *
 * We choose true: a working dashboard beats a status code on URLs that nothing
 * links to. The cost is contained — the 404 page is noindex, so it will not be
 * indexed, and the sitemap lists only real products. Unknown *category* URLs
 * still get a hard 404, because that list is static and middleware can check
 * it for free (see middleware.ts).
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.getBySlug(slug);

  if (!product) {
    return pageMetadata({
      title: "Product not found",
      description: "This product could not be found.",
      path: "/product/" + slug,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: product.seo?.title ?? product.name,
    description: product.seo?.description ?? product.shortDescription,
    path: "/product/" + product.slug,
    image: product.images[0]?.url,
    imageAlt: product.images[0]?.alt,
    type: "article",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await productRepository.getBySlug(slug);
  if (!product) notFound();

  const [related, primaryCategory] = await Promise.all([
    productRepository.getRelated(slug, 8),
    categoryRepository.getBySlug(product.categorySlugs[0] ?? ""),
  ]);

  const sizeGuide = product.sizeGuideId
    ? sizeGuideById.get(product.sizeGuideId)
    : undefined;

  const trail = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.name,
            path: "/category/" + primaryCategory.slug,
          },
        ]
      : []),
    { name: product.name, path: "/product/" + product.slug },
  ];

  return (
    <>
      <div className="u-container pb-20 pt-6 lg:pb-28 lg:pt-8">
        <Breadcrumbs trail={trail} />

        <div className="mt-7 lg:mt-10">
          <ProductDetail product={product} sizeGuide={sizeGuide} />
        </div>

        <ProductInfoTabs product={product} />
      </div>

      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="border-t border-stone bg-canvas u-section"
        >
          <div className="u-container">
            <SectionHeader
              eyebrow="You may also like"
              title="Complete the look"
              headingId="related-heading"
              link={{ href: "/shop", label: "Shop all" }}
            />
            <div className="mt-10">
              <ProductCarousel products={related} label="Related products" />
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            // includeRating stays false while ratings are demo placeholders.
            productSchema(product, { includeRating: false }),
            breadcrumbSchema(trail),
          ]),
        }}
      />
    </>
  );
}
