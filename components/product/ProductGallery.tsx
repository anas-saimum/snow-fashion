"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Jumps to the first image matching this colour when the swatch changes. */
  activeColorSlug?: string;
}

/**
 * Gallery with thumbnail navigation and pointer-tracking zoom on devices that
 * actually have a hover-capable pointer. Touch devices get the plain image —
 * pinch-zoom already does this job better than any script.
 */
export function ProductGallery({
  images,
  productName,
  activeColorSlug,
}: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [canHover, setCanHover] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!activeColorSlug) return;
    const match = images.findIndex((img) => img.colorSlug === activeColorSlug);
    if (match >= 0) setIndex(match);
  }, [activeColorSlug, images]);

  const current = images[index] ?? images[0];
  if (!current) return null;

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(x + "% " + y + "%");
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-5">
      {/* Main image */}
      <div
        ref={frameRef}
        onMouseEnter={() => canHover && setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={onMouseMove}
        className={cn(
          "relative aspect-3/4 w-full overflow-hidden bg-canvas lg:flex-1",
          canHover && "cursor-zoom-in",
        )}
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          style={{ transformOrigin: origin }}
          className={cn(
            "object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            zooming ? "scale-[1.9] duration-200" : "scale-100",
          )}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="u-no-scrollbar flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label={"Images of " + productName}
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={"View image " + (i + 1) + " of " + images.length}
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-3/4 w-18 shrink-0 overflow-hidden bg-canvas transition-opacity lg:w-full",
                i === index
                  ? "ring-1 ring-ink ring-offset-2 ring-offset-paper"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
