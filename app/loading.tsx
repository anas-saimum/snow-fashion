import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Default route loading state — a quiet skeleton, not a spinner. */
export default function Loading() {
  return (
    <div className="u-container py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-10 w-72" />
      <div className="mt-12">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
