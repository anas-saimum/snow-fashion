"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockScroll } from "@/hooks/useLockScroll";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "right" | "left";
  /** Rendered pinned to the bottom, outside the scroll area. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Side sheet built on the same accessibility contract as Modal.
 * Used for the cart, mobile navigation and the mobile filter panel.
 */
export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  footer,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useLockScroll(open);
  useFocusTrap(panelRef, open, onClose);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-70" role="presentation">
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
        tabIndex={-1}
        style={{
          animationName: side === "left" ? "drawer-in-left" : "drawer-in",
        }}
        className={cn(
          "absolute inset-y-0 flex max-h-dvh w-full max-w-[26.5rem] flex-col bg-paper shadow-panel",
          "animate-drawer-in",
          side === "left" ? "left-0" : "right-0",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone px-5 py-4">
          <h2 className="u-eyebrow text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={"Close " + title.toLowerCase()}
            className="-mr-2 p-2 text-ink transition-colors hover:text-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-stone bg-paper px-5 py-5">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
