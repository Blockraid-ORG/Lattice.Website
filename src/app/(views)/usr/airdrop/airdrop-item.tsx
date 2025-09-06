import { Icon } from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { NumberComma } from '@/lib/utils';
import { TEligibleAirdrop } from '@/types/project';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useState } from 'react';
import DetailAirdropList from './detail-airdrop-list';

export default function AirdropItem({ data }: { data: TEligibleAirdrop }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const amount = ethers.parseUnits(data.totalEligible.toString(), data.decimals)
  return (
    <div className='rounded-2xl hover:scale-105 duration-200 bg-white dark:bg-white/5 border shadow-md border-slate-300/20 overflow-hidden'>
      <div className='aspect-[4/3] relative p-2 overflow-hidden rounded-xl'>
        {!isLoaded && (
          <Skeleton className="absolute inset-0 flex items-center justify-center bg-neutral-400/20">
            <Icon name="ion:image" className='animate-pulse text-3xl' />
          </Skeleton>
        )}
        <Image
          width={300}
          height={300}
          className='w-full h-full object-cover rounded-lg'
          alt={data.name}
          src={data.banner}
          onLoadingComplete={() => setIsLoaded(true)}
        />
      </div>
      <div className='p-4'>
        <div className='flex items-center gap-1'>
          <div className='h-8 w-8 shrink-0 relative border rounded-full overflow-hidden'>
            <Image
              width={30}
              height={30}
              className='w-full h-full object-cover rounded-lg'
              alt={data.name}
              src={data.logo}
              onLoadingComplete={() => setIsLoaded(true)}
            />
          </div>
          <div className='flex items-center gap-2 flex-1'>
            <h2 className='font-semibold'>{data.ticker}</h2>
            <div>-</div>
            <p className='text-sm md:text-base'>{data.name}</p>
          </div>
        </div>
        <div className='flex font-semibold items-center mt-2 gap-2'>
          <div className='font-bold shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border'>
            {data.airdrop.length}
          </div>
          <div className='flex-1'>Eligible Airdrop</div>
        </div>
        <div className='mt-2 rounded-md p-2 text-sm bg-[#20C997]/10 text-[#20C997]'>
          <div className='font-semibold'>{NumberComma(Number(amount))}</div>
          <div className='text-xs'>{data.ticker}</div>
        </div>
        <div className='mt-3'>
          <DetailAirdropList data={data} />
        </div>
      </div>
    </div>
  )
}
