import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface RatingProps {
  value?: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

/**
 * Renders nothing at all when there is no rating data, or when ratings are
 * switched off in site config. That is deliberate: an empty five-star row
 * implies a zero score, and placeholder scores must never look like reviews.
 */
export function Rating({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}: RatingProps) {
  if (!siteConfig.features.showRatings) return null;
  if (typeof value !== "number" || value <= 0) return null;

  const rounded = Math.round(value * 10) / 10;
  const percent = Math.max(0, Math.min(100, (rounded / 5) * 100));
  const starSize = size === "md" ? 16 : 13;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="relative inline-block leading-none"
        role="img"
        aria-label={rounded + " out of 5"}
      >
        <span className="flex" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={starSize} className="text-stone-dark" />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: percent + "%" }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={starSize} className="shrink-0 text-ink" />
          ))}
        </span>
      </span>

      <span className="text-micro text-muted tabular-nums">
        {rounded.toFixed(1)}
        {showCount && count ? " (" + count + ")" : null}
      </span>
    </div>
  );
}

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 1.6l2.47 5.3 5.83.72-4.28 4.02 1.1 5.76L10 14.62l-5.12 2.78 1.1-5.76L1.7 7.62l5.83-.72L10 1.6z" />
    </svg>
  );
}
