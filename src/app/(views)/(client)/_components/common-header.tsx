import { Icon } from '@/components/icon'
import Image from 'next/image'
import React from 'react'

export default function CommonHeader() {
  return (
    <div className='h-[30vh] relative'>
      <div className="absolute z-10 left-0 right-0 top-0 bottom-0 container flex items-center justify-center text-center">
        <div className='flex items-center gap-2'>
          <Icon name='fa6-solid:faucet-drip' className='text-5xl' />
          <h3 className='text-3xl md:text-5xl font-bold'>Faucet</h3>
        </div>
      </div>
      <div className='absolute left-0 top-0 right-0 bottom-0 z-0'>
        <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top dark:hidden' alt='star hero' src={'/ills/bg-hero-light.png'} width={1440} height={712} />
        <Image className='h-full w-full md:object-cover opacity-20 dark:opacity-100 object-top hidden dark:block' alt='star hero' src={'/ills/bg-hero.png'} width={1440} height={712} />
      </div>
    </div>
  )
}
