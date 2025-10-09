import axiosInstance from "@/lib/axios"
import { TFaucet, TFormFaucet } from "@/types/faucet"
import { TPagination } from "@/types/pagination"
import { TQueryParam } from "@/types/query"

class FaucetService {
  protected endpoint = 'faucet'
  async Create(data: TFormFaucet): Promise<TFaucet> {
    const response = await axiosInstance({
      method: 'POST',
      url: `${this.endpoint}`,
      data
    })
    return response.data.data
  }
  async Get(params?: TQueryParam): Promise<TPagination<TFaucet[]>> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}`,
      params
    })
    return response.data.data
  }
}

const faucetService = new FaucetService()
export default faucetService
