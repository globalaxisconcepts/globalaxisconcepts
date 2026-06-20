import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-line-soft",
        className,
      )}
      {...props}
    />
  );
}

/** Skeleton placeholder shaped like a company / content card. */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-line-soft bg-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-5 h-9 w-full rounded-btn" />
    </div>
  );
}
