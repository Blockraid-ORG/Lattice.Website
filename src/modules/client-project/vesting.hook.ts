'use client'
import lockerAbi from '@/lib/abis/locker.abi.json'
import { TMyVetsing } from "@/types/project"
import { BrowserProvider, Contract } from "ethers"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAccount, useWalletClient } from "wagmi"

export function useVestingHook() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const claim = useCallback(async (
    locker: TMyVetsing
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')

    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    try {
      if (!locker.contractAddress) {
        toast.error('Error', {
          description: `Invalid contract locker`
        })
        return
      }
      const contract = new Contract(
        locker.contractAddress,
        lockerAbi.abi,
        signer
      )
      const vesting = await contract.claim(address)
      const receipt = await vesting.wait()
      console.log(receipt,"R")
    } catch (error:any) {
      console.error(error)
      toast.error('Error', {
        description: `claim vesting failed!`
      })
    }
  }, [address, walletClient])
  return {
    claim
  }

}