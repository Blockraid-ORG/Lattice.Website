import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormUpdateWhitelist } from "@/types/deploy"
import { TPagination } from "@/types/pagination"
import { TPresale, TProject } from "@/types/project"
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
}

const presaleService = new PresaleService()
export default presaleService
