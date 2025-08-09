import React from 'react'
import ProjectContent from './content'
import PageContainer from '@/components/containers/page-container'

export default function ProjectPage() {
  return (
    <PageContainer title='Project List' subtitle='Explore RWA Project'>
      <ProjectContent />
    </PageContainer>
  )
}
