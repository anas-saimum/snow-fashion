import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "sale" | "ink" | "paper" | "muted" | "success";

const tones: Record<BadgeTone, string> = {
  sale: "bg-sale text-paper",
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink border border-stone",
  muted: "bg-canvas text-ink-soft",
  success: "bg-success text-paper",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "ink", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-micro font-medium uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
