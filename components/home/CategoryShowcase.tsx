import { CategoryCard } from "./CategoryCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import type { Category } from "@/types";

/**
 * Asymmetric category grid: the first two categories run large, the rest
 * follow in a four-up row. Editorial rather than a uniform tile wall.
 */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const [first, second, ...rest] = categories;

  return (
    <section aria-labelledby="categories-heading" className="u-section">
      <div className="u-container">
        <SectionHeader
          eyebrow="Shop by category"
          title="Find your silhouette"
          headingId="categories-heading"
          description="Eight edits, from everyday cotton to floor-length occasion pieces."
          link={{ href: "/shop", label: "View all" }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:gap-6">
          {first && (
            <Reveal>
              <CategoryCard
                category={first}
                feature
                sizes="(min-width: 640px) 48vw, 90vw"
              />
            </Reveal>
          )}
          {second && (
            <Reveal delay={80}>
              <CategoryCard
                category={second}
                feature
                sizes="(min-width: 640px) 48vw, 90vw"
              />
            </Reveal>
          )}
        </div>

        {rest.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
            {rest.map((category, index) => (
              <Reveal key={category.id} delay={index * 60}>
                <CategoryCard
                  category={category}
                  sizes="(min-width: 1024px) 31vw, 45vw"
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
