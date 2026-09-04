"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculateTotals } from "@/lib/pricing";
import type { CartItem, CartTotals } from "@/types";

/**
 * Cart state. Persisted to localStorage for the MVP — see
 * lib/orders/order.service.ts for the note on server-side revalidation
 * before this can take real money.
 *
 * The line-item key is the variant id, so the same product in two sizes is
 * two lines and adding the same variant twice increments one line.
 */

export type NewCartItem = Omit<CartItem, "key" | "addedAt" | "quantity">;

interface CartState {
  items: CartItem[];
  add: (item: NewCartItem, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (incoming, quantity = 1) =>
        set((state) => {
          const key = incoming.variantId;
          const existing = state.items.find((i) => i.key === key);

          if (existing) {
            const nextQty = Math.min(
              existing.quantity + quantity,
              existing.maxQuantity,
            );
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: nextQty } : i,
              ),
            };
          }

          const item: CartItem = {
            ...incoming,
            key,
            quantity: Math.max(1, Math.min(quantity, incoming.maxQuantity)),
            addedAt: new Date().toISOString(),
          };

          return { items: [item, ...state.items] };
        }),

      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.flatMap((i) => {
            if (i.key !== key) return [i];
            if (quantity <= 0) return [];
            return [{ ...i, quantity: Math.min(quantity, i.maxQuantity) }];
          }),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "snow-fashion.cart.v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/* ------------------------------- selectors ------------------------------- */

export const selectCartItems = (s: CartState) => s.items;

export const selectCartCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);

export function useCartTotals(): CartTotals {
  const items = useCartStore(selectCartItems);
  return calculateTotals(items);
}
