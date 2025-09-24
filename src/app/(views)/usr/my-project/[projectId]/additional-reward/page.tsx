import PageContainer from '@/components/containers/page-container'
import ContectAddressReward from './content'

export default function WhitelistPage() {
  return (
    <PageContainer
      canBack
      title='Airdrop'
      subtitle='Create and manage your airdrop contract and distribution'
    >
      <ContectAddressReward />
    </PageContainer>
  )
}
