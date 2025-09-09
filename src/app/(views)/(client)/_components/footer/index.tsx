import { Icon } from '@/components/icon'
import MainLogo from '@/components/logo'
import Link from 'next/link'
import React from 'react'

export default function MainFooter() {
  return (
    <footer className='py-6 md:py-12 bg-blue-100/30 dark:bg-primary-foreground/40'>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className='space-y-3'>
            <MainLogo />
            <div className="flex gap-2">
              <Link className='flex w-8 h-8 items-center justify-center border rounded-lg bg-blue-200/30 dark:bg-primary/5' href="https://google.com" target="_blank" rel="noopener noreferrer">
                <Icon name='ri:twitter-x-fill' />
              </Link>
              <Link className='flex w-8 h-8 items-center justify-center border rounded-lg bg-blue-200/30 dark:bg-primary/5' href="https://google.com" target="_blank" rel="noopener noreferrer">
                <Icon name='ic:baseline-discord' />
              </Link>
              <Link className='flex w-8 h-8 items-center justify-center border rounded-lg bg-blue-200/30 dark:bg-primary/5' href="https://google.com" target="_blank" rel="noopener noreferrer">
                <Icon name='lineicons:telegram' />
              </Link>
              <Link className='flex w-8 h-8 items-center justify-center border rounded-lg bg-blue-200/30 dark:bg-primary/5' href="https://google.com" target="_blank" rel="noopener noreferrer">
                <Icon name='mingcute:tiktok-fill' />
              </Link>
            </div>
          </div>
          <div>
            <h2 className='text-lg font-semibold'>Resources</h2>
            <div className='mt-3 space-y-2'>
              <Link className='flex text-sm' href="/">
                Documentation
              </Link>
              <Link className='flex text-sm' href="/">
                Blog
              </Link>
              <Link className='flex text-sm' href="/">
                Team
              </Link>
            </div>
          </div>
          <div>
            <h2 className='text-lg font-semibold'>Legal</h2>
            <div className='mt-3 space-y-2'>
              <Link className='flex text-sm' href="/">
                Privacy Policy
              </Link>
              <Link className='flex text-sm' href="/term-and-condition">
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
