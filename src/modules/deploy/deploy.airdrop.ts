'use client'
import { MultipleRecipientsFormValues } from '@/app/(views)/usr/my-project/[projectId]/additional-reward/form-add-address';
import AirdropAbi from '@/lib/abis/airdrop.abi.json';
import { TAdditionalReward } from '@/types/project';
import dayjs from 'dayjs';
import { BrowserProvider, ethers } from 'ethers';
import { useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useRemoveAllocations, useSetAllocations } from '../additional-rewards/additional-reward.query';
export function useAirdrop() {
  const { mutate: createSetAllocations } = useSetAllocations()
  const { mutate: createRemoveAllocations } = useRemoveAllocations()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const deployAirdrop = useCallback(async (
    data: TAdditionalReward
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    const airdropContract = new ethers.ContractFactory(
      AirdropAbi.abi,
      AirdropAbi.bytecode,
      signer
    );

    const initialOwner = await signer.getAddress()
    const claimStart = dayjs(data.startDateClaim).unix()
    const claimEnd = dayjs(data.endDateClaim).unix()
    const tokenAddress = data.project.contractAddress
    const contract = await airdropContract.deploy(initialOwner, tokenAddress, claimStart, claimEnd);
    await contract.waitForDeployment();

    return contract.target;
  }, [address, walletClient]);

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
    const tx = await airdropContract.setAllocations(users, amounts);
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
    const tx = await airdropContract.clearAllocations(values);
    const d = values.map(i => {
      return {
        address: i,
        additionalRewardId: data.id
      }
    })
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    createRemoveAllocations(d);
    console.log("Clear allocations successfully!");
  }, [address, createRemoveAllocations, walletClient])

  return {
    deployAirdrop,
    setAllocations,
    clearAllocations
  }
}