import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NumberComma } from '@/lib/utils'
import { useAirdrop } from '@/modules/deploy/deploy.airdrop'
import { TAirdropItem, TEligibleAirdrop } from '@/types/project'
import { ethers } from 'ethers'
import React, { useState } from 'react'
import { useSwitchChain } from 'wagmi'

export default function DetailAirdropList({ data }: { data: TEligibleAirdrop }) {
  const {switchChain} = useSwitchChain()
  const [open, setOpen] = useState(false)
  const {claimMyAirdrop} = useAirdrop()
  async function handleClaim(item:TAirdropItem) {
    const cId = data.chains[0].chain.chainid
    switchChain({chainId: cId})
    claimMyAirdrop(item, data.contractAddress)
  }
  return (
    <div>
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild>
          <Button className='w-full'>Claim Now!</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Claim your airdrop</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>
            <div className='space-y-3'>
              {data.airdrop.map((item, index) => (
                <div key={index} className='flex justify-between border-t pt-2'>
                  <div className='font-semibold'>{
                    NumberComma(Number(ethers.parseUnits(item.amount.toString(), data.decimals).toString()))
                  } {data.ticker}
                  </div>
                  <div>
                    <Button onClick={()=>handleClaim(item)} size='sm' className='px-4' variant='primary'>
                      <Icon className='text-lg' name='ic:baseline-get-app' />
                      Claim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
