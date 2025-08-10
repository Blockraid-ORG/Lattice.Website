import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function MainLogo() {
  return (
    <Link href={'/'} className='flex items-center gap-2'>
      <div className='h-10 aspect-square'>
        <Image
          className='w-full h-full object-cover dark:hidden'
          src='/logo/logo-dark.png'
          alt='logo'
          width={120} height={120}
        />
        <Image
          className='w-full h-full object-cover hidden dark:block'
          src='/logo/logo-light.png'
          alt='logo'
          width={120} height={120}
        />
      </div>
      <div>
        <p className='text-xl leading-none font-semibold'>Terravest</p>
      </div>
    </Link>
  )
}
