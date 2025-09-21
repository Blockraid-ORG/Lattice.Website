'use client'
import lockerAbi from '@/lib/abis/locker.abi.json'
import { TAddressAmount, TAllocation } from "@/types/project"
import { BrowserProvider, Contract } from "ethers"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAccount, useWalletClient } from "wagmi"
import {
  useCreateProjectAllocationAddress,
  useFinalizeProjectAllocation
} from '../project/project.query'

export function convertToAllocations(data: TAddressAmount[]) {
  const total = data.reduce((sum, b) => sum + Number(b.amount), 0);
  const addrs = data.map((b) => b.address);
  const allocations = data.map((b) =>
    Math.floor((Number(b.amount) * 10000) / total)
  );
  const diff = 10000 - allocations.reduce((a, b) => a + b, 0);
  if (diff !== 0) allocations[allocations.length - 1] += diff;
  return { addrs, allocations };
}


export function useManageLocker() {
  const { mutate: createProjectAllocationAddress } = useCreateProjectAllocationAddress()
  const { mutate: finalizeProjectAllocation } = useFinalizeProjectAllocation()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const setBeneficiaries = useCallback(async (
    values: TAddressAmount[],
    locker: TAllocation
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
      const isFinalized = await contract.finalized()
      if (isFinalized) {
        toast.error('Error', {
          description: `Locker is finalized!`
        })
        return
      }
      const { addrs, allocations } = convertToAllocations(values);
      const tx = await contract.setBeneficiaries(addrs, allocations);
      const receipt = await tx.wait();
      toast.success('Success', {
        description: `Set Beneficiaries success! : ${receipt.hash}`
      })
      createProjectAllocationAddress({
        projectAllocationId: locker.id,
        items: values
      })
    } catch {
      toast.error('Error', {
        description: `Set Beneficiaries failed!`
      })
    }
  }, [address, createProjectAllocationAddress, walletClient])

  const finalizeAllocation = useCallback(async (locker: TAllocation) => {
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

      const isFinalized = await contract.finalized();
      if (!isFinalized) {
        const tx = await contract.finalize();
        const receipt = await tx.wait();
        toast.success('Success', {
          description: `Set Beneficiaries success! : ${receipt.hash}`
        })
        finalizeProjectAllocation(locker.id)
      }
    } catch {
      toast.error('Error', {
        description: `Set finalize failed!`
      })
    }
  }, [address, finalizeProjectAllocation, walletClient])

  return {
    setBeneficiaries,
    finalizeAllocation
  }

}