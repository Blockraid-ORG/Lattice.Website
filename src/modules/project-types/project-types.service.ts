import { BaseService } from "@/services/base.service"
import { TProjectType } from "@/types/project-type"

class ProjectTypeService extends BaseService<TProjectType> {
  protected endpoint = 'project-types'
}

const projectTypeService = new ProjectTypeService()
export default projectTypeService
