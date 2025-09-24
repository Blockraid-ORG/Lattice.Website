import { toUrlAsset } from '@/lib/utils'
import { TProject } from '@/types/project'
import Image from 'next/image'

export default function RewardHeader({ data }: { data: TProject }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 items-center bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <div className="h-24 w-24 rounded-xl overflow-hidden">
          <Image className="w-full h-full object-contain" width={100} height={100} src={toUrlAsset(data.logo)} alt={data?.logo} />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex">
            <div className="w-32 md:w-1/3">Name</div>
            <div className='w-3 shrink-0'>:</div>
            <div className="flex-1">{data.name}</div>
          </div>
          <div className="flex">
            <div className="w-32 md:w-1/3">Ticker</div>
            <div className='w-3 shrink-0'>:</div>
            <div className="flex-1">{data.ticker}</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex">
          <div className="w-32 md:w-1/3">Contract Airdrop</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            <a className="text-xs font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${data.rewardContractAddress}`} target="_blank" rel="noopener noreferrer">
              {data.rewardContractAddress}
            </a>
          </div>
        </div>
        <div className="flex">
          <div className="w-32 md:w-1/3">Contract</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            <a className="text-xs font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${data.contractAddress}`} target="_blank" rel="noopener noreferrer">
              {data.contractAddress}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
