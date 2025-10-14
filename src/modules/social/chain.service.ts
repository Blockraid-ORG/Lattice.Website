import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormSocial, TSocial } from "@/types/social"

class SocialService extends BaseService<TSocial, TFormSocial> {
  protected endpoint = 'socials'
  async GetByName(name: string): Promise<TSocial> {
    const response = await axiosInstance({
      method: 'GET',
      url: `${this.endpoint}/default/${name}`,
    })
    return response.data.data
  }
}

const socialService = new SocialService()
export default socialService
