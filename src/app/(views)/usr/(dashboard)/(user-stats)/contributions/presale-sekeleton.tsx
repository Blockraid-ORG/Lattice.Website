import { Skeleton } from "@/components/ui/skeleton"

export function PresaleSkeleton() {
  return (
    <div className="flex gap-2 relative border p-4 rounded-lg">
      {/* Logo */}
      <div className="w-12 aspect-square relative shrink-0">
        <Skeleton className="w-full h-full rounded-md" />
      </div>

      {/* Text section */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Ticker + Name + Badge */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-10" /> {/* ticker */}
          <Skeleton className="h-4 w-24" /> {/* name */}
          <Skeleton className="h-4 w-12 rounded-full" /> {/* badge */}
        </div>

        {/* Category */}
        <div className="flex gap-1 text-sm items-center">
          <Skeleton className="h-4 w-4 rounded-full" /> {/* icon */}
          <Skeleton className="h-3 w-20" /> {/* category name */}
        </div>
      </div>
    </div>
  )
}
