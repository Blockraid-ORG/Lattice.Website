import { cn } from '@/lib/utils'
import React from 'react'

type RowItemProps = {
  label: string
  value: string | React.ReactNode
  labelWidth?: string
}
export default function RowItem(props: RowItemProps) {
  return (
    <div className="flex py-2 border-t">
      <div className={cn(
        'shrink-0',
        props.labelWidth ? props.labelWidth : "w-32"
      )}>{props.label}</div>
      <div className='w-3 shrink-0'>:</div>
      <div className="flex-1 break-all">{props.value}</div>
    </div>
  )
}
