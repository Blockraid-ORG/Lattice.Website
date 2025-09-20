import PageContainer from '@/components/containers/page-container'
import React from 'react'
import ContentManageLocker from './content'

export default function ManageLockerPage() {
  return (
    <PageContainer
      canBack
      title='Locker'
      subtitle='Manage Locker'
    >
      <ContentManageLocker />
    </PageContainer>
  )
}
