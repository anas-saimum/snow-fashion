import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Set on pages where the wordmark is the h1 (i.e. never — kept explicit). */
  as?: "link" | "plain";
}

const sizes = {
  sm: "text-[0.8125rem] sm:text-sm",
  md: "text-[0.9375rem] sm:text-base",
  lg: "text-lg sm:text-xl",
};

/**
 * The Snow Fashion wordmark: an elegant serif set in wide-tracked caps, split
 * across two weights so "SNOW" leads and "FASHION" sits back. Typographic
 * only — no icon, nothing to redraw when the brand evolves.
 */
export function Logo({ className, size = "md", as = "link" }: LogoProps) {
  const mark = (
    <span className={cn("u-wordmark flex items-baseline gap-[0.34em]", sizes[size])}>
      <span className="font-normal">Snow</span>
      <span className="font-light text-ink-soft">Fashion</span>
    </span>
  );

  if (as === "plain") {
    return <span className={className}>{mark}</span>;
  }

  return (
    <Link
      href="/"
      aria-label={siteConfig.name + " — home"}
      // No display utility here on purpose: callers pass `hidden lg:block`,
      // and Tailwind resolves conflicting display classes by stylesheet order,
      // not by the order they appear in the attribute. A base `inline-block`
      // would silently win and render both header wordmarks at once.
      className={cn("text-ink transition-opacity duration-200 hover:opacity-70", className)}
    >
      {mark}
    </Link>
  );
}
