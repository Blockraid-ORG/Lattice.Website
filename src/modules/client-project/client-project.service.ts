import { BaseService } from "@/services/base.service"
import { TFormProject, TProject } from "@/types/project"

class ClientProjectService extends BaseService<TProject, TFormProject> {
  protected endpoint = 'client/project'
}

const clientProjectService = new ClientProjectService()
export default clientProjectService
