"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";
import type { ColorOption } from "@/types";
import type { ProductImageInput } from "@/types/admin";

interface ImageManagerProps {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  colors: ColorOption[];
  /** False in demo mode: uploads have nowhere to go, so we accept paths. */
  canUpload: boolean;
  error?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Product photography: upload, order, describe, and tie to a colourway.
 *
 * Uploads go straight from the browser to Supabase Storage, so a 6 MB
 * photograph never passes through a serverless function (which would be slow
 * and would hit request body limits).
 *
 * Order matters and is not decoration: image 1 is the card image, image 2 is
 * the hover image on the storefront grid. The UI says so.
 */
export function ImageManager({
  images,
  onChange,
  colors,
  canUpload,
  error,
}: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [manualUrl, setManualUrl] = useState("");

  const update = (index: number, patch: Partial<ProductImageInput>) => {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(undefined);

    const rejected = Array.from(files).find(
      (file) => !ACCEPTED.includes(file.type) || file.size > MAX_BYTES,
    );
    if (rejected) {
      setUploadError(
        rejected.size > MAX_BYTES
          ? '"' + rejected.name + '" is larger than 8 MB. Export it smaller and try again.'
          : '"' + rejected.name + '" is not a JPEG, PNG, WebP or AVIF.',
      );
      return;
    }

    setUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const added: ProductImageInput[] = [];

      for (const file of Array.from(files)) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path =
          "products/" +
          new Date().getFullYear() +
          "/" +
          crypto.randomUUID() +
          "." +
          extension;

        const { error: uploadFailed } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false });

        if (uploadFailed) throw new Error(uploadFailed.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

        const dimensions = await readDimensions(file);

        added.push({
          url: publicUrl,
          alt: "",
          width: dimensions.width,
          height: dimensions.height,
        });
      }

      onChange([...images, ...added]);
    } catch (failure) {
      setUploadError(
        failure instanceof Error
          ? "Upload failed: " + failure.message
          : "Upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <ul className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li
              key={image.id ?? image.url + index}
              className="flex gap-4 border border-stone bg-paper p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden bg-canvas">
                {image.url && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={image.url.startsWith("http")}
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-micro uppercase tracking-[0.1em] text-muted">
                  {index === 0
                    ? "Image 1 — main product card image"
                    : index === 1
                      ? "Image 2 — shown on hover in the grid"
                      : "Image " + (index + 1)}
                </p>

                <label className="flex flex-col gap-1">
                  <span className="sr-only">
                    {"Alt text for image " + (index + 1)}
                  </span>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(event) => update(index, { alt: event.target.value })}
                    placeholder="Describe the photo, e.g. Model wearing the ivory silk dress"
                    className={cn(
                      "h-10 w-full border bg-paper px-3 text-caption text-ink placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink",
                      image.alt.trim() ? "border-stone-dark" : "border-error",
                    )}
                  />
                </label>

                {colors.length > 1 && (
                  <label className="flex items-center gap-2 text-micro text-muted">
                    Shows colour
                    <select
                      value={image.colorSlug ?? ""}
                      onChange={(event) =>
                        update(index, { colorSlug: event.target.value || undefined })
                      }
                      className="h-9 border border-stone-dark bg-paper px-2 text-caption text-ink focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
                    >
                      <option value="">Any</option>
                      {colors.map((color) => (
                        <option key={color.slug} value={color.slug}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={"Move image " + (index + 1) + " earlier"}
                  className="flex size-8 items-center justify-center text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-30"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label={"Move image " + (index + 1) + " later"}
                  className="flex size-8 items-center justify-center text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={"Remove image " + (index + 1)}
                  className="flex size-8 items-center justify-center text-ink-soft hover:bg-canvas hover:text-error"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canUpload ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            onChange={(event) => handleFiles(event.target.files)}
            className="sr-only"
            id="product-image-upload"
          />
          <Button
            variant="ghost"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="size-4" aria-hidden="true" />
                Upload photos
              </>
            )}
          </Button>
          <p className="mt-2 text-micro text-muted">
            JPEG, PNG, WebP or AVIF, up to 8 MB each. Portrait 3:4 crops suit
            the storefront grid best.
          </p>
        </div>
      ) : (
        <div className="border border-stone-dark bg-canvas p-4">
          <p className="text-caption text-ink-soft">
            Uploads need Supabase Storage. In demo mode you can still point at
            an image already in the project, e.g.{" "}
            <code className="bg-paper px-1 text-micro">
              /images/products/aria-floral-wrap-dress-1.jpg
            </code>
            .
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              placeholder="/images/products/…"
              aria-label="Image path"
              className="h-10 flex-1 border border-stone-dark bg-paper px-3 text-caption text-ink placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
            />
            <Button
              variant="ghost"
              onClick={() => {
                const url = manualUrl.trim();
                if (!url) return;
                onChange([
                  ...images,
                  { url, alt: "", width: 1200, height: 1600 },
                ]);
                setManualUrl("");
              }}
            >
              Add image
            </Button>
          </div>
        </div>
      )}

      <div aria-live="polite">
        {(uploadError ?? error) && (
          <p className="text-caption text-error">{uploadError ?? error}</p>
        )}
      </div>
    </div>
  );
}

/** Reads real pixel dimensions so next/image can reserve the right space. */
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fall back to the storefront's standard ratio rather than failing.
      resolve({ width: 1200, height: 1600 });
    };

    img.src = url;
  });
}
