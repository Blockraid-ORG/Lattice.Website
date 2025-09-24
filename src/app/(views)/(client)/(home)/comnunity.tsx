import { Icon } from '@/components/icon'
import { dataSocials } from '@/data/utilitis'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Community() {
  
  return (
    <section className='py-12 relative'>
      <div className="container">
        <div className='text-center max-w-xl mx-auto mb-12'>
          <h2 className='text-2xl md:text-4xl font-bold max-w-xl'>Join Community</h2>
          <p className='text-sm md:text-base'>
            3M+ native crypto users who believe in RWAs
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {
            dataSocials.map((item, index) => (
              <CommunityItem key={index} icon={item.icon} url={item.url} title={item.members} subtitle={item.labelMember} />
            ))
          }
          {/* <CommunityItem icon='ri:twitter-x-fill' url='https://google.com' title='2M+' subtitle="X Followers" /> */}
          {/* <CommunityItem icon='ic:baseline-discord' url='https://google.com' title='2M+' subtitle="Discord Members" /> */}
          {/* <CommunityItem icon='lineicons:telegram' url='https://google.com' title='2M+' subtitle="Telegram Subsribers" /> */}
          {/* <CommunityItem icon='mingcute:tiktok-fill' url='https://google.com' title='2M+' subtitle="Tiktok Followers" /> */}
        </div>
      </div>
    </section>
  )
}

const CommunityItem = (props: { icon: string, url: string, title: string, subtitle:string}) => {
  return (
    <Link href={props.url} className={cn(
      'rounded-xl block relative overflow-hidden shrink-0',
      'group',
      'border',
      'text-center bg-gradient-to-tr dark:text-blue-600 from-blue-100/10 dark:to-blue-800/20 to-blue-200/20 border border-blue-500/10 backdrop-blur p-6'
    )}>
      <div className="relative z-0 flex items-center justify-center left-0 top-0 bottom-0 right-0 aspect-square">
        <Icon className='text-[100px] md:text-[180px] group-hover:scale-125 duration-300 text-blue-100 dark:text-blue-700/50' name={props.icon} />
      </div>
      <div className='absolute top-0 left-0 bottom-0 right-0 z-10 flex items-center justify-center bg-gradient-to-b from-blue-200/30 dark:from-primary-foreground to-transparent'>
        <div className='text-center'>
          <h2 className='text-lg md:text-5xl font-bold'>{props.title}</h2>
          <p className='text-xs md:text-sm lg:text-base'>{props.subtitle}</p>
        </div>
      </div>
    </Link>
  )
}
