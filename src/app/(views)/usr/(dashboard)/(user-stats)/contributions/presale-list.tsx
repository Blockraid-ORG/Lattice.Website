'use client'
import { Icon } from '@/components/icon'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { useListAsset } from '@/modules/user-overview/user-overview.query'
import Image from 'next/image'
import { PresalePopover } from './presale-popover'
import { PresaleSkeleton } from './presale-sekeleton'

export default function PresaleList() {
  const { data, isLoading } = useListAsset()

  console.log({
    data,
    isLoading
  })
  return (
    <div className="mt-6 bg-chart-gradient p-3 md:p-4 rounded-2xl">
      <div className="mb-2"><h2>Your Presale Participation</h2></div>
      {
        !isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {
              data?.map((item) => (
                <div key={item.id} className='bg-white border relative p-3 md:p-4 rounded-2xl'>
                  <GlowingEffect
                    borderWidth={1}
                    variant='default'
                    spread={90}
                    glow={true}
                    disabled={false}
                    proximity={60}
                    inactiveZone={0.05}
                  />
                  <div className="flex gap-2 relative">
                    <div className="w-12 aspect-square relative shrink-0">
                      <Image
                        className="w-full h-full object-cover"
                        fill
                        src={item.logo}
                        alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div>{item.ticker}</div>
                        <h3>{item.name}</h3>
                        <div className="bg-black/90  text-white text-[10px] px-2 py-0.5 rounded-full z-20">{item.projectType.name}</div>
                      </div>
                      <div className="flex gap-1 text-sm items-center">
                        <Icon className="text-base" name={item.category.icon} />
                        <h3>{item.category.name}</h3>
                      </div>
                    </div>
                    <PresalePopover data={item.presales} />
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <PresaleSkeleton />
              <PresaleSkeleton />
              <PresaleSkeleton />
          </div>
        )
      }

    </div>
  )
}
