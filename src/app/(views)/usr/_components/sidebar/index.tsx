'use client'
import MainLogo from '@/components/logo'
import React from 'react'
import Sidemenu from './sidemenu'
import { cn } from '@/lib/utils'
import { useSidemenu } from '@/store/useSidemenu'
import { GlowingEffect } from '@/components/ui/glowing-effect'

export default function Sidebar() {
  const { open } = useSidemenu()
  return (
    <div className={cn(
      'flex flex-col rounded-r-3xl transition',
      'w-[270px]',
      'fixed md:relative z-30',
      !open ? '-translate-x-full md:-translate-x-0' : '-translate-x-0',
      'bg-white dark:bg-slate-950',
      // 'bg-white dark:bg-neutral-900'
      // 'bg-gradient-to-tr from-blue-800 via-blue-500 to-blue-500',
      // 'bg-gradient-to-tr dark:from-blue-900 dark:via-blue-900 dark:to-blue-900',
      // 'bg-white md:bg-gradient-to-tr from-[#7F00FF]/5 via-[#00C292]/10 to-[#4057F7]/20',
      // 'dark:bg-neutral-900 md:bg-gradient-to-tr dark:from-[#7F00FF]/5 dark:via-[#00AEEF]/5 dark:to-[#00C292]/5',
    )}>
      <GlowingEffect
        borderWidth={1}
        variant='default'
        spread={10}
        glow={true}
        disabled={false}
        proximity={20}
        inactiveZone={0.05}
      />
      <div className='bg-card-gradient p-4 rounded-r-3xl  h-full'>
        <div className='h-16 flex items-center'>
          <MainLogo />
        </div>
        <div className="flex-1">
          <Sidemenu />
        </div>

      </div>
    </div>
  )
}
