import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  /** Lets the wrapping <section> point aria-labelledby at this heading. */
  headingId?: string;
  description?: string;
  link?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
  /** Renders as h1 on pages where this is the page title. */
  as?: "h1" | "h2";
}

export function SectionHeader({
  eyebrow,
  title,
  headingId,
  description,
  link,
  align = "left",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        centered && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && <p className="u-eyebrow mb-3">{eyebrow}</p>}
        <Heading
          id={headingId}
          className={Heading === "h1" ? "text-h1" : "text-h2"}
        >
          {title}
        </Heading>
        {description && (
          <p className="mt-4 text-caption leading-relaxed text-muted sm:text-body">
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-2 text-micro font-medium uppercase tracking-[0.14em] text-ink"
        >
          <span className="u-link">{link.label}</span>
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
