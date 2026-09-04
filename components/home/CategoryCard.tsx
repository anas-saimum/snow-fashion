import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  /** Feature cards span two columns and carry the description. */
  feature?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function CategoryCard({
  category,
  feature = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
}: CategoryCardProps) {
  return (
    <Link
      href={"/category/" + category.slug}
      // Without this the accessible name becomes the photo description
      // concatenated with the label and the CTA — a paragraph read aloud for
      // what is really one link to one category.
      aria-label={category.name}
      className="group relative block overflow-hidden bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
    >
      <div className={cn("relative w-full", feature ? "aspect-4/5 lg:aspect-3/4" : "aspect-3/4")}>
        <Image
          src={category.image.url}
          alt={category.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        {/* Scrim only at the foot, where the label sits. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <h3 className="font-serif text-h3 text-paper">{category.name}</h3>

        {feature && category.description && (
          <p className="mt-2 max-w-sm text-caption leading-relaxed text-paper/80">
            {category.description}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-2 text-micro font-medium uppercase tracking-[0.14em] text-paper">
          Shop now
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
