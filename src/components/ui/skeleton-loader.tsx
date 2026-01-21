import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Basic skeleton shimmer element
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    />
  );
}

/**
 * Skeleton for inventory item card
 */
export function InventoryItemSkeleton() {
  return (
    <div className="p-4 flex items-center gap-3 border rounded-lg bg-card">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for home screen stats card
 */
export function StatsCardSkeleton() {
  return (
    <div className="p-4 border rounded-xl bg-card flex flex-col items-center">
      <Skeleton className="w-10 h-10 rounded-full mb-2" />
      <Skeleton className="h-8 w-12 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * Skeleton for list screen
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <InventoryItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for home screen
 */
export function HomeScreenSkeleton() {
  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Pantry Card */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

