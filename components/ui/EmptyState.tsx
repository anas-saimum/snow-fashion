import type { ReactNode } from "react";
import { ButtonLink } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
}

/** Shared empty state for cart, wishlist, search and filtered grids. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {icon && (
        <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-stone text-muted">
          {icon}
        </div>
      )}

      <h2 className="text-h3">{title}</h2>

      {description && (
        <p className="mt-3 max-w-sm text-caption text-muted">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <ButtonLink href={action.href} variant="primary">
              {action.label}
            </ButtonLink>
          )}
          {secondaryAction && (
            <ButtonLink href={secondaryAction.href} variant="ghost">
              {secondaryAction.label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}
