import dayjs from '@/lib/dayjs';
import { NumberComma } from '@/lib/utils';
import { TProject } from '@/types/project';
import { FormBuyPresale } from './form-buy-presale';
import TableMyContribution from './table-my-contribution';

export default function PresaleInfo({ data }: { data: TProject }) {
  return (
    <div className='relative z-20 px-3 md:px-0'>
      <div className="container bg-white shadow shadow-neutral-100/5 border p-6 dark:bg-neutral-950 rounded-xl my-6">
        <h2 className='text-lg md:text-xl font-semibold'>Presale Info</h2>
        <div className='mt-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 w-full'>
            <div>
              <p className='text-sm text-neutral-500'>Price</p>
              <div className='flex gap-2 items-center'>
                <h2 className='font-bold'>{NumberComma(Number(data?.presales.price))}</h2>
                <p className='text-xs font-medium'>{data.presales.unit.split('/').pop()}/{data.ticker}</p>
              </div>
            </div>
            <div>
              <p className='text-sm text-neutral-500'>Hardcap</p>
              <h2 className='font-bold'>{NumberComma(Number(data?.presales.hardcap))}</h2>
            </div>
            <div>
              <p className='text-sm text-neutral-500'>Max Contribution</p>
              <h2 className='font-bold'>{NumberComma(Number(data?.presales.maxContribution))} {data.ticker}</h2>
            </div>
            <div>
              <p className='text-sm text-neutral-500'>End Date</p>
              <h2 className='font-bold'>{dayjs(data?.presales.startDate).format('DD MMM YYYY')}</h2>
              <p className='text-sm text-neutral-500'>Ends {dayjs(data?.presales.startDate).toNow()}</p>
            </div>
          </div>
          <div className='mt-3 flex justify-start container sticky bottom-0 z-30 px-4 md:px-0 border-b pb-4'>
            <FormBuyPresale data={data} />
          </div>
          <TableMyContribution data={data} />
        </div>
      </div>
    </div>
  )
}
