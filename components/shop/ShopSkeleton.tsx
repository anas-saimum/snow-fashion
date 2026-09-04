import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Placeholder for the streaming listing: toolbar, filter rail and grid. */
export function ShopSkeleton() {
  return (
    <div className="u-container pb-20 pt-8">
      <div className="flex gap-10 xl:gap-14">
        <div className="hidden w-60 shrink-0 flex-col gap-6 lg:flex xl:w-64">
          <Skeleton className="h-3 w-16" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-stone pb-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-40" />
          </div>
          <div className="pt-8 lg:pt-10">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
