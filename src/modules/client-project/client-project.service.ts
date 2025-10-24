import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TPagination } from "@/types/pagination"
import { TFormProject, TMyVetsing, TProject } from "@/types/project"
import { TQueryParam } from "@/types/query"

class ClientProjectService extends BaseService<TProject, TFormProject> {
  protected endpoint = 'client/project'

  async GetMyVesting(params?: TQueryParam): Promise<TPagination<TMyVetsing>> {
    const response = await axiosInstance({
      method: 'GET',
      url: this.endpoint + '/my-vesting',
      params
    })
    return response.data.data
  }
}

const clientProjectService = new ClientProjectService()
export default clientProjectService
