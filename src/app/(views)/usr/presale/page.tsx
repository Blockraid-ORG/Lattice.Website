import PageContainer from '@/components/containers/page-container'
import PresaleContent from './content'

export default function PresalePage() {
  return (
    <PageContainer
      canBack
      title='Presale'
      subtitle='Active Presale'
    >
      <PresaleContent />
    </PageContainer>
  )
}
