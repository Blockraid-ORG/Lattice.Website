import PageContainer from '@/components/containers/page-container'
import React from 'react'
import PaymentContent from './content'
import { HowToPay } from './how-to-pay'

export default function ProjectPayPage() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <PaymentContent />
        <HowToPay />
      </div>
    </PageContainer>
  )
}
