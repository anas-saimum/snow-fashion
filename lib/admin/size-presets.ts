import type { SizeOption } from "@/types";

/**
 * Size sets offered in the editor, matching the guides in data/size-guides.ts.
 *
 * Typing six sizes by hand for every product is the kind of friction that
 * leads to inconsistent labels ("XL" vs "X-Large") and therefore broken
 * filters, so the common sets are one click.
 */
export interface SizePreset {
  id: string;
  label: string;
  sizeGuideId?: string;
  sizes: SizeOption[];
}

const toOptions = (labels: string[]): SizeOption[] =>
  labels.map((label) => ({ label, slug: label.toLowerCase() }));

export const sizePresets: SizePreset[] = [
  {
    id: "womens-alpha",
    label: "Women's XS–XXL",
    sizeGuideId: "womens-apparel",
    sizes: toOptions(["XS", "S", "M", "L", "XL", "XXL"]),
  },
  {
    id: "mens-alpha",
    label: "Men's S–XXL",
    sizeGuideId: "mens-apparel",
    sizes: toOptions(["S", "M", "L", "XL", "XXL"]),
  },
  {
    id: "womens-waist",
    label: "Women's waist 24–34",
    sizeGuideId: "womens-bottoms",
    sizes: toOptions(["24", "26", "28", "30", "32", "34"]),
  },
  {
    id: "mens-waist",
    label: "Men's waist 30–38",
    sizeGuideId: "mens-bottoms",
    sizes: toOptions(["30", "32", "34", "36", "38"]),
  },
  {
    id: "one-size",
    label: "One size",
    sizes: toOptions(["One Size"]),
  },
];

export const sizeGuideOptions = [
  { value: "", label: "No size guide" },
  { value: "womens-apparel", label: "Women's apparel" },
  { value: "mens-apparel", label: "Men's apparel" },
  { value: "womens-bottoms", label: "Women's trousers & denim" },
  { value: "mens-bottoms", label: "Men's trousers & denim" },
];
