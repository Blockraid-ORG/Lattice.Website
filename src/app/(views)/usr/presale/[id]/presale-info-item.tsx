import TimeCountDown from '@/components/time-count-down'
import { Progress } from '@/components/ui/progress'
import PresaleAbi from '@/lib/abis/presale.abi.json'
import { NumberComma, safeDivide } from '@/lib/utils'
import { isAvailableContribute, isUnitPresaleStable } from '@/lib/validationActionSc'
import presaleService from '@/modules/presales/presale.service'
import { TContributionInfo, TPresaleSC } from '@/types/presale'
import { TPresale, TProject } from '@/types/project'
import dayjs from 'dayjs'
import { BrowserProvider, Contract, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import FormContribute from './form-contribute'
import MyContributionInfo from './my-contribution-info'
export default function PresaleInfoItem({ data, presale }: { data: TProject, presale: TPresale }) {
  const { data: walletClient } = useWalletClient()
  const [contributionInfo, setContributionInfo] = useState<TContributionInfo>(null);
  const [presaleSc, setPresaleSc] = useState<TPresaleSC | null>(null)
  const { address } = useAccount()

  const fetchPresale = useCallback(async () => {
    if (!data.whitelistsAddress || !presale.presaleSCID) return
    try {
      const provider = new BrowserProvider(walletClient as any)
      const contract = new Contract(data.presaleAddress!, PresaleAbi.abi, provider)

      const result = await contract.getPresale(Number(presale.presaleSCID))

      setPresaleSc({
        startTime: Number(result[0]),
        endTime: Number(result[1]),
        claimTime: Number(result[2]),
        claimDelay: Number(result[3]),
        finalized: result[4],
        hardCap: result[5].toString(),
        totalRaised: result[6].toString(),
        tokensNeeded: result[7].toString(),
        initialReleaseBps: result[8].toString(),
        cliffDuration: Number(result[9]),
        vestingDuration: Number(result[10]),
        sweepDuration: Number(result[11]),
      })
    } catch (err) {
      console.error("Gagal fetch presale SC", err)
    }
  }, [data.presaleAddress, data.whitelistsAddress, presale.presaleSCID, setPresaleSc, walletClient])

  const getPresaleData = useCallback(async () => {
    const provider = new BrowserProvider(walletClient as any)
    const contract = new Contract(data.presaleAddress!, PresaleAbi.abi, provider)
    const [claimable, contribution, claimedToken, isRefunded] = await Promise.all([
      contract.getClaimableTokens(presale.presaleSCID!, address),
      contract.getContribution(presale.presaleSCID!, address),
      contract.getClaimedTokens(presale.presaleSCID!, address),
      contract.hasUserBeenRefunded(presale.presaleSCID!, address),
    ]);
    const isUseStableCoin = isUnitPresaleStable(presale.unit)
    if (isUseStableCoin) {
      const stableCoinData = await presaleService.GetStableUsed({
        chainId: data.chains[0].chain.id,
        name: presale.unit
      })
      return {
        claimable: ethers.formatUnits(claimable, data.decimals),
        contribution: ethers.formatUnits(contribution, stableCoinData.decimal),
        claimedToken: ethers.formatUnits(claimedToken, data.decimals),
        isRefunded
      };
    } else {
      return {
        claimable: ethers.formatUnits(claimable, data.decimals),
        contribution: ethers.formatUnits(contribution, data.decimals),
        claimedToken: ethers.formatUnits(claimedToken, data.decimals),
        isRefunded
      };

    }
  }, [address, data, , presale, walletClient])


  useEffect(() => {
    if (!address || !walletClient) return;
    fetchPresale()
    getPresaleData().then(setContributionInfo)
  }, [address, fetchPresale, getPresaleData, setContributionInfo, walletClient])
  const progress = presaleSc
    ? safeDivide(Number(presaleSc?.totalRaised) , Number(presaleSc?.hardCap)) * 100
    : 0

  const isCanContribute = isAvailableContribute(presaleSc)

  return (
    <div className='bg-white shadow shadow-neutral-100/5 border p-6 pb-0 dark:bg-neutral-950 rounded-xl my-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-full'>
        <div>
          <p className='text-sm text-neutral-500'>Price</p>
          <div className='flex gap-2 items-center'>
            <h2 className='font-bold'>{NumberComma(Number(presale.price))}</h2>
            <p className='text-xs font-medium'>{presale.unit.split('/').pop()}/{data.ticker}</p>
          </div>
        </div>
        <div>
          <p className='text-sm text-neutral-500'>Hardcap</p>
          <h2 className='font-bold'>{NumberComma(Number(presale.hardcap))} {presale.unit}</h2>
        </div>
        <div>
          <p className='text-sm text-neutral-500'>Max Contribution</p>
          <h2 className='font-bold'>{NumberComma(Number(presale.maxContribution))} {presale.unit}</h2>
        </div>
        <div>
          <p className='text-sm text-neutral-500'>Start Date</p>
          <h2 className='font-bold'>{dayjs(presale.startDate).format('YYYY-MM-DD HH:mm')}</h2>
          {
            !presaleSc?.finalized && <TimeCountDown date={presale.startDate} />
          }
        </div>
        <div>
          <p className='text-sm text-neutral-500'>End Date</p>
          <h2 className='font-bold'>{dayjs(presale.endDate).format('YYYY-MM-DD HH:mm')}</h2>
          {
            !presaleSc?.finalized && <TimeCountDown date={presale.endDate} />
          }
        </div>
      </div>

      {
        isCanContribute && contributionInfo && (
          <div className='flex gap-2 justify-end pt-4 border-t mt-4'>
            <FormContribute
              data={data}
              presale={presale}
              currentContibution={Number(contributionInfo.contribution)}
              onSuccess={async () => {
                await fetchPresale();
                const res = await getPresaleData();
                setContributionInfo(res);
              }}
            />
          </div>
        )
      }
      {
        presaleSc?.totalRaised && (
          <div className="my-4">
            <Progress className='h-3' value={progress} />
            <div className="flex justify-center text-sm font-semibold">
              {progress.toFixed(2)}%
            </div>
          </div>
        )
      }
      <MyContributionInfo
        contributionInfo={contributionInfo}
        data={data}
        presale={presale}
        presaleSc={presaleSc}
        onSuccess={async () => {
          await fetchPresale();
          const res = await getPresaleData();
          setContributionInfo(res);
        }}
      />
    </div>
  )
}
