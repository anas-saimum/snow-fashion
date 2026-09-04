"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Stagger in ms. Keep small — this is a nudge, not a performance. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Fades and lifts its children into view once. Users with
 * prefers-reduced-motion get the content immediately, unanimated.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: delay + "ms" } : undefined}
      className={cn("u-reveal", visible && "u-reveal-in", className)}
    >
      {children}
    </Tag>
  );
}
