import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const OG_IMAGE = "/images/editorial/promo-banner.jpg";

export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : base + (path.startsWith("/") ? path : "/" + path);
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

/** One place that knows how a Snow Fashion page describes itself. */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
  imageAlt,
  noIndex = false,
  type = "website",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.locale.replace("-", "_"),
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
