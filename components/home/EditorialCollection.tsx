import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Collection } from "@/types";

/**
 * The large editorial block. Two overlapping images and a copy panel that
 * sits on canvas, so it reads as a magazine spread rather than a banner.
 */
export function EditorialCollection({
  collection,
}: {
  collection: Collection;
}) {
  return (
    <section
      aria-labelledby="editorial-heading"
      className="bg-canvas u-section"
    >
      <div className="u-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative order-1">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-stone">
              <Image
                src={collection.heroImage.url}
                alt={collection.heroImage.alt}
                fill
                sizes="(min-width: 1024px) 48vw, 92vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -right-4 bottom-8 hidden aspect-3/4 w-36 overflow-hidden border-8 border-canvas bg-stone lg:block xl:w-44">
              <Image
                src="/images/editorial/winter-collection-detail.jpg"
                alt="A rail of neutral-toned winter knitwear"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="order-2 max-w-lg">
            <p className="u-eyebrow">{collection.subtitle}</p>

            <h2 id="editorial-heading" className="mt-4 text-h1">
              {collection.title}
            </h2>

            <p className="mt-6 text-lead leading-relaxed text-ink-soft">
              {collection.description}
            </p>

            <ul className="mt-8 flex flex-col gap-3 border-t border-stone-dark pt-7">
              {[
                "Brushed wool and cashmere-blend outerwear",
                "Fine-gauge knitwear built for layering",
                "A palette drawn from a winter sky",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-caption text-ink-soft"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                  />
                  {line}
                </li>
              ))}
            </ul>

            <ButtonLink
              href={"/collections#" + collection.slug}
              size="lg"
              className="mt-9"
            >
              Explore Collection
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
