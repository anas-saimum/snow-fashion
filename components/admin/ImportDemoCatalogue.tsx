"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { importDemoCatalogueAction } from "@/app/admin/actions";
import { useUIStore } from "@/store/ui";

/**
 * Shown on the overview only when the catalogue has no products.
 *
 * A brand-new Supabase project is empty, which leaves the storefront looking
 * broken — every grid blank, every category a dead end. Importing the demo
 * catalogue gives something real to edit, and it exercises the whole write
 * path before you trust it with your own photography.
 */
export function ImportDemoCatalogue({ canImport }: { canImport: boolean }) {
  const router = useRouter();
  const pushToast = useUIStore((s) => s.pushToast);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const run = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await importDemoCatalogueAction();

      if (!result.ok) {
        setError(result.message);
        return;
      }

      pushToast({ title: result.message ?? "Imported." });
      router.refresh();
    });
  };

  return (
    <div className="border border-stone bg-paper p-6 sm:p-8">
      <span className="flex size-11 items-center justify-center border border-stone text-accent">
        <Download className="size-5" aria-hidden="true" />
      </span>

      <h2 className="mt-5 text-h3">Start with the demo catalogue</h2>

      <p className="mt-3 text-caption leading-relaxed text-ink-soft">
        Load 37 demo products across 8 categories, with sizes, colours, stock
        and placeholder photography. It gives the storefront something to show
        while you prepare your own, and everything is editable or deletable
        afterwards.
      </p>

      <p className="mt-3 text-caption leading-relaxed text-muted">
        The photographs are Unsplash placeholders, not Snow Fashion garments —
        replace them before launch. This only runs on an empty catalogue, so it
        cannot overwrite your own work.
      </p>

      <div aria-live="polite">
        {error && (
          <p className="mt-5 border border-error bg-paper p-3 text-caption text-error">
            {error}
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {canImport ? (
          <Button size="lg" onClick={run} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Importing…
              </>
            ) : (
              "Import demo catalogue"
            )}
          </Button>
        ) : (
          <p className="text-caption text-muted">
            Connect Supabase to import — there is nowhere to write to yet.
          </p>
        )}

        <ButtonLink href="/admin/products/new" variant="ghost" size="lg">
          Add my own product instead
        </ButtonLink>
      </div>
    </div>
  );
}
