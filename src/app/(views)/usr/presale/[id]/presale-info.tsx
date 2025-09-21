'use client'
import TimeCountDown from '@/components/time-count-down';
import dayjs from '@/lib/dayjs';
import { NumberComma } from '@/lib/utils';
import { TProject } from '@/types/project';
import FormContribute from './form-contribute';
import MyContributionInfo from './my-contribution-info';

export default function PresaleInfo({ data }: { data: TProject }) {
  
  return (
    <div className='z-20 px-3 md:px-0'>
      <div className="relative container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl my-6">
        <h2 className='text-lg md:text-xl font-semibold'>Presale</h2>
        <div className='mt-4'>
          {
            data.presales.map(presale => (
              <div key={presale.id}>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-full'>
                  <div>
                    <p className='text-sm text-neutral-500'>Price</p>
                    <div className='flex gap-2 items-center'>
                      <h2 className='font-bold'>{NumberComma(Number(presale.price))}</h2>
                      <p className='text-xs font-medium'>{presale.unit.split('/').pop()}/{data.ticker}</p>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Hardcap</p>
                    <h2 className='font-bold'>{NumberComma(Number(presale.hardcap))} {data.chains[0].chain.ticker}</h2>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Max Contribution</p>
                    <h2 className='font-bold'>{NumberComma(Number(presale.maxContribution))} {data.chains[0].chain.ticker}</h2>
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>Start Date</p>
                    <h2 className='font-bold'>{dayjs(presale.startDate).format('YYYY-MM-DD HH:mm')}</h2>
                    <TimeCountDown date={presale.startDate} />
                  </div>
                  <div>
                    <p className='text-sm text-neutral-500'>End Date</p>
                    <h2 className='font-bold'>{dayjs(presale.endDate).format('YYYY-MM-DD HH:mm')}</h2>
                    <TimeCountDown date={presale.endDate} />
                  </div>
                </div>
                <div className='flex gap-2 justify-end pt-4 border-t mt-4'>
                  <FormContribute data={data} presale={presale} />
                </div>
                <MyContributionInfo data={data} presale={presale} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
