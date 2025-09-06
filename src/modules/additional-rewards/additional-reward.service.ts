import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormAdditionalReward } from "@/types/additional-reward"
import { TAdditionalReward, TEligibleAirdrop } from "@/types/project"
import { TQueryParam } from "@/types/query"

class AdditionalRewardService extends BaseService<TAdditionalReward, TFormAdditionalReward> {
  protected endpoint = 'additional-asset-rewards'
  async SET_ALLOCATIONS(data:any) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}/setAllocations`,
      data: data
    })
    return response.data.data
  }
  async REMOVE_ALLOCATIONS(data: any) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}/removeAllocations`,
      data: data
    })
    return response.data.data
  }
  async SET_CONTRACT_ADDRESS(data: {
    id: string,
    contractAddress: string
  }) {
    const response = await axiosInstance({
      method: 'PATCH',
      url: `${this.endpoint}/${data.id}`,
      data: {
        contactAddress: data.contractAddress
      }
    })
    return response.data.data
  }
  async GET_ELIGIBLE_AIRDROP(query: TQueryParam): Promise<TEligibleAirdrop[]> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/get-eligible-airdrop`,
      params: query
    })
    return response.data.data
  }
  async SET_AIRDROP_CLAIMED(id: string, data: { isClaimed: boolean }) {
    const response = await axiosInstance({
      method: 'PATCH',
      url: `${this.endpoint}/${id}`,
      data: data
    })
    return response.data.data
  }
}

const additionalRewardService = new AdditionalRewardService()
export default additionalRewardService
