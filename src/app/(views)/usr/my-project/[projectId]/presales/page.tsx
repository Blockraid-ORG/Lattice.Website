import PageContainer from '@/components/containers/page-container'
import React from 'react'
import PresaleContent from './content'

export default function PresalePage() {
  return (
    <PageContainer
      canBack
      title='Presale'
      subtitle='Manage Presale'
    >
      <PresaleContent />
    </PageContainer>
  )
}
