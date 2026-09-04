"use client";

import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  filterOpen: boolean;
  toasts: Toast[];

  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileNav: (open?: boolean) => void;
  toggleFilters: (open?: boolean) => void;
  closeAll: () => void;

  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;

/** Ephemeral UI state — deliberately not persisted. */
export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  filterOpen: false,
  toasts: [],

  openCart: () => set({ cartOpen: true, searchOpen: false, mobileNavOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, mobileNavOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleMobileNav: (open) =>
    set((state) => ({
      mobileNavOpen: open ?? !state.mobileNavOpen,
      cartOpen: false,
      searchOpen: false,
    })),
  toggleFilters: (open) =>
    set((state) => ({ filterOpen: open ?? !state.filterOpen })),
  closeAll: () =>
    set({ cartOpen: false, searchOpen: false, mobileNavOpen: false, filterOpen: false }),

  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: "toast-" + ++toastSeq }].slice(-3),
    })),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
