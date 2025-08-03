'use client'
import tokenAbi from '@/abi/token.abi.json';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NumberComma } from '@/lib/utils';

import { TAllocation, TProject } from "@/types/project"
import { BrowserProvider, ethers } from "ethers"
import { useState } from "react"
import { toast } from 'sonner';
import { useAccount, useWalletClient } from "wagmi"

export function TransferVesting({ data }: { data: TProject }) {
  const [open, setOpen] = useState(false)
  const [tranferTargets, setTranferTargets] = useState<TAllocation[]>([])
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  async function handleTranfer() {
    const vestingWithContracts = data.allocations.filter(item => {
      return item.contractAddress && item.vesting > 0
    })
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    if (data.contractAddress) {
      setIsSubmitting(true)
      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner();
      const transferFactory = new ethers.Contract(data.contractAddress, tokenAbi.abi, signer)
      for (let i = 0; i < vestingWithContracts.length; i++) {
        const vesting = vestingWithContracts[i];
        try {
          setIsSubmitting(true)
          const decimals = await transferFactory.decimals();
          const amount = Number(data.totalSupply) * (vesting.supply / 100)
          const amountConv = ethers.parseUnits(amount.toString(), decimals)
          console.log({
            amount,
            amountConv: ethers.parseUnits(amount.toString(), decimals)
          })
          const tx = await transferFactory.transfer(vesting.contractAddress, amountConv);
          console.log({ tx });
          await tx.wait();
          console.log("✅ Transfer complete!");
        } catch (err) {
          toast.success('Done!', {
            description: `Transfer to each vesting has been done`,
            position: `top-center`,
          })
          console.error("❌ Error occurred:", err);
          setIsSubmitting(false)
          setOpen(false)
          return
        }
      }
      toast.success('Done!', {
        description: `Transfer to each vesting has been done`,
        position: `top-center`,
      })
      setIsSubmitting(false)
      setOpen(false)
    }
  }
  function handleOpen(state: boolean) {
    const vestingWithContracts = data.allocations.filter(item => {
      return item.contractAddress && item.vesting > 0
    })
    setTranferTargets(vestingWithContracts)
    setOpen(state)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size={'lg'} className="w-48">Test Transfer Vesting</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Transfer</DialogTitle>
          <DialogDescription>
            You Will Transfer To {tranferTargets.length} Vesting Bellow!
          </DialogDescription>
        </DialogHeader>
        <div>
          {
            tranferTargets.map((item, index) => (
              <div key={index} className='my-1 border p-2 text-sm'>
                <div className='flex items-center gap-2 justify-between'>
                  <div className='w-32 shrink-0'>Name</div>
                  <div>:</div>
                  <div className='flex-1'>{item.name}</div>
                </div>
                <div className='flex items-center gap-2 justify-between'>
                  <div className='w-32 shrink-0'>Amount</div>
                  <div>:</div>
                  <div className='flex-1 break-all'>{NumberComma(Number(data.totalSupply) * (item.supply / 100))}</div>
                </div>
                <div className='flex items-center gap-2 justify-between'>
                  <div className='w-32 shrink-0'>To</div>
                  <div>:</div>
                  <div className='flex-1 break-all'>
                    <a className="text-sm font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${data.contractAddress}`} target="_blank" rel="noopener noreferrer">
                      {data.contractAddress}</a>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={isSubmitting} onClick={handleTranfer}>
            {isSubmitting ? 'Transfering...' : 'Tranfer Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
