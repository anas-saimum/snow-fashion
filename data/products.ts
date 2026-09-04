import type {
  ColorOption,
  Product,
  ProductImage,
  ProductVariant,
  SizeOption,
} from "@/types";

/* ------------------------------------------------------------------------- *
 * DEMO CATALOGUE
 *
 * This is the ONLY place product content lives. Components never import it —
 * they go through lib/repositories/*. To move to a real backend, implement
 * ProductRepository against your API and delete this file.
 *
 * Prices are in minor units (cents). `rating` / `reviewCount` are placeholder
 * layout values, NOT customer reviews — see config/site.config.ts.
 * ------------------------------------------------------------------------- */

const SIZES = {
  womensAlpha: ["XS", "S", "M", "L", "XL", "XXL"],
  mensAlpha: ["S", "M", "L", "XL", "XXL"],
  womensWaist: ["24", "26", "28", "30", "32", "34"],
  mensWaist: ["30", "32", "34", "36", "38"],
  oneSize: ["One Size"],
} as const;

type SizeSet = keyof typeof SIZES;

const toSizes = (set: SizeSet): SizeOption[] =>
  SIZES[set].map((label) => ({ label, slug: label.toLowerCase() }));

/** Stable pseudo-random so inventory never changes between renders or builds. */
function seededInt(seed: string, min: number, max: number): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33 + seed.charCodeAt(i)) % 2147483647;
  }
  return min + (h % (max - min + 1));
}

interface Seed {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categorySlugs: string[];
  /** [filename without extension, alt text, colorSlug?] — files in /public/images/products */
  images: Array<[string, string, string?]>;
  colors: ColorOption[];
  sizeSet: SizeSet;
  materials: string[];
  care: string[];
  sizeGuideId?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  publishedAt: string;
  /** "colorSlug:sizeSlug" combinations deliberately out of stock. */
  soldOut?: string[];
}

function build(seed: Seed): Product {
  const sizes = toSizes(seed.sizeSet);

  const images: ProductImage[] = seed.images.map(([file, alt, colorSlug], i) => ({
    id: seed.slug + "-img-" + (i + 1),
    url: "/images/products/" + file + ".jpg",
    alt,
    width: 1200,
    height: 1600,
    colorSlug,
  }));

  const skuBase = seed.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  const variants: ProductVariant[] = [];

  for (const color of seed.colors) {
    for (const size of sizes) {
      const key = color.slug + ":" + size.slug;
      const sku = [
        "SF",
        skuBase,
        color.slug.toUpperCase().slice(0, 3),
        size.slug.toUpperCase(),
      ].join("-");
      variants.push({
        id: seed.slug + "--" + key,
        sku,
        colorSlug: color.slug,
        sizeSlug: size.slug,
        inventory: seed.soldOut?.includes(key) ? 0 : seededInt(sku, 2, 14),
      });
    }
  }

  return {
    id: "p-" + seed.slug,
    slug: seed.slug,
    name: seed.name,
    shortDescription: seed.shortDescription,
    description: seed.description,
    price: seed.price,
    compareAtPrice: seed.compareAtPrice,
    currency: "USD",
    categorySlugs: seed.categorySlugs,
    images,
    colors: seed.colors,
    sizes,
    variants,
    materials: seed.materials,
    careInstructions: seed.care,
    sizeGuideId: seed.sizeGuideId,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    featured: seed.featured ?? false,
    bestseller: seed.bestseller ?? false,
    newArrival: seed.newArrival ?? false,
    inventory: variants.reduce((sum, v) => sum + v.inventory, 0),
    status: "active",
    publishedAt: seed.publishedAt,
  };
}

/* ---------------------------- shared fragments --------------------------- */

const CARE_KNIT = [
  "Hand wash cold, or machine wash on a wool cycle",
  "Do not bleach",
  "Dry flat away from direct sunlight",
  "Cool iron on the reverse if needed",
];

const CARE_COTTON = [
  "Machine wash at 30°C with like colours",
  "Do not bleach",
  "Tumble dry low",
  "Warm iron on the reverse",
];

const CARE_DELICATE = [
  "Dry clean only",
  "Do not wring or soak",
  "Store on a padded hanger",
  "Steam to release creases",
];

const CARE_LEATHER = [
  "Wipe with a soft dry cloth",
  "Condition with a neutral leather balm twice a year",
  "Keep away from prolonged damp and direct heat",
];

const CARE_DENIM = [
  "Machine wash cold, inside out",
  "Wash separately for the first few cycles",
  "Line dry to preserve the fit",
  "Do not bleach",
];

const COLOR_WHITE: ColorOption = { name: "Optic White", slug: "white", hex: "#FBFAF8" };
const COLOR_BLACK: ColorOption = { name: "Black", slug: "black", hex: "#111111" };
const COLOR_INK: ColorOption = { name: "Ink", slug: "ink", hex: "#14161C" };
const COLOR_SAGE: ColorOption = { name: "Sage", slug: "sage", hex: "#93A08C" };
const COLOR_CREAM: ColorOption = { name: "Cream", slug: "cream", hex: "#EDE6D8" };
const COLOR_CAMEL: ColorOption = { name: "Camel", slug: "camel", hex: "#B08D63" };

