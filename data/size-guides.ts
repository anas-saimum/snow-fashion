import type { SizeGuide } from "@/types";

/** Measurements are in centimetres. Replace with your own grading sheets. */
export const sizeGuides: SizeGuide[] = [
  {
    id: "womens-apparel",
    title: "Women's apparel",
    note: "Measurements describe the body, not the garment. If you fall between two sizes, we recommend taking the larger.",
    columns: ["Size", "UK", "EU", "US", "Bust", "Waist", "Hip"],
    rows: [
      ["XS", "6", "34", "2", "80", "62", "88"],
      ["S", "8", "36", "4", "84", "66", "92"],
      ["M", "10", "38", "6", "88", "70", "96"],
      ["L", "12", "40", "8", "94", "76", "102"],
      ["XL", "14", "42", "10", "100", "82", "108"],
      ["XXL", "16", "44", "12", "106", "88", "114"],
    ],
  },
  {
    id: "mens-apparel",
    title: "Men's apparel",
    note: "Chest is measured under the arms at the fullest point.",
    columns: ["Size", "Chest", "Waist", "Sleeve", "Neck"],
    rows: [
      ["S", "89–94", "76–81", "84", "38"],
      ["M", "97–102", "84–89", "86", "40"],
      ["L", "104–109", "91–97", "88", "42"],
      ["XL", "112–117", "99–104", "90", "44"],
      ["XXL", "119–124", "107–112", "92", "46"],
    ],
  },
  {
    id: "womens-bottoms",
    title: "Women's trousers & denim",
    note: "Sizes are given in inches of waist measurement.",
    columns: ["Size", "Waist (in)", "Waist (cm)", "Hip (cm)", "Inseam (cm)"],
    rows: [
      ["24", "24", "61", "86", "76"],
      ["26", "26", "66", "91", "76"],
      ["28", "28", "71", "96", "78"],
      ["30", "30", "76", "101", "78"],
      ["32", "32", "81", "106", "80"],
      ["34", "34", "86", "111", "80"],
    ],
  },
  {
    id: "mens-bottoms",
    title: "Men's trousers & denim",
    columns: ["Size", "Waist (in)", "Waist (cm)", "Hip (cm)", "Inseam (cm)"],
    rows: [
      ["30", "30", "76", "94", "81"],
      ["32", "32", "81", "99", "81"],
      ["34", "34", "86", "104", "83"],
      ["36", "36", "91", "109", "83"],
      ["38", "38", "97", "114", "84"],
    ],
  },
];

export const sizeGuideById = new Map(sizeGuides.map((g) => [g.id, g]));
