import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TPagination } from "@/types/pagination"
import { TFormContribuePresale, TPresale, TResponsePresale } from "@/types/project"
import { TQueryParam } from "@/types/query"

class TansactionPresaleService extends BaseService<TPresale, TFormContribuePresale> {
  protected endpoint = 'presales'
  async GET_UPCOMING(params?: TQueryParam): Promise<TPagination<TResponsePresale>> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/upcoming`,
      params
    })
    return response.data.data
  }
  async GET_ACTIVE(params?: TQueryParam): Promise<TPagination<TResponsePresale>> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/active`,
      params
    })
    return response.data.data
  }
}

const tansactionpresaleService = new TansactionPresaleService()
export default tansactionpresaleService
