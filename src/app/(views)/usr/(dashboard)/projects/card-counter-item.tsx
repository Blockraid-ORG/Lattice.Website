import { GlowingEffect } from '@/components/ui/glowing-effect'
import React from 'react'

type CardCounterItemProps = {
  label: string
  count: string | number
  unit: string
}
export default function CardCounterItem(props: CardCounterItemProps) {
  return (
    //  bg-white dark:bg-white/5
    <div className='bg-card-gradient relative p-3 md:p-4 rounded-2xl'>
      <GlowingEffect
        borderWidth={1.5}
        variant='default'
        spread={90}
        glow={true}
        disabled={false}
        proximity={60}
        inactiveZone={0.05}
      />
      <h2 className='text-sm'>{props.label}</h2>
      <div className='flex items-center gap-2 mt-3'>
        <h3 className='text-2xl font-bold'>{props.count}</h3>
        <p className='text-xs'>{props.unit}</p>
      </div>
    </div>
  )
}