const seeds: Seed[] = [
  /* ------------------------------- DRESSES ------------------------------- */
  {
    slug: "aria-floral-wrap-dress",
    name: "Aria Floral Wrap Dress",
    shortDescription: "A fluid midi wrap dress in a painted floral print.",
    description:
      "The Aria is cut on a soft bias so the skirt falls in a clean column and opens as you walk. A true wrap closure adjusts through the waist, and the short kimono sleeve keeps the shoulder line relaxed. Printed on a lightweight viscose that holds colour without stiffness.",
    price: 14800,
    compareAtPrice: 18900,
    categorySlugs: ["dresses", "womens-fashion", "new-arrivals"],
    images: [
      ["aria-floral-wrap-dress-1", "Model wearing the Aria floral wrap midi dress beside the sea, holding a woven bag", "ivory"],
      ["aria-floral-wrap-dress-2", "Rail of printed dresses in a light-filled studio", "ivory"],
    ],
    colors: [
      { name: "Ivory Bloom", slug: "ivory", hex: "#F3EFE7" },
      { name: "Deep Sable", slug: "sable", hex: "#4A3B33" },
    ],
    sizeSet: "womensAlpha",
    materials: ["100% viscose", "Partially lined bodice"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.6,
    reviewCount: 42,
    featured: true,
    newArrival: true,
    publishedAt: "2026-08-14",
    soldOut: ["ivory:l", "sable:xxl"],
  },
  {
    slug: "noelle-off-shoulder-gown",
    name: "Noelle Off-Shoulder Gown",
    shortDescription: "A sculpted floor-length gown with a portrait neckline.",
    description:
      "Built from a heavy stretch crepe that holds its shape through the bodice and releases into a full sweep at the hem. The portrait neckline sits just off the shoulder and is stabilised internally so it stays where you put it. Concealed back zip with a modesty hook.",
    price: 28500,
    categorySlugs: ["dresses", "traditional-wear", "womens-fashion"],
    images: [
      ["noelle-off-shoulder-gown-1", "Model wearing the Noelle plum off-shoulder gown against a violet backdrop", "plum"],
      ["noelle-off-shoulder-gown-2", "Rail of lace and knitted garments in pale tones", "plum"],
    ],
    colors: [
      { name: "Plum", slug: "plum", hex: "#7C2350" },
      COLOR_INK,
    ],
    sizeSet: "womensAlpha",
    materials: ["68% viscose, 27% polyamide, 5% elastane", "Fully lined"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.9,
    reviewCount: 27,
    featured: true,
    bestseller: true,
    publishedAt: "2026-06-02",
  },
  {
    slug: "crimson-tulle-gown",
    name: "Crimson Lace & Tulle Gown",
    shortDescription: "Layered soft tulle over a corded lace bodice.",
    description:
      "An occasion piece in two parts: a corded lace bodice with a boned inner structure, and a skirt of layered soft tulle that carries movement without weight. The off-shoulder sleeve is finished in the same lace as the bodice.",
    price: 34000,
    compareAtPrice: 42500,
    categorySlugs: ["dresses", "traditional-wear", "womens-fashion"],
    images: [
      ["crimson-tulle-gown-1", "Model wearing the Crimson lace and tulle gown among sand dunes", "crimson"],
      ["crimson-tulle-gown-2", "Rail of lace garments in soft pastel shades", "crimson"],
    ],
    colors: [{ name: "Crimson", slug: "crimson", hex: "#8E1B26" }],
    sizeSet: "womensAlpha",
    materials: ["Shell: 100% polyester tulle", "Lace: 88% nylon, 12% elastane", "Fully lined"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.8,
    reviewCount: 19,
    featured: true,
    publishedAt: "2026-05-20",
    soldOut: ["crimson:xs"],
  },
  {
    slug: "blossom-organza-dress",
    name: "Blossom Organza Dress",
    shortDescription: "Sheer polka-dot organza with volume through the sleeve.",
    description:
      "Cut from a crisp printed organza that holds an exaggerated sleeve without any internal support. The off-shoulder neckline is elasticated for an easy fit, and the body is lined to mid-thigh.",
    price: 21000,
    categorySlugs: ["dresses", "womens-fashion", "new-arrivals"],
    images: [
      ["blossom-organza-dress-1", "Model wearing the Blossom pink polka-dot organza dress in an open field", "blush"],
      ["blossom-organza-dress-2", "Rail of pale lace and knitwear pieces", "blush"],
    ],
    colors: [
      { name: "Blush", slug: "blush", hex: "#EFD3D6" },
      { name: "Powder", slug: "powder", hex: "#D5DEE8" },
    ],
    sizeSet: "womensAlpha",
    materials: ["100% polyester organza", "Lining: 100% viscose"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.5,
    reviewCount: 33,
    newArrival: true,
    publishedAt: "2026-08-28",
  },
  {
    slug: "margot-corduroy-shirt-dress",
    name: "Margot Corduroy Shirt Dress",
    shortDescription: "A gathered midi shirt dress in fine-wale corduroy.",
    description:
      "A grandad collar, a half-placket of covered buttons and a deep gathered skirt. The fine-wale cotton corduroy is brushed for softness and heavy enough to hold the gather cleanly. Three-quarter sleeves and side seam pockets.",
    price: 16500,
    categorySlugs: ["dresses", "womens-fashion"],
    images: [
      ["margot-corduroy-shirt-dress-1", "Model wearing the Margot burgundy corduroy shirt dress beside houseplants", "burgundy"],
      ["margot-corduroy-shirt-dress-2", "Boutique interior with a rail of printed dresses", "burgundy"],
    ],
    colors: [
      { name: "Burgundy", slug: "burgundy", hex: "#6E2233" },
      { name: "Moss", slug: "moss", hex: "#4B5340" },
    ],
    sizeSet: "womensAlpha",
    materials: ["98% cotton, 2% elastane corduroy", "Unlined"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.7,
    reviewCount: 58,
    bestseller: true,
    publishedAt: "2026-03-11",
  },
  {
    slug: "ivory-satin-slip-dress",
    name: "Ivory Satin Slip Dress",
    shortDescription: "A bias-cut satin slip with adjustable straps.",
    description:
      "Cut on the true bias so the fabric skims rather than clings. Adjustable narrow straps, a plain V neckline and a clean unbroken hem. Wears alone in summer and layers over a fine knit in winter.",
    price: 12800,
    compareAtPrice: 16000,
    categorySlugs: ["dresses", "womens-fashion"],
    images: [
      ["ivory-satin-slip-dress-1", "Model wearing an ivory satin slip dress against a warm terracotta wall", "ivory"],
      ["ivory-satin-slip-dress-2", "Rail of lace and knitted pieces in pale tones", "ivory"],
    ],
    colors: [
      { name: "Ivory", slug: "ivory", hex: "#EFE7DC" },
      COLOR_INK,
      COLOR_SAGE,
    ],
    sizeSet: "womensAlpha",
    materials: ["100% viscose satin"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.4,
    reviewCount: 71,
    publishedAt: "2026-02-19",
  },

  /* --------------------------------- TOPS -------------------------------- */
  {
    slug: "celine-ruffle-blouse",
    name: "Celine Ruffle Off-Shoulder Blouse",
    shortDescription: "A cotton poplin blouse with a tiered ruffle shoulder.",
    description:
      "Crisp cotton poplin gathered into a double ruffle across the shoulder, with a shirred back panel so it holds without pulling. Full sleeves gather into a covered elastic cuff.",
    price: 9600,
    categorySlugs: ["tops", "womens-fashion"],
    images: [
      ["celine-ruffle-blouse-1", "Model wearing the Celine white ruffled off-shoulder blouse in a dark studio", "white"],
      ["celine-ruffle-blouse-2", "Rail of neutral blouses with layered necklaces", "white"],
    ],
    colors: [
      COLOR_WHITE,
      COLOR_BLACK,
      { name: "Butter", slug: "butter", hex: "#EFE0BC" },
    ],
    sizeSet: "womensAlpha",
    materials: ["100% cotton poplin"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.7,
    reviewCount: 96,
    featured: true,
    bestseller: true,
    publishedAt: "2026-04-08",
  },
  {
    slug: "luna-cable-knit-vest",
    name: "Luna Cable-Knit Vest",
    shortDescription: "A sleeveless cable knit with a soft V neckline.",
    description:
      "A cotton-blend cable knit worked in a fine gauge so it layers under a jacket without bulk. Dropped shoulder, ribbed V neck and a straight hem that sits at the high hip.",
    price: 8800,
    compareAtPrice: 11000,
    categorySlugs: ["tops", "womens-fashion", "new-arrivals"],
    images: [
      ["luna-cable-knit-vest-1", "Model wearing the Luna cream cable-knit vest with light-wash jeans", "cream"],
      ["luna-cable-knit-vest-2", "Rail of neutral knitwear beside dried pampas grass", "cream"],
    ],
    colors: [
      COLOR_CREAM,
      COLOR_CAMEL,
      { name: "Slate", slug: "slate", hex: "#5C6470" },
    ],
    sizeSet: "womensAlpha",
    materials: ["60% cotton, 40% acrylic"],
    care: CARE_KNIT,
    sizeGuideId: "womens-apparel",
    rating: 4.6,
    reviewCount: 64,
    newArrival: true,
    publishedAt: "2026-08-21",
  },
  {
    slug: "verde-lace-bandeau-top",
    name: "Verde Lace Bandeau Top",
    shortDescription: "A corded lace bandeau with a smooth lined bodice.",
    description:
      "A fitted bandeau in corded floral lace over a smooth lining, with a soft elasticated back and detachable straps. Designed to sit under an open shirt or a tailored jacket.",
    price: 5800,
    categorySlugs: ["tops", "womens-fashion"],
    images: [
      ["verde-lace-bandeau-top-1", "Model wearing the Verde green lace bandeau top against a yellow wall", "emerald"],
      ["verde-lace-bandeau-top-2", "Rail of lace garments in pale shades", "emerald"],
    ],
    colors: [
      { name: "Emerald", slug: "emerald", hex: "#1F6B54" },
      COLOR_BLACK,
    ],
    sizeSet: "womensAlpha",
    materials: ["Lace: 90% nylon, 10% elastane", "Lining: 95% cotton, 5% elastane"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.3,
    reviewCount: 24,
    publishedAt: "2026-01-30",
  },
  {
    slug: "noir-graphic-crop-tee",
    name: "Noir Graphic Crop Tee",
    shortDescription: "A boxy cropped tee with a hand-drawn print.",
    description:
      "A boxy cropped body in combed cotton jersey with a screen-printed graphic that softens with every wash. Ribbed neckline and a wide, straight hem.",
    price: 4200,
    compareAtPrice: 5500,
    categorySlugs: ["tops", "womens-fashion"],
    images: [
      ["noir-graphic-crop-tee-1", "Model wearing the Noir black graphic crop tee with ripped jeans against a pink wall", "black"],
      ["noir-graphic-crop-tee-2", "Close-up of sage green cotton tees on wooden hangers", "black"],
    ],
    colors: [COLOR_BLACK, COLOR_WHITE],
    sizeSet: "womensAlpha",
    materials: ["100% combed cotton jersey, 180gsm"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.4,
    reviewCount: 112,
    publishedAt: "2026-02-05",
  },
  {
    slug: "trail-print-cotton-tee",
    name: "Trail Print Cotton Tee",
    shortDescription: "A relaxed cotton tee with a line-drawn landscape print.",
    description:
      "Cut with a straight relaxed body and a slightly dropped shoulder in mid-weight cotton. The print is water-based, so it sits in the fabric rather than on top of it.",
    price: 3800,
    categorySlugs: ["tops", "womens-fashion"],
    images: [
      ["trail-print-cotton-tee-1", "Model wearing the Trail print white cotton tee with black leggings", "white"],
      ["trail-print-cotton-tee-2", "Close-up of green cotton tees on wooden hangers", "sage"],
    ],
    colors: [COLOR_WHITE, COLOR_SAGE, COLOR_BLACK],
    sizeSet: "womensAlpha",
    materials: ["100% cotton jersey, 165gsm"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.2,
    reviewCount: 47,
    publishedAt: "2025-12-12",
  },
  {
    slug: "cloud-crewneck-sweatshirt",
    name: "Cloud Crewneck Sweatshirt",
    shortDescription: "A brushed-back sweatshirt with a clean crew neck.",
    description:
      "Heavy loopback cotton, brushed on the inside for warmth. Set-in sleeves, ribbed collar and cuffs, and a straight body that keeps its shape after washing.",
    price: 7200,
    categorySlugs: ["tops", "womens-fashion", "mens-fashion"],
    images: [
      ["cloud-crewneck-sweatshirt-1", "Flat lay of a white crewneck sweatshirt with jeans and white trainers", "white"],
      ["cloud-crewneck-sweatshirt-2", "Close-up of sage green cotton garments on hangers", "sage"],
    ],
    colors: [
      COLOR_WHITE,
      COLOR_SAGE,
      { name: "Charcoal", slug: "charcoal", hex: "#3A3D42" },
    ],
    sizeSet: "womensAlpha",
    materials: ["85% cotton, 15% recycled polyester, 320gsm loopback"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.8,
    reviewCount: 138,
    bestseller: true,
    publishedAt: "2026-01-16",
  },

  /* ---------------------------- OUTERWEAR (W) ---------------------------- */
  {
    slug: "blush-wool-overcoat",
    name: "Blush Wool Overcoat",
    shortDescription: "A single-breasted wool-blend coat with a notch lapel.",
    description:
      "A clean single-breasted coat cut just below the knee in a brushed wool blend. Notch lapel, two welt pockets and a half lining so it keeps its drape. Roomy enough for a knit underneath without losing the line.",
    price: 32000,
    compareAtPrice: 39500,
    categorySlugs: ["womens-fashion", "new-arrivals"],
    images: [
      ["blush-wool-overcoat-1", "Model wearing the blush pink wool overcoat with a printed scarf in a stone arcade", "blush"],
      ["blush-wool-overcoat-2", "Rail of neutral knitwear beside dried pampas grass", "blush"],
    ],
    colors: [
      { name: "Blush", slug: "blush", hex: "#E6C6C2" },
      COLOR_CAMEL,
      COLOR_INK,
    ],
    sizeSet: "womensAlpha",
    materials: ["62% wool, 33% polyester, 5% cashmere", "Half lined in viscose"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.9,
    reviewCount: 51,
    featured: true,
    newArrival: true,
    publishedAt: "2026-08-30",
  },
  {
    slug: "powder-blue-trench-coat",
    name: "Powder Blue Trench Coat",
    shortDescription: "A belted trench in a soft cotton-blend twill.",
    description:
      "A modern trench with a softened shoulder and a self-tie belt that lets you set the waist. Storm flap, deep patch pockets and a vented back for movement. The twill has a slight sheen and resists light rain.",
    price: 29800,
    categorySlugs: ["womens-fashion"],
    images: [
      ["powder-blue-trench-coat-1", "Model wearing the powder blue belted trench coat in a European city square", "powder"],
      ["powder-blue-trench-coat-2", "Rail of warm-toned garments under low lighting", "powder"],
    ],
    colors: [
      { name: "Powder Blue", slug: "powder", hex: "#A9C0D6" },
      { name: "Stone", slug: "stone", hex: "#CFC4B4" },
    ],
    sizeSet: "womensAlpha",
    materials: ["70% cotton, 30% polyester twill", "Fully lined"],
    care: CARE_DELICATE,
    sizeGuideId: "womens-apparel",
    rating: 4.7,
    reviewCount: 38,
    featured: true,
    publishedAt: "2026-04-25",
  },
  {
    slug: "olive-utility-field-jacket",
    name: "Olive Utility Field Jacket",
    shortDescription: "An oversized cotton field jacket with four pockets.",
    description:
      "Built on a classic four-pocket field shape in washed cotton canvas, cut oversized so it layers over a sweatshirt. Button front with a concealed placket, adjustable cuffs and a drawcord at the waist.",
    price: 18500,
    categorySlugs: ["womens-fashion"],
    images: [
      ["olive-utility-field-jacket-1", "Model wearing the olive utility field jacket over a white sweatshirt", "olive"],
      ["olive-utility-field-jacket-2", "Rail of warm-toned garments under low lighting", "olive"],
    ],
    colors: [
      { name: "Olive", slug: "olive", hex: "#5A5B3F" },
      { name: "Stone", slug: "stone", hex: "#CFC4B4" },
    ],
    sizeSet: "womensAlpha",
    materials: ["100% washed cotton canvas", "Unlined"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.6,
    reviewCount: 87,
    bestseller: true,
    publishedAt: "2026-03-02",
  },
  {
    slug: "indigo-hooded-denim-jacket",
    name: "Indigo Hooded Denim Jacket",
    shortDescription: "A rigid denim jacket with a jersey hood.",
    description:
      "A traditional trucker body in rigid indigo denim with a soft jersey hood stitched in at the collar. Chest flap pockets, a button front and adjustable tabs at the waist.",
    price: 13800,
    categorySlugs: ["womens-fashion", "tops"],
    images: [
      ["indigo-hooded-denim-jacket-1", "Model wearing an indigo denim jacket over a grey hoodie against a teal wall", "indigo"],
      ["indigo-hooded-denim-jacket-2", "Close-up of denim jeans hanging on a rail", "indigo"],
    ],
    colors: [
      { name: "Indigo", slug: "indigo", hex: "#3C5578" },
      { name: "Light Wash", slug: "light-wash", hex: "#9BB0C6" },
    ],
    sizeSet: "womensAlpha",
    materials: ["100% cotton denim, 12oz", "Hood: 80% cotton, 20% polyester"],
    care: CARE_DENIM,
    sizeGuideId: "womens-apparel",
    rating: 4.5,
    reviewCount: 62,
    publishedAt: "2025-11-28",
  },

  /* ------------------------------ BOTTOMS (W) ---------------------------- */
  {
    slug: "paperbag-tapered-trousers",
    name: "Paperbag Tapered Trousers",
    shortDescription: "High-waisted trousers with a gathered paperbag waist.",
    description:
      "A gathered elasticated waist under a wide self-belt, tapering to an elasticated cuff at the ankle. Cut from a fluid twill that presses flat and travels well. Deep flap pockets at the hip.",
    price: 8400,
    compareAtPrice: 10500,
    categorySlugs: ["bottoms", "womens-fashion"],
    images: [
      ["paperbag-tapered-trousers-1", "Model wearing blush paperbag-waist tapered trousers with heeled sandals", "blush"],
      ["paperbag-tapered-trousers-2", "Close-up of denim on a hanging rail", "blush"],
    ],
    colors: [
      { name: "Blush", slug: "blush", hex: "#DBAFA6" },
      COLOR_BLACK,
      { name: "Sand", slug: "sand", hex: "#D6C7AE" },
    ],
    sizeSet: "womensWaist",
    materials: ["96% polyester, 4% elastane twill"],
    care: CARE_COTTON,
    sizeGuideId: "womens-bottoms",
    rating: 4.5,
    reviewCount: 103,
    bestseller: true,
    publishedAt: "2026-02-27",
    soldOut: ["black:24"],
  },
  {
    slug: "vintage-wash-straight-jeans",
    name: "Vintage Wash Straight Jeans",
    shortDescription: "A high-rise straight leg in rigid cotton denim.",
    description:
      "A true high rise with a straight leg that falls clean from the hip. Made in rigid cotton denim with a stonewash finish and light distressing at the pockets. Button fly and a full-length inseam you can crop to taste.",
    price: 9800,
    categorySlugs: ["bottoms", "womens-fashion"],
    images: [
      ["vintage-wash-straight-jeans-1", "Light-wash high-rise jeans photographed on a wooden hanger", "light-wash"],
      ["vintage-wash-straight-jeans-2", "Close-up of several pairs of jeans hanging on a rail", "light-wash"],
    ],
    colors: [
      { name: "Light Wash", slug: "light-wash", hex: "#9BB0C6" },
      { name: "Mid Blue", slug: "mid-blue", hex: "#5A7898" },
      COLOR_BLACK,
    ],
    sizeSet: "womensWaist",
    materials: ["100% cotton denim, 12.5oz"],
    care: CARE_DENIM,
    sizeGuideId: "womens-bottoms",
    rating: 4.6,
    reviewCount: 129,
    publishedAt: "2026-01-09",
  },
  {
    slug: "ivory-knit-lounge-set",
    name: "Ivory Knit Lounge Set",
    shortDescription: "A matching funnel-neck knit and tapered trouser.",
    description:
      "Sold as a set: a relaxed funnel-neck knit with a dropped shoulder, and a tapered trouser with a covered elastic waist. Both pieces are worked in the same soft cotton-blend so the tone matches exactly.",
    price: 15800,
    categorySlugs: ["womens-fashion", "new-arrivals", "tops"],
    images: [
      ["ivory-knit-lounge-set-1", "Model wearing the ivory funnel-neck knit and matching tapered trousers in a white studio", "ivory"],
      ["ivory-knit-lounge-set-2", "Rail of neutral knitwear beside dried pampas grass", "ivory"],
    ],
    colors: [
      { name: "Ivory", slug: "ivory", hex: "#F1EBE1" },
      { name: "Oat", slug: "oat", hex: "#D9CBB6" },
    ],
    sizeSet: "womensAlpha",
    materials: ["70% cotton, 30% modal knit"],
    care: CARE_KNIT,
    sizeGuideId: "womens-apparel",
    rating: 4.8,
    reviewCount: 44,
    featured: true,
    newArrival: true,
    publishedAt: "2026-09-01",
  },
  {
    slug: "olive-belted-playsuit",
    name: "Olive Belted Playsuit",
    shortDescription: "A strappy playsuit with a covered ring belt.",
    description:
      "A clean strappy playsuit in a matte crepe with adjustable shoulder ties and a covered ring belt that defines the waist. Concealed side zip and side seam pockets.",
    price: 11200,
    categorySlugs: ["womens-fashion", "new-arrivals"],
    images: [
      ["olive-belted-playsuit-1", "Olive green belted playsuit laid flat beside trailing ivy", "olive"],
      ["olive-belted-playsuit-2", "Rail of neutral blouses with layered necklaces", "olive"],
    ],
    colors: [
      { name: "Olive", slug: "olive", hex: "#4F5540" },
      COLOR_BLACK,
    ],
    sizeSet: "womensAlpha",
    materials: ["100% polyester crepe", "Unlined"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.4,
    reviewCount: 29,
    newArrival: true,
    publishedAt: "2026-08-18",
  },
  {
    slug: "sunbeam-hoodie-set",
    name: "Sunbeam Hoodie & Jogger Set",
    shortDescription: "A cropped hoodie and jogger in brushed fleece.",
    description:
      "A cropped hoodie with a raw-edge hem and a matching high-waisted jogger with an elasticated cuff. Both in a heavy brushed fleece that keeps its colour through repeated washing.",
    price: 12400,
    compareAtPrice: 15500,
    categorySlugs: ["womens-fashion", "tops", "bottoms"],
    images: [
      ["sunbeam-hoodie-set-1", "Model wearing a yellow cropped hoodie and matching joggers on an outdoor court", "sunbeam"],
      ["sunbeam-hoodie-set-2", "Close-up of cotton garments hanging on wooden hangers", "sunbeam"],
    ],
    colors: [
      { name: "Sunbeam", slug: "sunbeam", hex: "#E8A81C" },
      { name: "Grey Marl", slug: "grey-marl", hex: "#A9A9A4" },
      COLOR_BLACK,
    ],
    sizeSet: "womensAlpha",
    materials: ["80% cotton, 20% polyester brushed fleece"],
    care: CARE_COTTON,
    sizeGuideId: "womens-apparel",
    rating: 4.3,
    reviewCount: 76,
    newArrival: true,
    publishedAt: "2026-07-22",
  },

  /* ------------------------------- MEN'S --------------------------------- */
  {
    slug: "essential-crew-tee",
    name: "Essential Crew Tee",
    shortDescription: "A mid-weight cotton tee with a reinforced collar.",
    description:
      "The plain tee, done properly. Combed ring-spun cotton with a taped shoulder seam and a ribbed collar that holds its shape. Cut straight through the body with a standard sleeve length.",
    price: 3400,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["essential-crew-tee-1", "Model wearing a plain white crew neck cotton tee", "white"],
      ["essential-crew-tee-2", "Close-up of sage green cotton tees on wooden hangers", "sage"],
    ],
    colors: [
      COLOR_WHITE,
      COLOR_BLACK,
      COLOR_SAGE,
      { name: "Navy", slug: "navy", hex: "#1E2A44" },
    ],
    sizeSet: "mensAlpha",
    materials: ["100% combed cotton jersey, 190gsm"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.7,
    reviewCount: 214,
    bestseller: true,
    publishedAt: "2025-10-04",
  },
  {
    slug: "oversized-contrast-tee",
    name: "Oversized Contrast-Stitch Tee",
    shortDescription: "A boxy tee with exposed contrast stitching.",
    description:
      "An intentionally oversized body with a dropped shoulder and a heavy ribbed collar, finished with exposed contrast stitching at the shoulder, sleeve and hem. Short side vents stop it clinging.",
    price: 4600,
    categorySlugs: ["mens-fashion", "tops", "new-arrivals"],
    images: [
      ["oversized-contrast-tee-1", "Model wearing a black oversized tee with contrast stitching and jeans", "black"],
      ["oversized-contrast-tee-2", "Plain black cotton tee shown on a wooden hanger", "black"],
    ],
    colors: [
      COLOR_BLACK,
      { name: "Ecru", slug: "ecru", hex: "#E8DFC9" },
    ],
    sizeSet: "mensAlpha",
    materials: ["100% cotton jersey, 220gsm"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.5,
    reviewCount: 68,
    newArrival: true,
    publishedAt: "2026-08-25",
  },
  {
    slug: "ecru-heavyweight-tee",
    name: "Ecru Heavyweight Tee",
    shortDescription: "A structured heavyweight tee that holds its shape.",
    description:
      "A dense 240gsm cotton with enough body to stand away from the shoulder. Wide ribbed collar, straight sleeves and a clean twin-needle hem.",
    price: 4200,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["ecru-heavyweight-tee-1", "Model wearing an ecru heavyweight cotton tee against a navy backdrop", "ecru"],
      ["ecru-heavyweight-tee-2", "Plain black cotton tee shown on a wooden hanger", "ecru"],
    ],
    colors: [
      { name: "Ecru", slug: "ecru", hex: "#E8DFC9" },
      COLOR_BLACK,
      { name: "Clay", slug: "clay", hex: "#B4795E" },
    ],
    sizeSet: "mensAlpha",
    materials: ["100% cotton jersey, 240gsm"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.6,
    reviewCount: 91,
    publishedAt: "2026-05-06",
  },
  {
    slug: "noir-cotton-tee",
    name: "Noir Cotton Tee",
    shortDescription: "A slim black tee with a subtle chest print.",
    description:
      "A slimmer cut through the chest and sleeve with a small tonal chest print. Pre-shrunk so the length stays true after washing.",
    price: 3600,
    compareAtPrice: 4500,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["noir-cotton-tee-1", "Plain black cotton tee shown on a wooden hanger against a grey wall", "black"],
      ["noir-cotton-tee-2", "Close-up of cotton tees hanging on wooden hangers", "black"],
    ],
    colors: [COLOR_BLACK, COLOR_WHITE],
    sizeSet: "mensAlpha",
    materials: ["100% combed cotton jersey, 180gsm"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.4,
    reviewCount: 57,
    publishedAt: "2026-01-22",
  },
  {
    slug: "coastal-print-tee",
    name: "Coastal Print Tee",
    shortDescription: "A relaxed tee with an illustrated back print.",
    description:
      "A relaxed cotton tee carrying a fine-line illustrated print across the back yoke. Soft-washed before printing so the hand feel stays light.",
    price: 4000,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["coastal-print-tee-1", "Model photographed from behind wearing a white tee with a coastal back print", "white"],
      ["coastal-print-tee-2", "Plain black cotton tee shown on a wooden hanger", "white"],
    ],
    colors: [COLOR_WHITE, COLOR_SAGE],
    sizeSet: "mensAlpha",
    materials: ["100% cotton jersey, 175gsm"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.3,
    reviewCount: 35,
    publishedAt: "2026-06-14",
  },
  {
    slug: "tan-leather-biker-jacket",
    name: "Tan Leather Biker Jacket",
    shortDescription: "An asymmetric biker in soft tan lambskin.",
    description:
      "A classic asymmetric biker in soft lambskin that breaks in quickly and creases where you move. Angled zip, snap-down lapels, epaulettes and a zipped sleeve cuff. Fully lined in viscose.",
    price: 42000,
    compareAtPrice: 52000,
    categorySlugs: ["mens-fashion", "new-arrivals"],
    images: [
      ["tan-leather-biker-jacket-1", "Model wearing a tan leather biker jacket over a shirt and tie", "tan"],
      ["tan-leather-biker-jacket-2", "Terracotta bomber jacket shown on a hanger", "tan"],
    ],
    colors: [
      { name: "Tan", slug: "tan", hex: "#A9714B" },
      COLOR_BLACK,
    ],
    sizeSet: "mensAlpha",
    materials: ["100% lambskin leather", "Lining: 100% viscose"],
    care: CARE_LEATHER,
    sizeGuideId: "mens-apparel",
    rating: 4.9,
    reviewCount: 23,
    featured: true,
    newArrival: true,
    publishedAt: "2026-08-11",
    soldOut: ["tan:s"],
  },
  {
    slug: "terracotta-bomber-jacket",
    name: "Terracotta Bomber Jacket",
    shortDescription: "A lightweight bomber with a ribbed collar and cuffs.",
    description:
      "A clean MA-1 shape in a lightweight technical shell with a matte finish. Ribbed collar, cuffs and hem, a zipped sleeve pocket and two welt pockets at the hip.",
    price: 17800,
    categorySlugs: ["mens-fashion"],
    images: [
      ["terracotta-bomber-jacket-1", "Terracotta lightweight bomber jacket shown on a hanger against a grey wall", "terracotta"],
      ["terracotta-bomber-jacket-2", "Indigo denim jacket with a corduroy collar shown on a hanger", "terracotta"],
    ],
    colors: [
      { name: "Terracotta", slug: "terracotta", hex: "#A4674F" },
      COLOR_INK,
      { name: "Olive", slug: "olive", hex: "#5A5B3F" },
    ],
    sizeSet: "mensAlpha",
    materials: ["100% recycled polyester shell", "Lining: 100% polyester"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.5,
    reviewCount: 74,
    bestseller: true,
    publishedAt: "2026-03-19",
  },
  {
    slug: "selvedge-denim-jacket",
    name: "Selvedge Denim Jacket",
    shortDescription: "A rigid selvedge trucker with a corduroy collar.",
    description:
      "Cut from rigid Japanese selvedge denim that fades to your own pattern of wear, with a contrasting corduroy collar. Pleated front, chest flap pockets and adjustable waist tabs. Unwashed, so expect it to soften over the first month.",
    price: 21000,
    categorySlugs: ["mens-fashion", "new-arrivals"],
    images: [
      ["selvedge-denim-jacket-1", "Indigo selvedge denim jacket with a tan corduroy collar shown on a hanger", "indigo"],
      ["selvedge-denim-jacket-2", "Stack of folded denim held in someone's arms", "indigo"],
    ],
    colors: [{ name: "Raw Indigo", slug: "indigo", hex: "#2E4260" }],
    sizeSet: "mensAlpha",
    materials: ["100% cotton selvedge denim, 13.5oz", "Collar: 100% cotton corduroy"],
    care: CARE_DENIM,
    sizeGuideId: "mens-apparel",
    rating: 4.8,
    reviewCount: 41,
    featured: true,
    newArrival: true,
    publishedAt: "2026-08-08",
  },
  {
    slug: "navy-tailored-suit",
    name: "Navy Tailored Two-Piece Suit",
    shortDescription: "A half-canvassed suit in a fine wool hopsack.",
    description:
      "A two-button jacket with a half-canvas construction, natural shoulder and side vents, matched to a flat-front trouser with a slight taper. Woven in a breathable wool hopsack that resists creasing through a long day.",
    price: 54500,
    categorySlugs: ["mens-fashion"],
    images: [
      ["navy-tailored-suit-1", "Model wearing a navy two-piece tailored suit with brown leather shoes", "navy"],
      ["navy-tailored-suit-2", "Close-up of a navy suit jacket worn with a shirt and tie", "navy"],
    ],
    colors: [
      { name: "Navy", slug: "navy", hex: "#22304F" },
      { name: "Charcoal", slug: "charcoal", hex: "#3A3D42" },
    ],
    sizeSet: "mensAlpha",
    materials: ["98% wool, 2% elastane hopsack", "Jacket fully lined in cupro"],
    care: CARE_DELICATE,
    sizeGuideId: "mens-apparel",
    rating: 4.8,
    reviewCount: 33,
    featured: true,
    publishedAt: "2026-02-11",
  },
  {
    slug: "poplin-dress-shirt",
    name: "Poplin Dress Shirt",
    shortDescription: "A crisp cotton poplin shirt with a cutaway collar.",
    description:
      "Two-ply cotton poplin with a fused cutaway collar and a single-button barrel cuff. A slim but not tight cut through the body, with a back yoke split for shoulder movement.",
    price: 7800,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["poplin-dress-shirt-1", "Model wearing a white poplin dress shirt with a patterned tie", "white"],
      ["poplin-dress-shirt-2", "Chambray polka-dot shirt shown on a hanger", "white"],
    ],
    colors: [
      COLOR_WHITE,
      { name: "Sky", slug: "sky", hex: "#BFD3E6" },
      { name: "Rose", slug: "rose", hex: "#DEC0BE" },
    ],
    sizeSet: "mensAlpha",
    materials: ["100% two-ply cotton poplin"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.7,
    reviewCount: 118,
    bestseller: true,
    publishedAt: "2025-12-02",
  },
  {
    slug: "chambray-dot-shirt",
    name: "Chambray Dot Shirt",
    shortDescription: "A soft chambray shirt with a woven dobby dot.",
    description:
      "A washed cotton chambray with a small woven dot, cut with a relaxed body and a soft unfused collar. Single chest pocket and a curved shirt tail hem.",
    price: 8600,
    compareAtPrice: 10800,
    categorySlugs: ["mens-fashion", "tops"],
    images: [
      ["chambray-dot-shirt-1", "Blue chambray shirt with a woven dot pattern shown on a hanger", "chambray"],
      ["chambray-dot-shirt-2", "Rail of dip-dyed shirts in blue, coral and green", "chambray"],
    ],
    colors: [
      { name: "Chambray", slug: "chambray", hex: "#5A7290" },
      COLOR_WHITE,
    ],
    sizeSet: "mensAlpha",
    materials: ["100% washed cotton chambray"],
    care: CARE_COTTON,
    sizeGuideId: "mens-apparel",
    rating: 4.5,
    reviewCount: 53,
    publishedAt: "2026-04-16",
  },
  {
    slug: "tapered-slim-jeans",
    name: "Tapered Slim Jeans",
    shortDescription: "A mid-rise tapered jean with a touch of stretch.",
    description:
      "A mid rise with a slim thigh and a clean taper below the knee. Two percent elastane keeps the shape without the fabric going slack. Zip fly, five pockets and a full-length inseam.",
    price: 9200,
    categorySlugs: ["mens-fashion", "bottoms"],
    images: [
      ["tapered-slim-jeans-1", "Stack of folded denim in several washes held in someone's arms", "mid-blue"],
      ["tapered-slim-jeans-2", "Close-up of jeans hanging on a rail", "mid-blue"],
    ],
    colors: [
      { name: "Mid Blue", slug: "mid-blue", hex: "#5A7898" },
      { name: "Rinse", slug: "rinse", hex: "#2C3A52" },
      COLOR_BLACK,
    ],
    sizeSet: "mensWaist",
    materials: ["98% cotton, 2% elastane denim, 11.5oz"],
    care: CARE_DENIM,
    sizeGuideId: "mens-bottoms",
    rating: 4.6,
    reviewCount: 147,
    publishedAt: "2025-11-15",
  },

  /* ----------------------------- ACCESSORIES ----------------------------- */
  {
    slug: "quilted-chain-shoulder-bag",
    name: "Quilted Chain Shoulder Bag",
    shortDescription: "A quilted shoulder bag with a removable chain strap.",
    description:
      "A compact quilted body with a structured base, a magnetic flap closure and an interior card slot. The chain-and-leather strap detaches and adjusts so it wears on the shoulder or across the body.",
    price: 14500,
    compareAtPrice: 18000,
    categorySlugs: ["accessories", "womens-fashion"],
    images: [
      ["quilted-chain-shoulder-bag-1", "Flat lay of a black quilted crossbody bag with sunglasses, a watch and rings", "black"],
      ["quilted-chain-shoulder-bag-2", "Black quilted chain bag worn with a white cable knit and pinstripe trousers", "black"],
    ],
    colors: [
      COLOR_BLACK,
      { name: "Bone", slug: "bone", hex: "#E3DACA" },
      { name: "Cognac", slug: "cognac", hex: "#8E5A34" },
    ],
    sizeSet: "oneSize",
    materials: ["Quilted recycled polyester shell", "Antique brass hardware"],
    care: CARE_LEATHER,
    rating: 4.7,
    reviewCount: 82,
    featured: true,
    bestseller: true,
    publishedAt: "2026-05-28",
  },
  {
    slug: "leather-card-wallet",
    name: "Leather Card Wallet",
    shortDescription: "A slim four-slot wallet in vegetable-tanned leather.",
    description:
      "Cut from a single panel of vegetable-tanned leather and folded rather than stitched at the spine, so it stays slim. Four card slots and a centre note pocket. Develops a patina with use.",
    price: 5800,
    categorySlugs: ["accessories"],
    images: [
      ["leather-card-wallet-1", "Flat lay of a tan leather card wallet with sunglasses and a beaded bracelet", "tan"],
      ["leather-card-wallet-2", "Flat lay of a black bag with sunglasses, watch and rings", "tan"],
    ],
    // Single colourway, one size: the only product with exactly one variant,
    // so it adds to the cart without asking the shopper to choose anything.
    colors: [{ name: "Tan", slug: "tan", hex: "#B07A4C" }],
    sizeSet: "oneSize",
    materials: ["100% vegetable-tanned cowhide"],
    care: CARE_LEATHER,
    rating: 4.6,
    reviewCount: 64,
    publishedAt: "2026-03-30",
  },
  {
    slug: "merino-infinity-scarf",
    name: "Merino Infinity Scarf",
    shortDescription: "A chunky ribbed loop scarf in merino wool.",
    description:
      "A wide ribbed loop knitted in merino wool, generous enough to double around the neck. Soft against the skin with no scratch, and it holds its shape rather than stretching out.",
    price: 6400,
    categorySlugs: ["accessories", "mens-fashion", "new-arrivals"],
    images: [
      ["merino-infinity-scarf-1", "Model wearing a grey ribbed infinity scarf with a beanie and denim jacket", "grey"],
      ["merino-infinity-scarf-2", "Rail of neutral knitwear beside dried pampas grass", "grey"],
    ],
    colors: [
      { name: "Grey Marl", slug: "grey", hex: "#A9A9A4" },
      COLOR_CAMEL,
      COLOR_INK,
    ],
    sizeSet: "oneSize",
    materials: ["100% merino wool"],
    care: CARE_KNIT,
    rating: 4.8,
    reviewCount: 39,
    newArrival: true,
    publishedAt: "2026-08-05",
  },
  {
    slug: "heritage-leather-belt",
    name: "Heritage Leather Belt",
    shortDescription: "A 35mm full-grain belt with a brushed pin buckle.",
    description:
      "A 35mm strap in full-grain leather with a brushed nickel pin buckle and a single keeper. Edges are burnished and sealed by hand so they do not fray.",
    price: 5200,
    categorySlugs: ["accessories", "mens-fashion"],
    images: [
      ["heritage-leather-belt-1", "Flat lay of brown leather boots, grey trousers, a leather belt and a white tee", "brown"],
      ["heritage-leather-belt-2", "Flat lay of a black bag with sunglasses, a watch and rings", "brown"],
    ],
    colors: [
      { name: "Brown", slug: "brown", hex: "#6B4630" },
      COLOR_BLACK,
    ],
    sizeSet: "mensWaist",
    materials: ["100% full-grain leather", "Brushed nickel buckle"],
    care: CARE_LEATHER,
    sizeGuideId: "mens-bottoms",
    rating: 4.5,
    reviewCount: 58,
    publishedAt: "2026-01-05",
  },
];

export const products: Product[] = seeds.map(build);

export const productBySlug = new Map(products.map((p) => [p.slug, p]));
export const productById = new Map(products.map((p) => [p.id, p]));
