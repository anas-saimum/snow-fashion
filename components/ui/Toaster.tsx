"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useUIStore } from "@/store/ui";

const TOAST_MS = 4200;

/**
 * Confirmation toasts (added to cart, saved to wishlist).
 * Uses a polite live region so a screen reader announces it without
 * interrupting, and each toast is dismissible by keyboard.
 */
export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), TOAST_MS),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-80 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 border border-stone bg-paper px-4 py-3.5 shadow-raise animate-slide-up"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <p className="text-caption font-medium text-ink">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 truncate text-caption text-muted">
                {toast.description}
              </p>
            )}
            {toast.href && (
              <Link
                href={toast.href}
                onClick={() => dismiss(toast.id)}
                className="u-link mt-1.5 inline-block text-micro font-medium uppercase tracking-[0.12em] text-ink"
              >
                {toast.hrefLabel ?? "View"}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-1 p-1 text-muted transition-colors hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
