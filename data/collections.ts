import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    id: "col-winter-2026",
    slug: "winter-2026",
    title: "Winter Collection 2026",
    subtitle: "The season's edit",
    description:
      "Discover our latest collection, designed for effortless style and everyday confidence. Structured wool, brushed knits and a palette drawn from a winter sky.",
    heroImage: {
      id: "col-winter-img",
      url: "/images/editorial/winter-collection.jpg",
      alt: "Model wearing a blush pink wool overcoat with a printed scarf",
      width: 1200,
      height: 1600,
    },
    productIds: [
      "p-blush-wool-overcoat",
      "p-powder-blue-trench-coat",
      "p-merino-infinity-scarf",
      "p-luna-cable-knit-vest",
      "p-ivory-knit-lounge-set",
      "p-selvedge-denim-jacket",
    ],
  },
  {
    id: "col-essentials",
    slug: "essentials",
    title: "The Essentials",
    subtitle: "Wardrobe foundations",
    description:
      "The pieces you reach for without thinking. Cotton, cut well, in colours that never argue with each other.",
    heroImage: {
      id: "col-essentials-img",
      url: "/images/editorial/collection-essentials.jpg",
      alt: "A rail of neutral-toned blouses and layered necklaces",
      width: 1200,
      height: 1500,
    },
    productIds: [
      "p-essential-crew-tee",
      "p-cloud-crewneck-sweatshirt",
      "p-ecru-heavyweight-tee",
      "p-vintage-wash-straight-jeans",
      "p-tapered-slim-jeans",
      "p-poplin-dress-shirt",
    ],
  },
  {
    id: "col-occasion",
    slug: "occasion",
    title: "Occasion",
    subtitle: "For the evenings that matter",
    description:
      "Floor-sweeping silhouettes, lace and tulle. Made for weddings, gatherings and the long dinners in between.",
    heroImage: {
      id: "col-occasion-img",
      url: "/images/editorial/collection-occasion.jpg",
      alt: "A boutique interior with a rail of printed dresses",
      width: 1200,
      height: 1500,
    },
    productIds: [
      "p-noelle-off-shoulder-gown",
      "p-crimson-tulle-gown",
      "p-blossom-organza-dress",
      "p-ivory-satin-slip-dress",
      "p-navy-tailored-suit",
      "p-celine-ruffle-blouse",
    ],
  },
];

export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));
