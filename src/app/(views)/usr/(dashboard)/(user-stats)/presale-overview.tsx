'use client'
import { Icon } from '@/components/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountAsset } from '@/modules/user-overview/user-overview.query'

export default function PresaleOverview() {
  const { data, isLoading } = useCountAsset()
  return (
    <div className="bg-chart-gradient relative p-3 md:p-4 rounded-2xl">
      <div>
        <div className="text-sm">Contribution Overview</div>
      </div>
      <div className="py-7 flex items-center gap-2">
        <h2 className="font-semibold text-3xl font-mono text-slate-700 dark:text-slate-200">
          {data?.total}
        </h2>
        <div className='text-xl'>Assets</div>
      </div>
      <div className="flex gap-3">
        {
          data?.items?.map((item, index) => (
            <div className="w-full" key={index}>
              <div className="text-sm font-medium mb-2">{item.projectType}</div>
              <div className="flex items-center gap-2">
                <Icon name={item.icon || "nimbus:share"} />
                <div className="text-xl font-semibold font-mono">{item.projectCount || 0}</div>
              </div>
            </div>
          ))
        }
        {
          isLoading && (
            <div className='flex w-full'>
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-5 w-1/2' />
              </div>
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-12' />
                <Skeleton className='h-5 w-1/2' />
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
