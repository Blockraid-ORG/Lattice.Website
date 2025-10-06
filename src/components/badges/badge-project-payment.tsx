import { cn } from '@/lib/utils'
import React from 'react'
type BadgeProjectPaymentProp = "PAID" | "UNPAID"

export default function BadgeProjectPayment({ status }: { status: BadgeProjectPaymentProp }) {
  return (
    <div className={cn(
      'max-w-max px-2 py-0.5 text-xs font-semibold rounded',
      status === 'UNPAID' && 'bg-red-500/20 text-red-500',
      status === 'PAID' && 'bg-green-500/20 text-green-500',
    )}>{status === "PAID" ? 'Payment Success':'Waiting Payment'}</div>
  )
}
