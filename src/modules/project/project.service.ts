import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TPagination } from "@/types/pagination"
import { TFormProject, TProject } from "@/types/project"
import { TQueryParam } from "@/types/query"

class ProjectService extends BaseService<TProject, TFormProject> {
  protected endpoint = 'projects'
  async GET_PUBLIC(params?: TQueryParam): Promise<TPagination<TProject>> {
    const response = await axiosInstance({
      method: 'GET',
      url: this.endpoint + '/upcoming',
      params
    })
    return response.data.data
  }
  async UPDATE_ALLOCATION(data: { id: string, contractAddress: string }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/update-allocation',
      data,
    })
    return response.data.data
  }
  async SET_ALLOCATION_DEPLOY(data: { id: string }[]) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-allocation-deploy',
      data,
    })
    return response.data.data
  }
  async SET_CONTRACT_WHITELIST(data: {
    id: string,
    whitelistContract: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-contract-whitelist',
      data,
    })
    return response.data.data
  }
  async SET_CONTRACT_PRESALE(data: {
    id: string,
    whitelistContract: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-contract-presale',
      data,
    })
    return response.data.data
  }
  async SET_DISTRIBUTED_LOCKER(data: {
    id: string,
    lockerDistributeHash: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-distributed-locker',
      data,
    })
    return response.data.data
  }
  async SET_REWARD_CONTRACT_ADDRESS(data: {
    id: string,
    rewardContractAddress: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-reward-contract-address',
      data,
    })
    return response.data.data
  }
  async SET_REWARD_SCHEDULE_ID(data: {
    id: string,
    scheduleId: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint + '/set-reward-schedule-id',
      data,
    })
    return response.data.data
  }
}

const projectService = new ProjectService()
export default projectService
