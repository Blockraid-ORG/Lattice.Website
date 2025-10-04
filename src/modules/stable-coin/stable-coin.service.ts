import axiosInstance from "@/lib/axios";
import { BaseService } from "@/services/base.service";
import { TStableCoinGroup } from "@/types/stable-coin";

class StableCoinService extends BaseService<TStableCoinGroup> {
  protected endpoint = 'stable-coin'
  async LIST_GROUP(): Promise<TStableCoinGroup[]> {
    const response = await axiosInstance({
      method: "GET",
      url: `${this.endpoint}-group`,
      params: {
        noPaginate: 1,
      },
    });
    return response.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  }
}

const stableCoinService = new StableCoinService()
export default stableCoinService
