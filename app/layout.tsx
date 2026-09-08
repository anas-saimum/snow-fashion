import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/Toaster";
import { siteConfig } from "@/config/site.config";
import { OG_IMAGE, absoluteUrl } from "@/lib/seo";

/**
 * Root layout: document shell only.
 *
 * The storefront chrome (header, footer, overlays) lives in
 * app/(shop)/layout.tsx, and the admin has its own in app/admin/layout.tsx,
 * so the dashboard does not inherit a shop header and cart drawer.
 */

/* Two faces only. Self-hosted by next/font, so no layout shift and no
   third-party request at runtime. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name + " — " + siteConfig.tagline,
    template: "%s | " + siteConfig.name,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "fashion",
    "clothing",
    "womens fashion",
    "mens fashion",
    "dresses",
    "traditional wear",
    "accessories",
    "Snow Fashion",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name + " — " + siteConfig.tagline,
    description: siteConfig.description,
    locale: siteConfig.locale.replace("-", "_"),
    images: [
      {
        url: absoluteUrl(OG_IMAGE),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name + " — " + siteConfig.tagline,
    description: siteConfig.description,
    images: [absoluteUrl(OG_IMAGE)],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable + " " + cormorant.variable}>
      <body className="flex min-h-dvh flex-col bg-paper antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
