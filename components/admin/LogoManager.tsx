"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveLogoAction } from "@/app/admin/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { useUIStore } from "@/store/ui";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];

export function LogoManager({
  logoUrl,
  canUpload,
}: {
  logoUrl?: string;
  canUpload: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pushToast = useUIStore((s) => s.pushToast);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [current, setCurrent] = useState(logoUrl);

  const save = (url: string | null) => {
    startTransition(async () => {
      const result = await saveLogoAction(url);
      pushToast({
        title: result.ok ? (result.message ?? "Saved.") : "Could not save",
        description: result.ok ? undefined : result.message,
      });
      if (result.ok) setCurrent(url ?? undefined);
    });
  };

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(undefined);

    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, SVG, WebP or JPEG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep the logo under 2 MB.");
      return;
    }

    setUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = "brand/logo-" + Date.now() + "." + extension;

      const { error: failed } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: true });

      if (failed) throw new Error(failed.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

      save(publicUrl);
    } catch (failure) {
      setError(
        failure instanceof Error ? "Upload failed: " + failure.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6 border border-stone bg-paper p-5">
        <div className="relative h-14 w-44 shrink-0 bg-canvas">
          {current ? (
            <Image
              src={current}
              alt="Current Snow Fashion logo"
              fill
              sizes="176px"
              className="object-contain p-2"
              unoptimized
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <span className="u-wordmark text-caption text-ink">Snow Fashion</span>
            </span>
          )}
        </div>

        <p className="text-caption text-muted">
          {current
            ? "Using an uploaded logo."
            : "Using the typographic wordmark — no image uploaded."}
        </p>

        {current && (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => save(null)}
            className="ml-auto"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Use wordmark instead
          </Button>
        )}
      </div>

      {canUpload ? (
        <div>
          <input
            ref={inputRef}
            id="logo-upload"
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={(event) => upload(event.target.files?.[0])}
            className="sr-only"
          />
          <Button
            variant="ghost"
            disabled={uploading || pending}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="size-4" aria-hidden="true" />
                {current ? "Replace logo" : "Upload logo"}
              </>
            )}
          </Button>
        </div>
      ) : (
        <p className="border border-stone-dark bg-canvas p-4 text-caption text-ink-soft">
          Logo upload needs Supabase Storage. Connect it and this becomes an
          upload button.
        </p>
      )}

      <div aria-live="polite">
        {error && <p className="text-caption text-error">{error}</p>}
      </div>
    </div>
  );
}
