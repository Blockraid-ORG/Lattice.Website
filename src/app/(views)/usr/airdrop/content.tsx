'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEligibleAirdrop } from '@/modules/additional-rewards/additional-reward.query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AirdropItem from './airdrop-item'

export default function AirdropContent() {
  const searchParams = useSearchParams()
  const isClaimed = searchParams.get('isClaimed')
  const { data } = useEligibleAirdrop()
  return (
    <>
      <div className='flex gap-2 items-center flex-wrap mb-4'>
        <Button
          variant={!isClaimed ? 'primary' : 'outline'}
          className={cn(
            'rounded-full'
          )} asChild>
          <Link href={'/usr/airdrop'}>All</Link>
        </Button>
        <Button
          variant={isClaimed === '0' ? 'primary' : 'outline'}
          className={cn(
            'rounded-full'
          )} asChild>
          <Link href={`/usr/airdrop?isClaimed=0`}>Eligible</Link>
        </Button>
        <Button
          variant={isClaimed === '1' ? 'primary' : 'outline'}
          className={cn(
            'rounded-full'
          )} asChild>
          <Link href={`/usr/airdrop?isClaimed=1`}>Claimed</Link>
        </Button>
      </div>
      <div className='grid gap-1 md:gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {
          data?.map((item, index) => (
            <AirdropItem key={index} data={item} />
          ))
        }
      </div>
    </>
  )
}
