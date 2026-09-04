import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  /** 2 columns on mobile is deliberate — see README on mobile shopping UX. */
  columns?: 3 | 4;
  /** First N cards get priority loading (above the fold). */
  priorityCount?: number;
  className?: string;
}

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
  className,
}: ProductGridProps) {
  const sizes =
    columns === 3
      ? "(min-width: 1024px) 30vw, (min-width: 768px) 30vw, 45vw"
      : "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw";

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            sizes={sizes}
            priority={index < priorityCount}
          />
        </li>
      ))}
    </ul>
  );
}
