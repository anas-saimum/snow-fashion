import { StorefrontChrome } from "@/components/layout/StorefrontChrome";
import { getSiteSettings } from "@/lib/repositories/settings.public";

/** Every customer-facing page. The admin deliberately does not use this. */
export default async function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { logoUrl } = await getSiteSettings();

  return <StorefrontChrome logoUrl={logoUrl}>{children}</StorefrontChrome>;
}
