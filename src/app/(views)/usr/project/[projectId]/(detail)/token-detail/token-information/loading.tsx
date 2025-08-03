import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function LoadingTokenInformation() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-56 w-full' />
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
      <div className='flex gap-2'>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
        <div className='flex-1'><Skeleton className='h-8 w-full' /></div>
      </div>
    </div>
  )
}
