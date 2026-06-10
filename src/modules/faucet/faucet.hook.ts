"use client"
import FaucetAbi from '@/lib/abis/faucet.abi.json';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useCreateFaucet } from './faucet.query';
import { toast } from 'sonner';
import { getSigner } from '@/lib/get-signer';
export function useFaucetHook() {
  const { address } = useAccount()
  const { mutate: createFaucet} = useCreateFaucet()
  const requestETH = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!address) {
      toast.error('Error', {
        description:'Please connect wallet to continue!'
      })
      return
    }
    const signer = await getSigner()
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
    [address, createFaucet],
  )

  const requestERC = useCallback(async (addr: string, unit: string) => {
    if (typeof window === 'undefined') return
    if (!address) {
      toast.error('Error', {
        description: 'Please connect wallet to continue!'
      })
      return
    }
    
    const signer = await getSigner()
    const faucetContract = new ethers.Contract('0x77ca3ba3954a72fab9836959591b2e54bf3dbba6', FaucetAbi.abi, signer);
    try {
      const tx = await faucetContract.requestERC(addr, '100000000');
      createFaucet({
        address: addr,
        amount: '100000000',
        unit: unit,
        txHash: tx.hash
      })
      await tx.wait();
      toast.success('Success', {
        description: `✅ Request successful!`,
      })
      return tx;
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: 'Request failed!'
      })
    }
  },
    [address, createFaucet],
  )

  return {
    requestETH,
    requestERC
  }
}