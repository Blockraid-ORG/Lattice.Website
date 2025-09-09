import { Icon } from '@/components/icon'
import { NumberComma, toUrlAsset } from '@/lib/utils'
import { TProject } from '@/types/project'
import Image from 'next/image'
import Link from 'next/link'

export default function PresaleHeader({ data }: { data: TProject }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 items-center bg-white border dark:bg-primary-foreground/50 p-4 rounded-lg">
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <div className="h-32 w-32 rounded-xl overflow-hidden">
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
          <div className="flex">
            <div className="w-32 md:w-1/3">Social</div>
            <div className="w-3">:</div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                {data.socials.map((social, index) => (
                  <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                    <Icon name={social.social.icon} />
                  </Link>
                ))}
              </div>
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
          <div className="flex">
            <div className="w-32 md:w-1/3">Contract Airdrop</div>
            <div className='w-3 shrink-0'>:</div>
            <div className="flex-1 text-sm break-all">
              <a className="text-xs font-semibold underline text-blue-500 block break-all" href={`${data.chains[0].chain.urlScanner}/address/${data.rewardContractAddress}`} target="_blank" rel="noopener noreferrer">
                {data.rewardContractAddress}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-32 md:w-1/3">Hard Cap</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            {NumberComma(Number(data.presales.hardcap))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-32 md:w-1/3">Duration</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            {NumberComma(Number(data.presales.duration))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-32 md:w-1/3">Max Contribution</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            {NumberComma(Number(data.presales.maxContribution))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-32 md:w-1/3">Price</div>
          <div className='w-3 shrink-0'>:</div>
          <div className="flex-1 text-sm break-all">
            {NumberComma(Number(data.presales.price))} {data.presales.unit}
          </div>
        </div>
      </div>
    </div>
  )
}
