import { UpsunClient } from "../../upsun.js";
import { ProjectApi, SubscriptionsApi } from "../../apis-gen/index.js";

export class ProjectTask {
  
  constructor(private readonly client: UpsunClient) { }

  async clearBuildCache(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.actionProjectsClearBuildCache({ projectId });
  }

  async create(organizationId: string, projectTitle: string) {
    throw new Error("Not implemented");
  }

  async delete(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.deleteProjects({ projectId });
  }

  async get(projectId: string) {
    throw new Error("Cannot be implemented");
  }

  async info(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.getProjects({ projectId });
  }

  async list(organizationId: string) {
    const api = new SubscriptionsApi(this.client.apiConfig);
    return await api.listOrgSubscriptions({ organizationId });
  }

}
