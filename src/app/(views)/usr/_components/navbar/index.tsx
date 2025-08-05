'use client'
import { ModeToggle } from '@/components/mode-toggle'
import SidemnuToggle from '@/components/sidemnu-toggle'
import WalletButton from '@/components/wallet-button'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function NavbarAdmin() {
  const pathname = usePathname()
  const mainPath = pathname.split('/')[2]
  return (
    <nav className='px-2 z-30 sticky top-0 bg-transparent backdrop-blur'>
      <div className="container h-[70px] flex items-center">
        <div className='flex-1'>
          <h1 className='text-xl text-balance font-medium capitalize'>
            {mainPath?.split('-').join(' ') || 'Dashboard'}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <ModeToggle />
          <SidemnuToggle />
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
