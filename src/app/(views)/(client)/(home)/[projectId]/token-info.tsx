import Allocations from '@/app/(views)/usr/my-project/[projectId]/(detail)/allocations'
import { NumberComma } from '@/lib/utils'
import { TProject } from '@/types/project'
import React from 'react'
import ChartAllocations from './chart-allocations'

export default function TokenInfo({ data }: { data: TProject }) {
  return (
    <div className='relative z-20 px-3 md:px-0'>
      <div className="container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl -mt-12 mb-6">
        <h2 className='text-lg md:text-xl font-semibold'>Token Info</h2>
        <div className='flex flex-col md:flex-row mt-4'>
          <div className='flex-1'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              <div>
                <p className='text-sm text-neutral-500'>Token Name</p>
                <h2 className='font-bold'>{data?.name}</h2>
              </div>
              <div>
                <p className='text-sm text-neutral-500'>Ticker</p>
                <h2 className='font-bold'>{data?.ticker}</h2>
              </div>
              <div>
                <p className='text-sm text-neutral-500'>Total Supply</p>
                <h2 className='font-bold'>{NumberComma(Number(data?.totalSupply) || 0)}</h2>
              </div>

            </div>
            <div className='mt-6'>
              {data?.allocations && <Allocations contract={`${data.chains[0].chain.urlScanner}/address/`} totalSupply={data?.totalSupply} data={data?.allocations} />}
            </div>
          </div>
          <div>
            <div className='max-w-1/3 mx-auto'>
              {data?.allocations && <ChartAllocations data={data.allocations} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
