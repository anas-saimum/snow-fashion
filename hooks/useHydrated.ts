"use client";

import { useEffect, useState } from "react";

/**
 * True only after the first client render.
 *
 * Server HTML cannot know what is in localStorage, so anything driven by a
 * persisted store (cart badge, wishlist state) must wait for this or React
 * will report a hydration mismatch.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
