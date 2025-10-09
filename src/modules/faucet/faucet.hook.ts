"use client"
import FaucetAbi from '@/lib/abis/faucet.abi.json';
import { BrowserProvider, ethers } from 'ethers';
import { useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useCreateFaucet } from './faucet.query';
import { toast } from 'sonner';
export function useFaucetHook() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: createFaucet} = useCreateFaucet()
  const requestETH = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) {
      toast.error('Error', {
        description:'Please connect wallet to continue!'
      })
      return
    }
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const faucetContract = new ethers.Contract('0x77ca3ba3954a72fab9836959591b2e54bf3dbba6', FaucetAbi.abi, signer);
    try {
      const tx = await faucetContract.requestETH('2000000000000000');
      console.log("⏳ Transaction sent:", tx.hash);
      await tx.wait();
      createFaucet({
        address: address,
        amount: '2000000000000000',
        unit: 'tBNB',
        txHash: tx.hash
      })
      return tx;
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: 'Request failed!'
      })
    }
  },
    [address, createFaucet, walletClient],
  )

  const requestERC = useCallback(async (addr: string, unit: string) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) {
      if (!walletClient || !address) {
        toast.error('Error', {
          description: 'Please connect wallet to continue!'
        })
        return
      }
    }
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const faucetContract = new ethers.Contract('0x77ca3ba3954a72fab9836959591b2e54bf3dbba6', FaucetAbi.abi, signer);
    try {
      const tx = await faucetContract.requestERC(addr, '100000000');
      createFaucet({
        address: addr,
        amount: '100000000',
        unit: unit,
        txHash: tx.hash
      })
      console.log("⏳ Transaction sent:", tx.hash);
      await tx.wait();
      console.log("✅ Request successful!");
      return tx;
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: 'Request failed!'
      })
    }
  },
    [address, createFaucet, walletClient],
  )

  return {
    requestETH,
    requestERC
  }
}