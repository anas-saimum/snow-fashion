import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "./PageHeader";

interface LegalPageProps {
  title: string;
  eyebrow?: string;
  description?: string;
  path: string;
  /** Shows the "needs legal review" banner. Remove once the copy is signed off. */
  draft?: boolean;
  children: ReactNode;
}

/**
 * Shared shell for the policy pages.
 *
 * The draft banner is intentional: this copy is a sensible starting point, not
 * legal advice, and publishing it unreviewed would be a real risk. Set
 * draft={false} once your own terms are in place.
 */
export function LegalPage({
  title,
  eyebrow = "Customer care",
  description,
  path,
  draft = true,
  children,
}: LegalPageProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        trail={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />

      <div className="u-container py-12 lg:py-16">
        <div className="max-w-3xl">
          {draft && (
            <div className="mb-10 flex gap-3 border border-stone-dark bg-canvas p-5">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <p className="text-caption leading-relaxed text-ink-soft">
                <strong className="font-medium">Placeholder content.</strong>{" "}
                This page is a starting template and has not been reviewed by a
                legal professional. Replace it with your own policy before
                trading.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-8">{children}</div>
        </div>
      </div>
    </>
  );
}

/** Consistent typography for a policy section. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-sans text-caption font-medium uppercase tracking-[0.12em] text-ink">
        {heading}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-caption leading-relaxed text-ink-soft sm:text-body">
        {children}
      </div>
    </section>
  );
}
