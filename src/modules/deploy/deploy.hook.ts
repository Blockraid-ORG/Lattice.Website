'use client'
import tokenAbi from '@/abi/token.abi.json'
import lockerAbi from '@/abi/locker.abi.json'
import { useStateModal } from '@/store/useStateModal';

import { TFormProject } from '@/types/project';
import { BrowserProvider, ethers } from "ethers";
import { useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

export function useDeployToken() {
  const { setOpen } = useStateModal()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const deploy = useCallback(
    async (project: TFormProject) => {
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
    async (project: TFormProject) => {
      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')

      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)
      const lockerFactory = new ethers.ContractFactory(lockerAbi.abi, lockerAbi.bytecode, signer)

      const token = await lockerFactory.deploy(
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
  return {
    deploy,
    locker
  }
}