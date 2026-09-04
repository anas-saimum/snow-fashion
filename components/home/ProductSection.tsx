import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductSectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  products: Product[];
  /** A rail scrolls on mobile; a grid wraps. */
  layout?: "carousel" | "grid";
  tone?: "paper" | "canvas";
}

/**
 * One section shell serves New Arrivals and Best Sellers — same structure,
 * different data. Nothing about either is special-cased.
 */
export function ProductSection({
  id,
  eyebrow,
  title,
  description,
  link,
  products,
  layout = "carousel",
  tone = "paper",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={id + "-heading"}
      className={cn("u-section", tone === "canvas" && "bg-canvas")}
    >
      <div className="u-container">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          headingId={id + "-heading"}
          description={description}
          link={link}
        />

        <Reveal className="mt-10">
          {layout === "carousel" ? (
            <ProductCarousel products={products} label={title} />
          ) : (
            <ProductGrid products={products} />
          )}
        </Reveal>
      </div>
    </section>
  );
}
