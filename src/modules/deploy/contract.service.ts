'use client'

import vanitiClient from "@/lib/vanityClient"
import { TFormPredictVanity, TProject, TResponsePredict } from "@/types/project"
// import axios from "axios"

class ContractService {
  async DEPLOY(data: TProject) {
    return data
  }
  async PREDICT_VANITY(data: TFormPredictVanity): Promise<TResponsePredict> {
    const response = await vanitiClient({
      method: 'POST',
      url: `predict`,
      data: data
    })
    return response.data
  }
}

const contractService = new ContractService()
export default contractService
