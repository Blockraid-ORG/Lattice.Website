import TimeCountDown from "@/components/time-count-down"
import { Button } from "@/components/ui/button"
import {
  checkIsClaimPresaleAvail,
  checkIsRefundPresaleAvail,
  getTimeClaim
} from "@/lib/validationActionSc"
import { useDeployPresaleSC } from "@/modules/presales/presale.deploy"
import { TContributionInfo, TPresaleSC } from "@/types/presale"
import { TPresale, TProject } from '@/types/project'
import { useState } from "react"
import dayjs from "@/lib/dayjs"
type MyContributionInfoProps = {
  data: TProject,
  presale: TPresale,
  presaleSc?: TPresaleSC | null,
  contributionInfo: TContributionInfo,
  onSuccess?: () => void,
}
export default function MyContributionInfo({
  data,
  presale,
  presaleSc,
  contributionInfo,
  onSuccess
}: MyContributionInfoProps) {
  const { claimPresale, withdrawContributionIfFailed } = useDeployPresaleSC()
  const [isClaiming, setIsClaiming] = useState(false)
  async function onClaimPresale() {
    setIsClaiming(true)
    claimPresale({
      data,
      item: presale
    }).then(() => {
      onSuccess?.();
    }).finally(() => setIsClaiming(false))
  }

  function onRefund() {
    setIsClaiming(true)
    withdrawContributionIfFailed({
      data,
      item: presale
    }).then(() => {
      onSuccess?.();
    }).finally(() => setIsClaiming(false))
  }

  const isClaimAvailable = checkIsClaimPresaleAvail(presaleSc)
  const isRefundAvailable = checkIsRefundPresaleAvail(presaleSc)
  const isClaimedToken = Number(contributionInfo?.claimable) === 0
  return (
    <div>
      <div className="py-4">
        <h2 className='text-lg md:text-xl mb-3 font-semibold'>Contribution Info</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 w-full'>
          <div>
            <p className='text-sm text-neutral-500'>Total Contribution</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{contributionInfo?.contribution}</h2>
              <p className='text-xs font-medium'>{data.presales[0].unit.split('/').pop()}</p>
            </div>
          </div>
          <div>
            <p className='text-sm text-neutral-500'>Allocation</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{contributionInfo?.claimable}</h2>
              <p className='text-xs font-medium'>{data.ticker}</p>
            </div>
          </div>
          <div>
            <p className='text-sm text-neutral-500'>Claimed Token</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{contributionInfo?.claimedToken}</h2>
              <p className='text-xs font-medium'>{data.ticker}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {
            isClaimAvailable ? (
              <Button
                disabled={isClaiming || !isClaimAvailable || isClaimedToken}
                onClick={onClaimPresale}
                size={'lg'}
              >
                {
                  isClaiming || !isClaimAvailable || isClaimedToken ? 'Claimed' :'Claim Token'
                }
                
              </Button>
            ) : (
              <div>
                {
                  getTimeClaim(presaleSc) && (
                    <div>
                      {!isClaimAvailable && !isRefundAvailable && (
                        <div className="text-sm mb-1">Claim Available {dayjs(getTimeClaim(presaleSc)).fromNow()}</div>
                      )}
                      <TimeCountDown date={dayjs(getTimeClaim(presaleSc)).toISOString()} />
                    </div>
                  )
                }
              </div>
            )
          }
          {
            isRefundAvailable && (
              <Button
                disabled={isClaiming || contributionInfo?.isRefunded} onClick={onRefund}
                size={'lg'}
              >
                {
                  contributionInfo?.isRefunded ? 'Refunded' : 'Refund'
                }
              </Button>
            )
          }
        </div>
      </div>
    </div>
  )
}
