import PageContainer from '@/components/containers/page-container'
import React from 'react'
import VestingContent from './content'

export default function VestingPage() {
  return (
    <PageContainer
      title='Vesting'
      subtitle='Your Eligible Vesting'
    >
      <VestingContent />
    </PageContainer>
  )
}
