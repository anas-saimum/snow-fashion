import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "link"
  | "quiet"
  /** For placing on dark photography — never build this by overriding classes. */
  | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Colour, border and background live entirely in the variant map. Appending
 * overrides at the call site is unsafe: Tailwind resolves conflicting
 * utilities by stylesheet order, not attribute order, so an override can lose
 * silently — which is how a white-on-white CTA once shipped. Add a variant
 * instead.
 */
const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-[0.08em] uppercase " +
  "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper border border-ink hover:bg-ink-soft hover:border-ink-soft",
  secondary:
    "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
  ghost:
    "bg-transparent text-ink border border-stone hover:border-ink hover:bg-canvas",
  quiet:
    "bg-canvas text-ink border border-transparent hover:bg-stone",
  link: "bg-transparent text-ink border-0 px-0 underline underline-offset-4 hover:text-accent",
  inverse:
    "bg-paper text-ink border border-paper hover:bg-paper/85 hover:border-paper/85 " +
    "focus-visible:outline-paper",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-micro px-4 py-2.5 min-h-9",
  md: "text-micro px-6 py-3.5 min-h-11",
  lg: "text-caption px-8 py-4 min-h-13 tracking-[0.12em]",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(base, variants[variant], variant !== "link" && sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Same visual language as Button, but a real anchor for real navigation. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...props}
    >
      {children}
    </Link>
  );
}
