import PageContainer from '@/components/containers/page-container'
import Table from './table'

export default function MyProjectPage() {
  return (
    <PageContainer title='Project' subtitle='My Project List'>
      <Table />
    </PageContainer>
  )
}
