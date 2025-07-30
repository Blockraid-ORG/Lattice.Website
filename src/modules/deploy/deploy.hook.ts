'use client'
import lockerAbi from '@/abi/locker.abi.json';
import tokenAbi from '@/abi/token.abi.json';
import { useStateModal } from '@/store/useStateModal';

import { TProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAccount, useWalletClient } from 'wagmi';
import { useUpdateAllocation } from '../project/project.query';
// import { useDeployProject } from './deploy.query';

export function useDeployToken() {
  const { setOpen } = useStateModal()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  // const { mutate: deployProject } = useDeployProject()
  const { mutate: updateAllocation } = useUpdateAllocation()
  const deploy = useCallback(
    async (project: TProject) => {
      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')

      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)
      const tokenFactory = new ethers.ContractFactory(tokenAbi.abi, tokenAbi.bytecode, signer)

      const token = await tokenFactory.deploy(
        project.name,
        project.ticker,
        project.totalSupply
      )

      await token.waitForDeployment()
      setOpen(false)
      return token.target as string
    },
    [walletClient, address, setOpen]
  )

  const locker = useCallback(
    async (project: TProject) => {
      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')
      const allocations = project.allocations.filter(i => !i.isPresale && i.vesting > 0)
      for (let i = 0; i < allocations.length; i++) {
        const allocation = allocations[i];
        toast.loading('Deploy Vesting', {
          description: `Starting Deploy ${allocation.name}`
        })
        const durationMonth = allocation.vesting * 30;
        const duration = durationMonth * 24 * 60 * 60;
        const valueScedule = 100 / allocation.vesting * 100
        const schedule = Array(allocation.vesting).fill(valueScedule);
        if (project.contractAddress) {
          const provider = new BrowserProvider(walletClient as any)
          const signer = await provider.getSigner(address)
          const lockerFactory = new ethers.ContractFactory(lockerAbi.abi, lockerAbi.bytecode, signer)
          const token = await lockerFactory.deploy(
            allocation.name,
            project.contractAddress,
            duration,
            schedule
          )
          await token.waitForDeployment()
          toast.dismiss();
          toast.success(`Success Deploy Contract ${allocation.name}`, {
            description: token.target as string,
          })
          updateAllocation({
            projectId: project.id,
            id: allocation.id,
            contractAddress: token.target as string
          })
        }
      }
    },
    [walletClient, address, updateAllocation]
  )
  return {
    deploy,
    locker
  }
}