import PresaleAbi from '@/lib/abis/presale.abi.json';
import WhitelistAbi from '@/lib/abis/whitelist.abi.json';
import TokenAbi from '@/lib/abis/erc20.abi.json';
import { FormProjectAddressWhitelist, TPresale, TProject } from "@/types/project";
import { BrowserProvider, ethers, parseUnits } from "ethers";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import {
  useAddProjectWhitelistAddress,
  useCreateContributePresale,
  useRemoveProjectWhitelistAddress,
  useUpdateNewPresale
} from "./presale.query";
import { useCreateClaimedPresale } from '../transaction-presale/transaction-presale.query';
type TActivatePresale = { data: TProject, item: TPresale }
export function useDeployPresaleSC() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updatePresale } = useUpdateNewPresale()
  const { mutate: addProjectWhitelistAddress } = useAddProjectWhitelistAddress()
  const { mutate: removeProjectWhitelistAddress } = useRemoveProjectWhitelistAddress()
  const { mutate: createContributePresale } = useCreateContributePresale()
  const { mutate: createClaimed } = useCreateClaimedPresale()

  const activatePresale = useCallback(async ({ data, item }: TActivatePresale) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    if (!data.presaleAddress) {
      toast.warning('Warning', {
        description: `Asset not deployed yet`
      })
      return
    }
    const presale = new ethers.Contract(data.presaleAddress, PresaleAbi.abi, signer);
    try {
      const second = 24 * 60 * 60;
      const startTime = Math.floor(new Date(item.startDate).getTime() / 1000);
      const endTime = Math.floor(new Date(item.endDate!).getTime() / 1000);
      const duration = endTime - startTime;
      if (duration <= 0) {
        toast.error('Error', {
          description: 'End Date must be greater than Start Date'
        })
        throw new Error("End Date must be greater than Start Date");
      }


      const contractERC20 = new ethers.Contract(data.contractAddress!, TokenAbi.abi, signer);
      const amountToApprove = Number(item.hardcap) / Number(item.price)
      const txApprove = await contractERC20.approve(data.presaleAddress, ethers.parseUnits(amountToApprove.toString(), data.decimals));
      await txApprove.wait();

      const presaleAction = await presale.activatePresale(
        data.contractAddress,
        data.whitelistsAddress,
        ethers.parseUnits(item.hardcap, data.decimals),
        ethers.parseUnits(item.price, data.decimals),
        ethers.parseUnits(item.maxContribution, data.decimals),
        startTime,
        duration,
        Number(item.whitelistDuration) * 60 * 60,
        Number(item.claimTime) * second,
        Number(item.sweepDuration) * second
      );

      await presaleAction.wait()
      const presaleId = (await presale.presaleCount()).toString();
      updatePresale({
        id: item.id,
        data: {
          presaleSCID: Number(presaleId),
          isActive: true,
        }
      }, {
        onSuccess: () => {
          toast.success('Success', {
            description: `Success activate presale ID: ${presaleId}`
          })
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  },
    [address, updatePresale, walletClient],
  )

  const addToWhitelist = useCallback(async (
    data: FormProjectAddressWhitelist[],
    whitelistAddress: string
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const contract = new ethers.Contract(whitelistAddress, WhitelistAbi.abi, signer)
    const arrayAddress = data.map(i => i.walletAddress)
    const tx = await contract.addToWhitelist(arrayAddress)
    await tx.wait()
    addProjectWhitelistAddress(data)
  },
    [addProjectWhitelistAddress, address, walletClient],
  )

  const removeFromWhitelist = useCallback(async (
    ids: string[],
    walletAddress: string[],
    whitelistAddress: string
  ) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const contract = new ethers.Contract(whitelistAddress, WhitelistAbi.abi, signer)
    const tx = await contract.removeFromWhitelist(walletAddress)
    await tx.wait()
    removeProjectWhitelistAddress(ids)
  },
    [removeProjectWhitelistAddress, address, walletClient],
  )

  const contributePresale = useCallback(async (
    { data, presale, amount }: {
      data: TProject,
      presale: TPresale,
      amount: string
    }
  ) => {
    try {
      if (typeof window === 'undefined') return
      if (!walletClient || !address) throw new Error('Wallet not connected')
      const provider = new BrowserProvider(walletClient as any)
      const signer = await provider.getSigner(address)

      const contract = new ethers.Contract(data.presaleAddress!, PresaleAbi.abi, signer)

      const tx = await contract.contribute(presale.presaleSCID, address, {
        value: parseUnits(amount.toString(), data.decimals)
      })
      await tx.wait()
      createContributePresale({
        projectId: data.id,
        presaleId: presale.id,
        price: presale.price,
        count: Number(amount),
        transactionHash: tx.hash as string
      })

    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: 'Contribution Failed: Presale is inactive!'
      })
    }
  },
    [address, createContributePresale, walletClient],
  )

  const getContribution = useCallback(async ({ data, item }: TActivatePresale) => {
    if (typeof window === 'undefined') return
    if (!walletClient || !address) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)

    try {
      const contract = new ethers.Contract(data.presaleAddress!, PresaleAbi.abi, signer)
      const tx = await contract.getContribution(item.presaleSCID, address)
      return tx
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: 'Contribution Failed: Presale is inactive!'
      })
    }
  },
    [address, walletClient],
  )

  const claimPresale = useCallback(async ({ data, item }: TActivatePresale) => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const presaleAddress = data.presaleAddress
    if (!presaleAddress || !item.presaleSCID) throw new Error("Presale address is not set")
    try {
      const presaleFactory = new ethers.Contract(presaleAddress, PresaleAbi.abi, signer)
      const userAddress = await signer.getAddress()
      const tx = await presaleFactory.claim(item.presaleSCID!, userAddress)
      await tx.wait()
      createClaimed({
        amount: '1',
        presaleId: item.id,
        transactionHash: tx.hash
      })
      toast.success("Claim successful", {
        description: `Transaction hash: ${tx.hash}`
      })
    } catch (error: any) {
      toast.error('Error', {
        description: error.shortMessage
      })
    }
  },
    [address, createClaimed, walletClient],
  )

  const sweepUnclaimedTokens = useCallback(async ({ data, item }: TActivatePresale) => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const presaleAddress = data.presaleAddress
    if (!presaleAddress || !item.presaleSCID) throw new Error("Presale address is not set")
    try {
      const presaleFactory = new ethers.Contract(presaleAddress, PresaleAbi.abi, signer)
      const userAddress = await signer.getAddress()
      const tx = await presaleFactory.sweepUnclaimedTokens(item.presaleSCID!, userAddress)
      await tx.wait()
      toast.success("Withdraw successful", {
        description: `Transaction hash: ${tx.hash}`
      })
    } catch (error: any) {
      toast.error('Error', {
        description: error.shortMessage
      })
    }
  },
    [address, walletClient],
  )
  const withdrawContributionIfFailed = useCallback(async ({ data, item }: TActivatePresale) => {
    if (!walletClient || !address) throw new Error("Wallet not connected")
    const provider = new BrowserProvider(walletClient as any)
    const signer = await provider.getSigner(address)
    const presaleAddress = data.presaleAddress
    if (!presaleAddress || !item.presaleSCID) throw new Error("Presale address is not set")
    try {
      const presaleFactory = new ethers.Contract(presaleAddress, PresaleAbi.abi, signer)
      const userAddress = await signer.getAddress()
      const tx = await presaleFactory.withdrawContributionIfFailed(item.presaleSCID!, userAddress)
      await tx.wait()
      toast.success("Refund successful", {
        description: `Transaction hash: ${tx.hash}`
      })
    } catch (error: any) {
      console.log(error)
      toast.error('Error', {
        description: error.shortMessage
      })
    }
  },
    [address, walletClient],
  )

  return {
    activatePresale,
    addToWhitelist,
    removeFromWhitelist,
    contributePresale,
    getContribution,
    claimPresale,
    sweepUnclaimedTokens,
    withdrawContributionIfFailed
  }
}