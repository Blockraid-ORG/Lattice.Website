import PageContainer from '@/components/containers/page-container'
import ContentWhitelist from './content'

export default function WhitelistPage() {
  return (
    <PageContainer
      title='Whitelist'
      subtitle='Project Presale Address Whitelist'
    >
      <ContentWhitelist />
    </PageContainer>
  )
}
