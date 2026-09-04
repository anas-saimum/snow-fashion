import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

/**
 * Horizontal product rail. CSS scroll-snap only — no carousel library, no
 * JavaScript, and it degrades to a normal scroll container.
 */
export function ProductCarousel({
  products,
  label,
}: {
  products: Product[];
  label: string;
}) {
  return (
    <div
      className="u-no-scrollbar -mx-5 overflow-x-auto overscroll-x-contain px-5 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <ul className="flex snap-x snap-mandatory gap-4 pb-1 lg:gap-6">
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[64%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[23.5%]"
          >
            <ProductCard
              product={product}
              sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 64vw"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
