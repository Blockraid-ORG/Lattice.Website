import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function LoadingItem({ count = 6 }: { count: number }) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {
        [...Array(count)].map((_, index) => (
          <div className='rounded-2xl  p-2 bg-slate-400/10 border shadow-md border-slate-300/20 overflow-hidden' key={index}>
            <div className='aspect-[4/3] relative overflow-hidden rounded-xl'>
              <Skeleton className="flex h-full w-full" />
            </div>
            <div className='mt-3 space-y-1'>
              <Skeleton className="flex h-6 w-32" />
              <Skeleton className="flex h-6" />
              <Skeleton className="flex h-6" />
              <Skeleton className="flex h-6 w-32 ml-auto" />
            </div>
          </div>
        ))
      }
    </div>
  )
}
