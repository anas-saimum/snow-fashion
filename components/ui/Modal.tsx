"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockScroll } from "@/hooks/useLockScroll";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Announced as the dialog's accessible name. */
  title: string;
  /** Hide the visible heading but keep it for assistive tech. */
  hideTitle?: boolean;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const widths = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-5xl",
};

/**
 * Accessible dialog: portalled, scrim click-to-close, Escape to close, focus
 * trapped and restored, aria-modal with a labelled heading.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle,
  description,
  size = "md",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useLockScroll(open);
  useFocusTrap(panelRef, open, onClose);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-70 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-ink/45 animate-scrim-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden bg-paper shadow-panel",
          "animate-slide-up sm:animate-fade-in",
          widths[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2
              className={cn(
                "text-h3",
                hideTitle && "sr-only",
              )}
            >
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-caption text-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-2 -mt-1 shrink-0 p-2 text-ink transition-colors hover:text-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
