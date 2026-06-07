'use client'
import lockerAbi from '@/lib/abis/locker.abi.json'
import { getSigner } from '@/lib/get-signer'
import { TMyVetsing } from "@/types/project"
import {Contract } from "ethers"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"

export function useVestingHook() {
  const { address } = useAccount()
  const claim = useCallback(async (
    locker: TMyVetsing
  ) => {
    const signer = await getSigner()
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
  }, [address])
  return {
    claim
  }
}