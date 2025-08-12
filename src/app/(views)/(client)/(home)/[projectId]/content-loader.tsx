import { Skeleton } from '@/components/ui/skeleton'

export default function ContentLoader() {
  return (
    <div>
      <Skeleton className='pt-[120px] relative rounded-none pb-24 md:pb-12 w-full aspect-auto md:aspect-[12/6] lg:aspect-[1200/300]'>
        <div className="container relative z-10 h-full flex items-center">
          <div className="grid md:grid-cols-2 w-full gap-4 items-start">
            <div>
              <div className='flex gap-4 items-center'>
                <Skeleton className='h-24 w-24 border rounded-xl overflow-hidden' />
                <div className='space-y-1'>
                  <Skeleton className='h-6 w-24 border rounded-xl overflow-hidden' />
                    <Skeleton className='h-6 w-56 border rounded-xl overflow-hidden' />
                    <Skeleton className='h-6 w-32 border rounded-xl overflow-hidden' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Skeleton>
      <div className='relative z-20 px-3 md:px-0'>
        <div className="container rounded-xl -mt-16 mb-6">
          <div className="flex gap-4">
            <Skeleton className='text-lg md:text-xl flex-1 h-12 font-semibold' />
            <Skeleton className='text-lg md:text-xl flex-1 h-12 font-semibold' />
            <Skeleton className='text-lg md:text-xl flex-1 h-12 font-semibold' />
            <Skeleton className='text-lg md:text-xl flex-1 h-12 font-semibold' />
          </div>
          <div className="border mt-8 p-6 rounded-xl">
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
            <div className="flex my-4 gap-4">
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
              <Skeleton className='text-lg md:text-xl flex-1 h-8 font-semibold' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
