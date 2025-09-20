import { BrowserProvider, ethers } from "ethers"
import { useAccount, useWalletClient } from "wagmi"
import PresaleAbi from '@/lib/abis/presale.abi.json';
import { useCallback } from "react";
import { TPresale, TProject } from "@/types/project";
import { toast } from "sonner";
import { useUpdateNewPresale } from "./presale.query";
type TActivatePresale = { data: TProject, item: TPresale }
export function useDeployPresaleSC() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { mutate: updatePresale } = useUpdateNewPresale()

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
      const originalDate = new Date(item.startDate);
      const newDate = new Date(originalDate);
      newDate.setDate(newDate.getDate()); // + Number(project.presales.duration)
      const startTime = Math.floor(newDate.getTime() / 1000);

      await presale.activatePresale(
        data.contractAddress,
        data.whitelistsAddress,
        ethers.parseEther(item.hardcap),
        ethers.parseEther(item.price),
        ethers.parseEther(item.maxContribution),
        startTime,
        Number(item.duration) * second,
        Number(item.whitelistDuration) * 60 * 60,
        Number(item.claimTime) * second,
        Number(item.sweepDuration) * second
      );
      const presaleId = (await presale.presaleCount()).toString();
      updatePresale({
        id: item.id,
        data: {
          presaleSCID: Number(presaleId)
        }
      }, {
        onSuccess: () => {
          toast.success('Success', {
            description:`Success activate presale ID: ${presaleId}` 
          })
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  },
    [address, updatePresale, walletClient],
  )
  return {
    activatePresale
  }
}