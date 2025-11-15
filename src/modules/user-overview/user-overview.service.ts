import axiosInstance from "@/lib/axios"
import { TCategory } from "@/types/category"
import { TProjectType } from "@/types/project-type"

type TCountAsset = {
  total: number
  items: {
    projectType: string
    icon: string
    projectCount: number
  }[]
}
type TListAsset = {
  id: string
  name: string
  ticker: string
  decimals: number
  totalSupply: string
  contractAddress: string
  logo: string
  banner: string
  category: TCategory,
  projectType: TProjectType
  presales: TPresaleOv[]
}
export type TPresaleOv = {
  id: string
  unit: string
  presaleSCID: number
  trasactions: {
    id: string
    price: string
    count: string
  }[]
  totalCount: 10
}
class UserOverviewService {
  async GetCountAsset(): Promise<TCountAsset> {
    const response = await axiosInstance({
      method: 'GET',
      url: `stats/count-asset`,
    })
    return response.data.data
  }
  async GetListAsset(): Promise<TListAsset[]> {
    const response = await axiosInstance({
      method: 'GET',
      url: `stats/list-asset`,
    })
    return response.data.data
  }
}

const userOverviewService = new UserOverviewService()
export default userOverviewService
