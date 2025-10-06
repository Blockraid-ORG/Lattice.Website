'use client'
import PaymentAbi from '@/lib/abis/payment.abi.json';
import TokenAbi from '@/lib/abis/erc20.abi.json';
import { useCallback } from 'react';
import { TProject } from '@/types/project';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { TMasterPayment } from '@/types/payment';
import { toast } from 'sonner';
import { useCreatePaymentFeeProject } from '../project/project.query';
export function usePaymentSC() {
  const { mutate: createPaymentFeeProject } = useCreatePaymentFeeProject()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const payListingFee = useCallback(async (project: TProject, addressPool?: TMasterPayment) => {
    if (!addressPool) {
      toast.warning('Warning', {
        description: 'Payment method is disabled'
      })
      return
    }
    const paymentContract = addressPool.paymentSc;
    const usdcContract = addressPool.stableCoin.address;
    const amount = ethers.parseUnits(addressPool.listingFee, addressPool.decimal)
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')

    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    try {
      const stableContract = new Contract(
        usdcContract,
        TokenAbi.abi,
        signer
      )
      const contract = new Contract(
        paymentContract,
        PaymentAbi.abi,
        signer
      )

      const approveTx = await stableContract.approve(paymentContract, amount);
      await approveTx.wait();

      const payer = await signer.getAddress();
      const memo = `PAYFOR_FOR_${project.ticker}`;

      const payTx = await contract.pay(payer, amount, memo);
      await payTx.wait();
      createPaymentFeeProject({
        projectId: project.id,
        type: "PROJECT_LISTING_FEE",
        address: addressPool.stableCoin.address,
        amount: amount.toString(),
        unit: addressPool.stableCoin.stableCoin.name,
        transactionHash: payTx.hash
      }, {
        onSuccess: () => {
          toast.success('Success', {
            description: 'Payment Success, please wait terravest admin review to deploy!'
          })
        }
      })
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description:`Payment failed!`
      })
    }
  }, [address, createPaymentFeeProject, walletClient])

  return {
    payListingFee
  }
}