"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Wishlist stores product ids only; product data is hydrated at render. */
interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],

      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),

      add: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids
            : [productId, ...state.ids],
        })),

      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),

      clear: () => set({ ids: [] }),
    }),
    {
      name: "snow-fashion.wishlist.v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const selectWishlistIds = (s: WishlistState) => s.ids;
export const selectWishlistCount = (s: WishlistState) => s.ids.length;
