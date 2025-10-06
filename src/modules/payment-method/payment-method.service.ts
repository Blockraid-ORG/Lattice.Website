import axiosInstance from "@/lib/axios"
import { TMasterPayment, TStableGroup } from "@/types/payment"

class PaymentMethod {
  async GetStableCoinGroup(): Promise<TStableGroup[]> {
    const response = await axiosInstance({
      method: 'GET',
      url: `stable-coin-group`,
      params: {
        noPaginate: 1
      },
    })
    return response.data.data
  }
  async GetAddressPoolPayment(params: {
    chainId: string,
    stableCoinGroupId: string,
    status: true,
  }): Promise<TMasterPayment[]> {
    const response = await axiosInstance({
      method: 'GET',
      url: `address-pool-payments`,
      params: {
        ...params,
        noPaginate: 1,
      },
    })
    return response.data.data
  }
  async GetAddressPoolPaymentByGroupName(params: {
    chainId: string,
    group: string,
  }): Promise<TMasterPayment> {
    const response = await axiosInstance({
      method: 'GET',
      url: `address-pool-payments/get-by-stable-and-chain`,
      params: {
        ...params,
      },
    })
    return response.data.data
  }
}

const paymentMethod = new PaymentMethod()
export default paymentMethod
