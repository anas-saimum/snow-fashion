import Image from "next/image";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Social gallery.
 *
 * These are curated local images, not a live Instagram feed — the handle and
 * the image list both come from config/data so they can be replaced without
 * touching this component. Each tile links to the profile rather than
 * pretending to be an individual post.
 */
const tiles = [
  { src: "/images/social/01.jpg", alt: "Model in a black graphic crop tee against a pink wall" },
  { src: "/images/social/02.jpg", alt: "Model in a white printed cotton tee and black leggings" },
  { src: "/images/social/03.jpg", alt: "Model in a denim jacket layered over a grey hoodie" },
  { src: "/images/social/04.jpg", alt: "Model in a cream cable-knit vest with light-wash denim" },
  { src: "/images/social/05.jpg", alt: "Model wearing a ribbed grey infinity scarf and beanie" },
  { src: "/images/social/06.jpg", alt: "Model in a green lace bandeau top against a yellow wall" },
  { src: "/images/social/07.jpg", alt: "Model in a yellow cropped hoodie and matching joggers" },
  { src: "/images/social/08.jpg", alt: "Model in a pink polka-dot organza dress in a field" },
];

export function SocialGallery() {
  const { instagram } = siteConfig.social;

  return (
    <section aria-labelledby="social-heading" className="u-section bg-canvas">
      <div className="u-container">
        <div className="flex flex-col items-center text-center">
          <p className="u-eyebrow">Follow Snow Fashion</p>
          <h2 id="social-heading" className="mt-3 text-h2">
            {instagram.handle}
          </h2>
          <a
            href={instagram.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 text-micro font-medium uppercase tracking-[0.14em] text-ink"
          >
            <Instagram className="size-4" aria-hidden="true" />
            <span className="u-link">Follow on Instagram</span>
          </a>
        </div>

        <ul className="mt-11 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
          {tiles.map((tile, index) => (
            <li key={tile.src}>
              <Reveal delay={index * 40}>
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group relative block aspect-square overflow-hidden bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                >
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    sizes="(min-width: 640px) 24vw, 45vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-ink/0 text-paper opacity-0 transition-all duration-300 group-hover:bg-ink/35 group-hover:opacity-100"
                  >
                    <Instagram className="size-6" />
                  </span>
                  <span className="sr-only">
                    {"View Snow Fashion on Instagram — " + tile.alt}
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
