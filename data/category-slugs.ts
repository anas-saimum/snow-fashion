import { categories } from "./categories";

/**
 * Slug list kept separate so middleware can import it without pulling the
 * full category records (and their imagery metadata) into the edge bundle.
 */
export const categorySlugs: string[] = categories.map((category) => category.slug);
