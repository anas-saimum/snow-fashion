import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Editorial split hero.
 *
 * Text sits on paper rather than over the photograph — it keeps contrast at
 * AAA regardless of which image is swapped in, and reads more like a fashion
 * house than a stock banner. Entrance animation is a staged fade + rise.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative border-b border-stone bg-paper"
    >
      <div className="u-container">
        <div className="grid items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24">
          {/* Copy */}
          <div className="order-2 max-w-xl lg:order-1">
            <p
              className="u-eyebrow animate-fade-in"
              style={{ animationDelay: "60ms" }}
            >
              Winter Collection 2026
            </p>

            <h1
              id="hero-heading"
              className="mt-5 text-display animate-slide-up"
              style={{ animationDelay: "120ms" }}
            >
              Style That
              <br />
              Defines You
            </h1>

            <p
              className="mt-6 max-w-md text-lead text-ink-soft animate-slide-up"
              style={{ animationDelay: "220ms" }}
            >
              Discover modern fashion designed to make every moment
              unforgettable.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3 animate-slide-up"
              style={{ animationDelay: "320ms" }}
            >
              <ButtonLink href="/shop" size="lg">
                Shop Now
              </ButtonLink>
              <ButtonLink href="/collections" variant="secondary" size="lg">
                Explore Collection
              </ButtonLink>
            </div>

            <dl
              className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-stone pt-7 animate-fade-in"
              style={{ animationDelay: "420ms" }}
            >
              {[
                { term: "Free shipping", detail: "On orders over $150" },
                { term: "30-day returns", detail: "Simple and unhurried" },
                { term: "Made to last", detail: "Considered materials" },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-micro font-medium uppercase tracking-[0.1em] text-ink">
                    {item.term}
                  </dt>
                  <dd className="mt-1 text-micro leading-relaxed text-muted">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual */}
          <div className="relative order-1 lg:order-2">
            <div
              className="relative aspect-4/5 w-full overflow-hidden bg-canvas animate-fade-in sm:aspect-3/4 lg:aspect-4/5"
              style={{ animationDelay: "40ms" }}
            >
              <Image
                src="/images/editorial/hero-primary.jpg"
                alt="Model wearing a cream funnel-neck knit with matching tailored trousers"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* Offset detail image — hidden on small screens where it crowds. */}
            <div
              className="absolute -bottom-8 -left-8 hidden aspect-4/5 w-40 overflow-hidden border-8 border-paper bg-canvas animate-slide-up lg:block xl:w-52"
              style={{ animationDelay: "380ms" }}
            >
              <Image
                src="/images/editorial/hero-secondary.jpg"
                alt="A rail of neutral-toned knitwear beside dried pampas grass"
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
