import PageContainer from '@/components/containers/page-container'
import ContectAddressReward from './content'

export default function WhitelistPage() {
  return (
    <PageContainer
      title='Additional Reward'
      subtitle='List of addresses eligible for rewards'
    >
      <ContectAddressReward />
    </PageContainer>
  )
}
