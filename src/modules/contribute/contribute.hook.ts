'use client'
import PresaleAbi from '@/lib/abis/presale.abi.json';
import { TProject } from '@/types/project';
import dayjs from 'dayjs';
import { BrowserProvider, ethers } from 'ethers';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { useCreateContribute } from '../transaction-presale/transaction-presale.query';
export function useContribute() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: contributeMutate } = useCreateContribute()

  const contributePresale = useCallback(async (project: TProject, amount: number) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const presaleAddress = project.presales.contractAddress;
    if (!presaleAddress) {
      throw new Error("Presale address is not set");
    }
    const presaleFactory = new ethers.Contract(
      presaleAddress,
      PresaleAbi.abi,
      signer
    );
    try {
      const blockStartTime = await presaleFactory.startTime()
      console.log({ blockStartTime })
      const presaleStartTime = new Date(Number(blockStartTime) * 1000)
      const userAddress = await signer.getAddress();
      const today = dayjs();
      if (!today.isAfter(dayjs(presaleStartTime))) {
        console.log("Presale not started ✅", dayjs(presaleStartTime).format('YYYY MMM DD HH:mm:ss'));
      }
      const tx = await presaleFactory.contribute(userAddress, {
        value: ethers.parseEther(amount.toString())
      })
      contributeMutate({
        presaleId: project.presales.id,
        projectId: project.id,
        price: project.presales.price,
        count: amount,
        transactionHash: tx.hash
      })
    } catch (error: any) {
      const rawMessage =
        error?.error?.data?.message ||
        error?.info?.error?.data?.message ||
        error?.shortMessage ||
        error?.message ||
        "Unknown error";
      toast.error('Ups', {
        description: rawMessage
      })
    }
  }, [address, contributeMutate, walletClient])

  const getMyContribution = useCallback(async (project: TProject) => {

    try {
      if (!walletClient || !address) throw new Error("Wallet not connected")
      const provider = new BrowserProvider(walletClient as any)
      const presaleAddress = project.presales.contractAddress
      if (!presaleAddress) throw new Error("Presale address is not set")
  
      const presaleFactory = new ethers.Contract(presaleAddress, PresaleAbi.abi, provider)
      const contribution = await presaleFactory.getContribution(address)
      return ethers.formatEther(contribution) // hasil dalam ETH
    } catch (error) {
      console.error("Error fetching contribution:", error)
      return "0"
    }
  }, [address, walletClient])

  return {
    contributePresale,
    getMyContribution
  }
}