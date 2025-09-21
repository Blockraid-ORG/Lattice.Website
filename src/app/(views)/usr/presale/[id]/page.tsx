import PageContainer from '@/components/containers/page-container'
import React from 'react'
import PresaleDetailContent from './content'

export default function PresaleDetail() {
  return (
    <PageContainer
      canBack
      title='Presale'
      subtitle='Contribute Presale'
    >
      <PresaleDetailContent />
    </PageContainer>
  )
}
