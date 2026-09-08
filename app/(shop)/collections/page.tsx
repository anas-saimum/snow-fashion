import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { collectionRepository, productRepository } from "@/lib/repositories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Collections",
  description:
    "Explore the Snow Fashion collections — Winter 2026, The Essentials and Occasion.",
  path: "/collections",
  image: "/images/editorial/winter-collection.jpg",
});

export default async function CollectionsPage() {
  const collections = await collectionRepository.list();

  const withProducts = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: await productRepository.getManyByIds(collection.productIds),
    })),
  );

  return (
    <>
      <PageHeader
        eyebrow="Curated edits"
        title="Collections"
        description="Three edits, each built around a different way of dressing."
        trail={[
          { name: "Home", path: "/" },
          { name: "Collections", path: "/collections" },
        ]}
      />

      {withProducts.map(({ collection, products }, index) => (
        <section
          key={collection.id}
          id={collection.slug}
          aria-labelledby={collection.slug + "-heading"}
          className={
            "u-section scroll-mt-32 " + (index % 2 === 1 ? "bg-canvas" : "")
          }
        >
          <div className="u-container">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={index % 2 === 1 ? "lg:order-2" : undefined}>
                <div className="relative aspect-4/5 w-full overflow-hidden bg-stone">
                  <Image
                    src={collection.heroImage.url}
                    alt={collection.heroImage.alt}
                    fill
                    sizes="(min-width: 1024px) 48vw, 92vw"
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <Reveal delay={90} className="max-w-lg">
                <p className="u-eyebrow">{collection.subtitle}</p>
                <h2 id={collection.slug + "-heading"} className="mt-4 text-h1">
                  {collection.title}
                </h2>
                <p className="mt-6 text-lead leading-relaxed text-ink-soft">
                  {collection.description}
                </p>
                <ButtonLink href="/shop" size="lg" className="mt-8">
                  Shop the edit
                </ButtonLink>
              </Reveal>
            </div>

            {products.length > 0 && (
              <div className="mt-14">
                <ProductCarousel
                  products={products}
                  label={collection.title + " products"}
                />
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
