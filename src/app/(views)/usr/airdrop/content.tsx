'use client'
import { useEligibleAirdrop } from '@/modules/additional-rewards/additional-reward.query'
import React from 'react'
import AirdropItem from './airdrop-item'

export default function AirdropContent() {
  const { data } = useEligibleAirdrop()
  return (
    <div className='grid gap-1 md:gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {
        data?.map((item, index) => (
          <AirdropItem key={index} data={item} />
        )) 
      }
    </div>
  )
}
