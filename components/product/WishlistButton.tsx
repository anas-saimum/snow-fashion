"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  variant?: "icon" | "labelled";
  /** Matches the Button sizes so it can sit level with a primary CTA. */
  size?: "md" | "lg";
  className?: string;
}

export function WishlistButton({
  productId,
  productName,
  variant = "icon",
  size = "md",
  className,
}: WishlistButtonProps) {
  const hydrated = useHydrated();
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const pushToast = useUIStore((s) => s.pushToast);

  const saved = hydrated && ids.includes(productId);

  const onClick = () => {
    toggle(productId);
    pushToast({
      title: saved ? "Removed from wishlist" : "Saved to wishlist",
      description: productName,
      href: saved ? undefined : "/wishlist",
      hrefLabel: "View wishlist",
    });
  };

  if (variant === "labelled") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center justify-center gap-2 border border-stone text-micro font-medium uppercase tracking-[0.1em] transition-colors",
          size === "lg" ? "min-h-13 px-8" : "min-h-11 px-5",
          saved ? "border-ink bg-ink text-paper" : "text-ink hover:border-ink",
          className,
        )}
      >
        <Heart
          className={cn("size-4", saved && "fill-current")}
          aria-hidden="true"
        />
        {saved ? "Saved" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={
        saved
          ? "Remove " + productName + " from wishlist"
          : "Save " + productName + " to wishlist"
      }
      className={cn(
        "flex size-9 items-center justify-center bg-paper/90 text-ink backdrop-blur-sm transition-colors hover:bg-paper",
        className,
      )}
    >
      <Heart
        className={cn("size-4", saved && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
