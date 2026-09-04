"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Route-level error boundary. Shows a branded recovery screen rather than a
 * white page, and offers a retry before suggesting navigation away.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporting service.
    console.error("[snow-fashion] unhandled error:", error);
  }, [error]);

  return (
    <div className="u-container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="u-eyebrow">Something went wrong</p>

      <h1 className="mt-4 text-h1">We hit a snag</h1>

      <p className="mt-4 max-w-md text-caption leading-relaxed text-muted sm:text-body">
        An unexpected error stopped this page from loading. Trying again often
        clears it; if not, our team would like to hear about it.
      </p>

      {error.digest && (
        <p className="mt-4 text-micro text-stone-dark">
          {"Reference: " + error.digest}
        </p>
      )}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <ButtonLink href="/" variant="ghost" size="lg">
          Back to home
        </ButtonLink>
        <ButtonLink href="/contact" variant="link">
          Report the problem
        </ButtonLink>
      </div>
    </div>
  );
}
