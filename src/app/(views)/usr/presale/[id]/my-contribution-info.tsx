import { Button } from "@/components/ui/button"
import { useDeployPresaleSC } from "@/modules/presales/presale.deploy"
import { TPresaleSC } from "@/types/presale"
import { TPresale, TProject } from '@/types/project'
import { useState } from "react"
import { toast } from "sonner"

type MyContributionInfoProps = {
  data: TProject,
  presale: TPresale,
  presaleSc?: TPresaleSC | null,
  contributionInfo: { claimable: string; contribution: string } | null
}
export default function MyContributionInfo({
  data,
  presale,
  presaleSc,
  contributionInfo
}: MyContributionInfoProps) {
  const { claimPresale } = useDeployPresaleSC()
  const [isClaiming, setIsClaiming] = useState(false)
  async function onClaimPresale() {
    setIsClaiming(true)
    claimPresale({
      data,
      item: presale
    }).finally(() => setIsClaiming(false))
  }

  function onRefund() {
    toast.info('Under Develop')
  }
  const endTime = presaleSc?.endTime ? presaleSc.endTime * 1000 : null;
  const now = Date.now();
  const isClaimAvailable = presaleSc?.hardCap === presaleSc?.totalRaised
  const isRefundAvailable =
    !!presaleSc &&
    !presaleSc.finalized &&
    endTime !== null &&
    endTime <= now;
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
            <p className='text-sm text-neutral-500'>Reward</p>
            <div className='flex gap-2 items-center'>
              <h2 className='font-bold'>{contributionInfo?.claimable}</h2>
              <p className='text-xs font-medium'>{data.ticker}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {
            isClaimAvailable && (
              <Button
                disabled={isClaiming} onClick={onClaimPresale}
                size={'lg'}
              >Claim Token</Button>
            )
          }
          {
            isRefundAvailable && (
              <Button
                disabled={isClaiming} onClick={onRefund}
                size={'lg'}
              >Refund</Button>
            )
          }
          
        </div>
      </div>
    </div>
  )
}
