'use client'
import PaymentAbi from '@/lib/abis/payment.abi.json';
import TokenAbi from '@/lib/abis/erc20.abi.json';
import { useCallback } from 'react';
import { TProject } from '@/types/project';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { TMasterPayment } from '@/types/payment';
import { TPagination } from '@/types/pagination';
import { toast } from 'sonner';
import { useCreatePaymentFeeProject } from '../project/project.query';
export function usePaymentSC() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: createPaymentFeeProject } = useCreatePaymentFeeProject()
  const pay = useCallback(async (project: TProject, addressPool?: TPagination<TMasterPayment>) => {
    const paymentInfo = addressPool?.data && addressPool?.data[0]
    if (!paymentInfo) {
      toast.warning('Warning', {
        description: 'Payment method is disabled'
      })
      return
    }
    const paymentContract = `0x779aa5C7ff04B6Ba48464bcEA0a60134Df9E6AFf`;
    const usdcContract = paymentInfo.address;
    const amount = ethers.parseUnits(paymentInfo.amountFee, paymentInfo.decimal)

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
        addressPoolPaymentId: paymentInfo.id,
        transactionHash: payTx.hash
      }, {
        onSuccess: () => {
          toast.success('Success', {
            description:'Payment Success, please wait terravest admin review to deploy!'
          })
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  }, [address, createPaymentFeeProject, walletClient])

  return {
    pay
  }
}