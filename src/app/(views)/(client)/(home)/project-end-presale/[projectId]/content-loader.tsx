import { Skeleton } from "@/components/ui/skeleton";

export default function ContentLoader() {
  return (
    <main className="container mx-auto px-4 pt-24 pb-24">
      <div className="relative container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl my-6">
        {/* Header Section */}
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-2">
            {/* Project Header */}
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="h-12 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Description */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Smart Contract Audit Section */}
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="flex gap-6 items-center">
              <Skeleton className="w-48 h-48 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-2 mt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="flex flex-col">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <Skeleton className="h-12 w-32 mx-2" />
            <Skeleton className="h-12 w-32 mx-2" />
            <Skeleton className="h-12 w-32 mx-2" />
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Project Token Tab Content */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
