'use client'
import { MultipleRecipientsFormValues } from '@/app/(views)/usr/my-project/[projectId]/additional-reward/form-add-address';
import AirdropAbi from '@/lib/abis/airdrop.abi.json';
import TokenAbi from '@/lib/abis/erc20.abi.json';
import { TAdditionalReward, TAirdropItem } from '@/types/project';
import { BrowserProvider, ethers } from 'ethers';
import { useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  useRemoveAllocations,
  useSetAllocations,
  useSetClaimedAirdrop
} from '../additional-rewards/additional-reward.query';
export function useAirdrop() {
  const { mutate: createSetAllocations } = useSetAllocations()
  const { mutate: createRemoveAllocations } = useRemoveAllocations()
  const { mutate: setClaimedAirdrop } = useSetClaimedAirdrop()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()

  const deployAirdrop = useCallback(async (data: TAdditionalReward) => {
    try {
      if (!data.project.rewardContractAddress) {
        toast.error('Error', {
          description: "Reward contract address not set!"
        })
        return
      }

      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')

      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)
      const amount = ethers.parseUnits(data.amount.toString(), data.project.decimals)

      const contract = new ethers.Contract(
        data.project.rewardContractAddress,
        AirdropAbi.abi,
        signer
      )
      const contractERC20 = new ethers.Contract(data.project.contractAddress!, TokenAbi.abi, signer);
      const txApprove = await contractERC20.approve(data.project.rewardContractAddress, ethers.parseUnits(data.amount, data.project.decimals));
      await txApprove.wait();
      const _start = dayjs(data.startDateClaim).unix()
      const _end = dayjs(data.endDateClaim).unix()
      const tx = await contract.createClaimWindow(_start, _end, amount)
      const receipt = await tx.wait()
      const event = receipt.logs.find((log: any) => log.fragment?.name === "ClaimWindowCreated")

      if (event) {
        const scheduleId = event.args.scheduleId.toString()
        return { rewardContractAddress: data.project.rewardContractAddress, scheduleId }
      }
    } catch (error: any) {
      console.error("Deploy airdrop failed:", error.message)
    }
  }, [address, walletClient])

  const setAllocations = useCallback(async (
    values: MultipleRecipientsFormValues,
    data: TAdditionalReward
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const d = values.items.map(item => {
      return {
        ...item,
        additionalRewardId: data.id,
      }
    })
    const airdropContract = new ethers.Contract(
      data.contactAddress,
      AirdropAbi.abi,
      signer
    );
    const users = values.items.map(i => i.address)
    const amounts = values.items.map(i => ethers.parseUnits(i.amount.toString(), data.project.decimals))
    const tx = await airdropContract.setAllocations(data.scheduleId, users, amounts);
    await tx.wait();
    createSetAllocations(d)
  }, [address, createSetAllocations, walletClient])

  const clearAllocations = useCallback(async (
    values: string[],
    data: TAdditionalReward
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const airdropContract = new ethers.Contract(
      data.contactAddress,
      AirdropAbi.abi,
      signer
    );
    const tx = await airdropContract.clearAllocations(data.scheduleId, values);
    const d = values.map(i => {
      return {
        address: i,
        additionalRewardId: data.id
      }
    })
    await tx.wait();
    createRemoveAllocations(d);
  }, [address, createRemoveAllocations, walletClient])

  const claimMyAirdrop = useCallback(async (
    data: TAirdropItem,
    contractAddress: string
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const airdropContract = new ethers.Contract(
      contractAddress,
      AirdropAbi.abi,
      signer
    );
    try {
      const tx = await airdropContract.claim(data.schedileId!);
      await tx.wait();
      setClaimedAirdrop(data.id)
      toast.success('Success', {
        description: "Success claim airdrop!"
      });
    } catch (error: any) {
      if (error?.data?.message) {
        console.log("Revert Reason:", error.data.message);
        // 👉 "execution reverted: already claimed"
      } else if (error?.data?.originalError?.message) {
        console.log("Original Reason:", error.data.originalError.message);
      } else if (error?.reason) {
        console.log("Reason:", error.reason);
      } else {
        console.log("Unknown error:", error);
      }
      toast.error('Error', {
        description: error?.sortMessage || "Failed claim airdrop!"
      });
    }
  }, [address, setClaimedAirdrop, walletClient])
  return {
    deployAirdrop,
    setAllocations,
    clearAllocations,
    claimMyAirdrop,
  }
}