import dayjs from '@/lib/dayjs';
import { NumberComma } from '@/lib/utils';
import { TProject } from '@/types/project';

export default function PresaleInfo({ data }: { data: TProject }) {
  const totalPresale = data.allocations.find(i => i.isPresale)?.supply;
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
          <div className='space-y-1 mt-4'>
            <div className="flex justify-between">
              <h2>Progress</h2>
              <p className='text-sm font-semibold'>30% form {NumberComma(Number(data.totalSupply) * totalPresale!)}</p>
            </div>
            <div className='bg-primary h-3 rounded-full relative overflow-hidden'>
              <div
                className='bg-[#20C997] h-full rounded-full'
                style={{
                  width: '30%',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
