import { cn } from '@/lib/utils'
import { TProjectStatus } from '@/types/status'
import React from 'react'
type BadgeProjectStatusProp = {
  status: TProjectStatus,
}

export default function BadgeProjectStatus(props: BadgeProjectStatusProp) {
  return (
    <div className={cn(
      'max-w-max px-2 py-0.5 text-xs font-semibold rounded',
      props.status === 'PENDING' && 'bg-yellow-500/20 text-yellow-500',
      props.status === 'REJECTED' && 'bg-red-500/20 text-red-500',
      props.status === 'APPROVED' && 'bg-green-500/20 text-green-500',
      props.status === 'DEPLOYED' && 'bg-blue-500/20 text-blue-500',
    )}>{props.status}</div>
  )
}
