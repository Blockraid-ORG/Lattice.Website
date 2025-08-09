'use client'
import { Icon } from '@/components/icon'
import { useCounterProject } from '@/modules/project-stats/project-stats.query'
import Link from 'next/link'
import CardCounterItem from './card-counter-item'
import CardLoader from './card-loader'
export default function CardCounter() {
  const { data, isLoading } = useCounterProject()
  return (
    <div className='mt-6'>
      <h2>Poject Overview</h2>
      <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 mt-2'>
        {
          !isLoading ? (
            <>
              {
                data && data.map((item, index) => (
                  <CardCounterItem key={index} label={item.status} count={item.count} unit='Projects' />
                ))
              }
            </>
          ) : (
            <>
              <CardLoader />
              <CardLoader />
              <CardLoader />
              <CardLoader />
            </>
          )
        }
        <Link href={'/usr/my-project/create'} className='hover:bg-slate-100/50 hover:scale-105 duration-300 border border-dashed p-3 md:p-4 flex items-center justify-center rounded-xl bg-white dark:bg-white/5'>
          <div className='text-center'>
            <Icon name='tabler:plus' />
            <p className='text-xs font-medium text-slate-400'>Create Project</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
