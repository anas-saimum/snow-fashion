import Image from "next/image";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  trail?: Crumb[];
  /** Optional editorial banner behind the title. */
  image?: { url: string; alt: string };
  align?: "left" | "center";
}

/**
 * Consistent page masthead used by shop, category, and the content pages.
 * With an image it becomes a short editorial banner; without one it stays a
 * quiet typographic header so listing pages get to the products quickly.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  trail,
  image,
  align = "left",
}: PageHeaderProps) {
  if (image) {
    return (
      <header className="relative isolate border-b border-stone">
        <div className="relative min-h-[18rem] w-full lg:min-h-[24rem]">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-ink/50" />

          <div className="relative flex min-h-[18rem] items-end lg:min-h-[24rem]">
            <div className="u-container pb-10 pt-16">
              {trail && (
                <div className="mb-5 [&_a]:text-paper/70 [&_a:hover]:text-paper [&_span]:text-paper/90">
                  <Breadcrumbs trail={trail} />
                </div>
              )}
              {eyebrow && <p className="u-eyebrow text-paper/70">{eyebrow}</p>}
              <h1 className="mt-3 max-w-3xl text-h1 text-paper">{title}</h1>
              {description && (
                <p className="mt-4 max-w-xl text-caption leading-relaxed text-paper/85 sm:text-body">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-stone bg-paper">
      <div className="u-container py-10 lg:py-14">
        {trail && (
          <div className="mb-6">
            <Breadcrumbs trail={trail} />
          </div>
        )}

        <div className={cn(align === "center" && "mx-auto max-w-2xl text-center")}>
          {eyebrow && <p className="u-eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-h1">{title}</h1>
          {description && (
            <p
              className={cn(
                "mt-4 max-w-xl text-caption leading-relaxed text-muted sm:text-body",
                align === "center" && "mx-auto",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
