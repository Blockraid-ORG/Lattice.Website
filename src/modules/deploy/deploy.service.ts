'use client'
import axiosInstance from "@/lib/axios"
import { BaseService } from "@/services/base.service"
import { TFormVerifyProject } from "@/types/deploy"
import { TProject } from "@/types/project"

class DeployService extends BaseService<TProject, TFormVerifyProject> {
  protected endpoint = 'project-verifications'
  async DEPLOY(data: {
    projectId: string
    status: string,
    note: string
  }) {
    const response = await axiosInstance({
      method: 'POST',
      url: this.endpoint,
      data
    })
    return response.data.data
  }
}

const deployService = new DeployService()
export default deployService
