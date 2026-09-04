import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Full-bleed promotional banner. Text sits on a dark scrim strong enough to
 * hold AA contrast over any photograph that replaces this one.
 */
export function PromoBanner() {
  return (
    <section aria-labelledby="promo-heading" className="relative isolate">
      <div className="relative min-h-[26rem] w-full lg:min-h-[34rem]">
        <Image
          src="/images/editorial/promo-banner.jpg"
          alt="Model in a powder blue belted trench coat in a city square"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ink/55 lg:bg-gradient-to-r lg:from-ink/80 lg:via-ink/50 lg:to-ink/20"
        />

        <div className="relative flex min-h-[26rem] items-center lg:min-h-[34rem]">
          <div className="u-container">
            <div className="max-w-xl py-16 text-paper">
              <p className="u-eyebrow text-paper/70">Snow Fashion edit</p>

              <h2 id="promo-heading" className="mt-4 text-h1 text-paper">
                Elevate Your Everyday Style
              </h2>

              <p className="mt-5 text-lead leading-relaxed text-paper/85">
                Discover carefully selected pieces made for modern wardrobes —
                fabrics that hold their shape and shapes that hold their own.
              </p>

              <ButtonLink href="/shop" variant="inverse" size="lg" className="mt-8">
                Shop Collection
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
