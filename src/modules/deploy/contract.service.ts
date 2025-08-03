'use client'

import { TProject } from "@/types/project"
// import axios from "axios"

class ContractService {

  async DEPLOY(data: TProject) {
    return data
  }
}

const contractService = new ContractService()
export default contractService
