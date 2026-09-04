/** Tiny class-name joiner. Avoids pulling in clsx for a one-line need. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Human-readable reference for demo orders. Not cryptographically random. */
export function orderNumber(date = new Date()): string {
  const stamp = date.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return "SF-" + stamp + "-" + rand;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? singular + "s");
}
