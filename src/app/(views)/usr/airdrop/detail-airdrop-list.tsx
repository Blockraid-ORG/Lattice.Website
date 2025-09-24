import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NumberComma } from '@/lib/utils'
import { useAirdrop } from '@/modules/deploy/deploy.airdrop'
import { TAirdropItem, TEligibleAirdrop } from '@/types/project'
import React, { useState } from 'react'
import { useSwitchChain } from 'wagmi'

export default function DetailAirdropList({ data }: { data: TEligibleAirdrop }) {
  const [claiming, setClaiming] = useState(false)
  const { switchChain } = useSwitchChain()
  const [open, setOpen] = useState(false)
  const { claimMyAirdrop } = useAirdrop()
  async function handleClaim(item: TAirdropItem) {
    setClaiming(true)
    const cId = data.chains[0].chain.chainid
    switchChain({ chainId: cId })
    claimMyAirdrop(item, data.rewardContractAddress!).finally(() => {
      setClaiming(false)
      setOpen(false)
    })
  }
  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        {
          data.isClaimedAll ? (
            <Button disabled className='w-full'>Claimed</Button>
          ) : (
            <Button className='w-full'>Claim Now!</Button>
          )
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl overflow-hidden">
        {
          claiming && (
            <div className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-background/5 flex items-center justify-center backdrop-blur-[2px]">
              <Icon name='icon-park-outline:loading' className='animate-spin text-3xl' />
            </div>
          )
        }
        <DialogHeader>
          <DialogTitle>Claim your airdrop</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <div className='space-y-3'>
            {data.airdrop.map((item, index) => (
              <div key={index} className='flex justify-between border-t pt-2'>
                <div className='font-semibold'>{
                  NumberComma(Number(item.amount))
                } {data.ticker}
                </div>
                <div>
                  {
                    item.isClaimed ? (
                      <div>
                        <Icon className='text-lg' name='mingcute:check-2-line' /> Claimed
                      </div>
                    ) : (
                      <Button
                        disabled={claiming}
                        onClick={() => handleClaim(item)}
                        size='sm' className='px-4' variant='primary'>
                        <Icon className='text-lg' name='ic:baseline-get-app' /> Claim
                      </Button>
                    )
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
