import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TQueryParam } from "@/types/query"
import { TUserVerified } from "@/types/user"

class UserVerifiedService extends BaseService<TUserVerified> {
  protected endpoint = 'usr-client'
  async GET_VERIFIED_USER(params: TQueryParam): Promise<TUserVerified[]> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/verified-user`,
      params
    })
    return response.data.data.filter((item: TUserVerified)=>item.walletAddress !== null)
  }
}

const userVerifiedService = new UserVerifiedService()
export default userVerifiedService
