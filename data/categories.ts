import type { Category } from "@/types";

/**
 * Demo category taxonomy. `parentSlug` drives breadcrumbs and the mega menu.
 * Replace image paths with real Snow Fashion photography in /public/images/categories.
 */
export const categories: Category[] = [
  {
    id: "cat-womens",
    slug: "womens-fashion",
    name: "Women's Fashion",
    description:
      "Considered silhouettes, refined fabrics and pieces designed to be worn far beyond one season.",
    image: {
      id: "cat-womens-img",
      url: "/images/categories/womens-fashion.jpg",
      alt: "Model wearing a cream knitted turtleneck and matching tailored trousers",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 1,
  },
  {
    id: "cat-mens",
    slug: "mens-fashion",
    name: "Men's Fashion",
    description:
      "Sharp tailoring and relaxed essentials built around clean lines and honest materials.",
    image: {
      id: "cat-mens-img",
      url: "/images/categories/mens-fashion.jpg",
      alt: "Model wearing a navy two-piece tailored suit with a white shirt",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 2,
  },
  {
    id: "cat-dresses",
    slug: "dresses",
    name: "Dresses",
    description:
      "From fluid day dresses to floor-sweeping evening pieces, cut to move with you.",
    image: {
      id: "cat-dresses-img",
      url: "/images/categories/dresses.jpg",
      alt: "Model in a white floral wrap midi dress beside the sea",
      width: 900,
      height: 1200,
    },
    parentSlug: "womens-fashion",
    featured: true,
    sortOrder: 3,
  },
  {
    id: "cat-tops",
    slug: "tops",
    name: "Tops",
    description:
      "Blouses, knits and cotton staples — the layer that carries an entire wardrobe.",
    image: {
      id: "cat-tops-img",
      url: "/images/categories/tops.jpg",
      alt: "Model wearing a white ruffled off-shoulder blouse",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 4,
  },
  {
    id: "cat-bottoms",
    slug: "bottoms",
    name: "Bottoms",
    description:
      "Trousers, denim and tailored shapes engineered for fit first.",
    image: {
      id: "cat-bottoms-img",
      url: "/images/categories/bottoms.jpg",
      alt: "Model wearing blush paperbag-waist tapered trousers",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 5,
  },
  {
    id: "cat-traditional",
    slug: "traditional-wear",
    name: "Traditional Wear",
    description:
      "Heritage-inspired occasion pieces — embellished fabrics and ceremonial silhouettes.",
    image: {
      id: "cat-traditional-img",
      url: "/images/categories/traditional-wear.jpg",
      alt: "Model wearing a plum off-shoulder floor-length gown",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 6,
  },
  {
    id: "cat-new",
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "The most recent additions to the Snow Fashion wardrobe.",
    image: {
      id: "cat-new-img",
      url: "/images/categories/new-arrivals.jpg",
      alt: "Model wearing a cream cable-knit sleeveless vest with denim",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 7,
  },
  {
    id: "cat-accessories",
    slug: "accessories",
    name: "Accessories",
    description:
      "Leather goods, scarves and finishing pieces that complete a look.",
    image: {
      id: "cat-accessories-img",
      url: "/images/categories/accessories.jpg",
      alt: "Flat lay of a tan leather wallet, sunglasses and a beaded bracelet",
      width: 900,
      height: 1200,
    },
    featured: true,
    sortOrder: 8,
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
