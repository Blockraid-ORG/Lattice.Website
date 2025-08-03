import PageContainer from '@/components/containers/page-container'
import FormWhitelist from './form-whitelist'

export default function WhitelistPage() {
  return (
    <PageContainer
      title='Whitelist'
      subtitle='Project Presale Address Whitelist'
    >
      <FormWhitelist />
    </PageContainer>
  )
}
