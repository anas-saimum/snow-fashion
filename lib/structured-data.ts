import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl } from "@/lib/seo";
import type { Category, Product } from "@/types";

/**
 * JSON-LD builders. Only facts we actually hold are emitted — in particular
 * `aggregateRating` is omitted unless real review data exists, because
 * publishing placeholder ratings as structured data would be misleading to
 * both customers and search engines.
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    sameAs: [
      siteConfig.social.instagram.url,
      siteConfig.social.facebook.url,
      siteConfig.social.tiktok.url,
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product: Product, opts: { includeRating?: boolean } = {}) {
  const image = product.images.map((i) => absoluteUrl(i.url));
  const inStock = product.inventory > 0;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: brand.legalName },
    category: product.categorySlugs[0],
    material: product.materials?.join(", "),
    offers: {
      "@type": "Offer",
      url: absoluteUrl("/product/" + product.slug),
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // Placeholder ratings are never published as structured data.
  if (opts.includeRating && product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}

export function breadcrumbSchema(
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function collectionPageSchema(category: Category, productCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: absoluteUrl("/category/" + category.slug),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount,
    },
  };
}
