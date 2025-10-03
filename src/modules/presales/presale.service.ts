import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormUpdateWhitelist } from "@/types/deploy"
import { TPagination } from "@/types/pagination"
import {
  FormProjectAddressWhitelist,
  TFormProjectPresale,
  TPresale,
  TProject,
  TFormContributePresale
} from "@/types/project"
import { TQueryParam } from "@/types/query"

class PresaleService extends BaseService<TPresale, TFormUpdateWhitelist> {
  protected endpoint = 'presale'
  async UPDATE_PRESALE_WHITELIST(data: {
    presaleId: string,
    walletAddress: string[]
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}/whitelist`,
      data,
    })
    return response.data.data
  }
  async GET_PRESALE(params?: TQueryParam): Promise<TPagination<TProject>> {
    const response = await axiosInstance({
      method: 'GET',
      url: this.endpoint,
      params
    })
    return response.data.data
  }
  async CREATE_NEW_PRESALE(data: TFormProjectPresale) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}s/create-new-presale`,
      data
    })
    return response.data.data
  }
  async DELETE_NEW_PRESALE(id: string) {
    const response = await axiosInstance({
      method: 'DELETE',
      url: `${this.endpoint}s/${id}`,
    })
    return response.data.data
  }
  async UPDATE_NEW_PRESALE(id: string, data: TFormProjectPresale) {
    const response = await axiosInstance({
      method: 'PATCH',
      url: `${this.endpoint}s/${id}`,
      data
    })
    return response.data.data
  }
  async ADD_PROJECT_WHITELIST_ADDRESS(data: FormProjectAddressWhitelist[]) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}s/add-project-presale-whitelist-address`,
      data,
    })
    return response.data.data
  }
  async REMOVE_PROJECT_WHITELIST_ADDRESS(data: string[]) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}s/remove-project-presale-whitelist-address`,
      data,
    })
    return response.data.data
  }
  // Extra For Client
  async GetPresaleActive(params?: TQueryParam): Promise<TPagination<TProject>> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/active`,
      params
    })
    return response.data.data
  }
  async GetPresaleById(id:string): Promise<TProject> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/${id}`,
    })
    return response.data.data
  }
  async CreateContributePresale(data: TFormContributePresale) {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}/create-contribute-presale`,
      data
    })
    return response.data.data
  }
  async GetMyContribution(params?: TQueryParam) {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/my-contribution`,
      params,
    })
    return response.data.data
  }
  async GetStableUsed(params: { chainId: string, name: string }) {
    const response = await axiosInstance({
      method: 'GET',
      url: `stable-coin/used`,
      params,
    })
    return response.data.data
  }
}

const presaleService = new PresaleService()
export default presaleService
