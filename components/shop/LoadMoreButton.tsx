"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { PAGE_SIZE } from "@/lib/url-state";

/**
 * "Load more" by growing the `show` param and re-rendering on the server.
 * Keeps the grid crawlable and the URL a complete description of the view,
 * which client-side accumulation would lose.
 */
export function LoadMoreButton({
  shown,
  total,
}: {
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (shown >= total) return null;

  const onClick = () => {
    const next = new URLSearchParams(params.toString());
    next.set("show", String(shown + PAGE_SIZE));

    startTransition(() => {
      router.push(pathname + "?" + next.toString(), { scroll: false });
    });
  };

  const remaining = total - shown;

  return (
    <div className="mt-14 flex flex-col items-center gap-4">
      <p className="text-micro text-muted tabular-nums">
        {"Showing " + shown + " of " + total}
      </p>

      <Button variant="secondary" size="lg" onClick={onClick} disabled={pending}>
        {pending
          ? "Loading…"
          : "Load " + Math.min(PAGE_SIZE, remaining) + " more"}
      </Button>
    </div>
  );
}
