import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { ValueProps } from "@/components/home/ValueProps";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site.config";
import { brand } from "@/config/brand";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Snow Fashion is a modern fashion label built around considered design, honest materials and clothes made to be worn.",
  path: "/about",
  image: "/images/editorial/atelier.jpg",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Fashion, considered"
        description={siteConfig.description}
        trail={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        image={{
          url: "/images/editorial/boutique.jpg",
          alt: "The interior of a light-filled clothing boutique with rails of garments",
        }}
      />

      {/* Our story */}
      <section id="our-story" aria-labelledby="story-heading" className="u-section scroll-mt-32">
        <div className="u-container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative aspect-4/3 w-full overflow-hidden bg-canvas">
                <Image
                  src="/images/editorial/atelier.jpg"
                  alt="A tailor working at a sewing machine in a workshop"
                  fill
                  sizes="(min-width: 1024px) 48vw, 92vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={90} className="max-w-lg">
              <p className="u-eyebrow">Since {brand.foundedYear}</p>
              <h2 id="story-heading" className="mt-4 text-h1">
                Built on the details
              </h2>

              <div className="mt-6 flex flex-col gap-4 text-body leading-relaxed text-ink-soft">
                <p>
                  Snow Fashion began with a straightforward idea: that
                  well-designed clothing should not require a compromise between
                  how a piece looks and how often you can actually wear it.
                </p>
                <p>
                  Every garment starts with the fabric. We choose materials for
                  how they hold a shape, how they age, and how they feel after a
                  full day rather than in a fitting room. Silhouettes are drawn
                  to be flattering across sizes, then graded properly rather
                  than scaled up.
                </p>
                <p>
                  The result is a wardrobe that works together — pieces you can
                  build an outfit from without thinking about it, in a palette
                  that does not argue with itself.
                </p>
              </div>

              <ButtonLink href="/shop" size="lg" className="mt-9">
                Shop the collection
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section aria-labelledby="principles-heading" className="bg-canvas u-section">
        <div className="u-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="u-eyebrow">What we stand for</p>
            <h2 id="principles-heading" className="mt-3 text-h2">
              Three things we will not cut
            </h2>
          </div>

          <ul className="mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-3">
            {[
              {
                title: "Fabric first",
                body: "We start with the material and design around it. A good cut in a poor fabric is a garment you wear twice.",
              },
              {
                title: "Fit that is graded, not stretched",
                body: "Each size is patterned on its own terms, so a size 16 is not simply a size 8 enlarged.",
              },
              {
                title: "Colour with discipline",
                body: "A restrained palette across the range means pieces from different seasons still work together.",
              },
            ].map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 80}>
                  <p className="font-serif text-h3 text-accent">
                    {"0" + (index + 1)}
                  </p>
                  <h3 className="mt-3 font-sans text-caption font-medium uppercase tracking-[0.12em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-caption leading-relaxed text-muted">
                    {item.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ValueProps />

      {/* Visit / contact */}
      <section aria-labelledby="visit-heading" className="border-t border-stone">
        <div className="u-container py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="u-eyebrow">Get in touch</p>
              <h2 id="visit-heading" className="mt-3 text-h2">
                We are happy to help
              </h2>
              <p className="mt-4 max-w-md text-caption leading-relaxed text-muted sm:text-body">
                Questions about sizing, fabric or an order in progress? Our team
                answers every message.
              </p>
              <ButtonLink href="/contact" className="mt-7">
                Contact us
              </ButtonLink>
            </div>

            <dl className="grid gap-6 sm:grid-cols-2 lg:pt-10">
              <div>
                <dt className="u-eyebrow mb-2 text-ink">Email</dt>
                <dd className="text-caption text-ink-soft">
                  {siteConfig.contact.email}
                </dd>
              </div>
              <div>
                <dt className="u-eyebrow mb-2 text-ink">Phone</dt>
                <dd className="text-caption text-ink-soft">
                  {siteConfig.contact.phone}
                </dd>
              </div>
              <div>
                <dt className="u-eyebrow mb-2 text-ink">Studio</dt>
                <dd className="text-caption leading-relaxed text-ink-soft">
                  {siteConfig.contact.address}
                </dd>
              </div>
              <div>
                <dt className="u-eyebrow mb-2 text-ink">Hours</dt>
                <dd className="text-caption text-ink-soft">
                  {siteConfig.contact.hours}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
