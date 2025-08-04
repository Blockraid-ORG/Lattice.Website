import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormUpdateWhitelist } from "@/types/deploy"
import { TPresale } from "@/types/project"

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
}

const presaleService = new PresaleService()
export default presaleService
