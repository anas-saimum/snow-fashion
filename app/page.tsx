import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { EditorialCollection } from "@/components/home/EditorialCollection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ValueProps } from "@/components/home/ValueProps";
import { SocialGallery } from "@/components/home/SocialGallery";
import {
  categoryRepository,
  collectionRepository,
  productRepository,
} from "@/lib/repositories";

/**
 * The homepage composes sections; it holds no product knowledge of its own.
 * All data comes through repositories, so this file is untouched when the
 * catalogue moves to a real backend.
 */
export default async function HomePage() {
  const [categories, newArrivals, bestSellers, winter] = await Promise.all([
    categoryRepository.getFeatured(),
    productRepository.list({
      flags: { newArrival: true },
      sort: "newest",
      perPage: 8,
    }),
    productRepository.list({
      flags: { bestseller: true },
      sort: "best-selling",
      perPage: 8,
    }),
    collectionRepository.getBySlug("winter-2026"),
  ]);

  return (
    <>
      <Hero />

      <CategoryShowcase categories={categories} />

      <ProductSection
        id="new-arrivals"
        eyebrow="Just in"
        title="New Arrivals"
        description="The latest pieces to join the collection, added this season."
        link={{ href: "/new-arrivals", label: "Shop new in" }}
        products={newArrivals.items}
      />

      {winter && <EditorialCollection collection={winter} />}

      <ProductSection
        id="best-sellers"
        eyebrow="Loved most"
        title="Best Sellers"
        description="The pieces our customers return to again and again."
        link={{ href: "/shop?sort=best-selling", label: "Shop best sellers" }}
        products={bestSellers.items}
      />

      <PromoBanner />

      <ValueProps />

      <SocialGallery />
    </>
  );
}
