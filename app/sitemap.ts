import type { MetadataRoute } from "next";
import { categoryRepository, productRepository } from "@/lib/repositories";
import { products } from "@/data/products";
import { absoluteUrl } from "@/lib/seo";

/**
 * Sitemap. Only indexable routes appear — cart, wishlist, checkout and search
 * are deliberately excluded because they are marked noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categorySlugs] = await Promise.all([
    productRepository.getAllSlugs(),
    categoryRepository.getAllSlugs(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/new-arrivals"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/shipping"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/returns"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: absoluteUrl("/category/" + slug),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    return {
      url: absoluteUrl("/product/" + slug),
      lastModified: product ? new Date(product.publishedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
