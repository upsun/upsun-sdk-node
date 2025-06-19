import { UpsunClient } from "../../upsun.js";
import { ProjectApi, SubscriptionsApi } from "../../apis-gen/index.js";

export class ProjectTask {
  
  constructor(private readonly client: UpsunClient) { }

  async clearBuildCache(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.actionProjectsClearBuildCache({ projectId });
  }

  async create(organizationId: string, projectRegion: string = "eu-3.platform.sh", projectTitle: string, defaultBranch: string = "main") {
    const subApi = new SubscriptionsApi(this.client.apiConfig);
    const subPrj = await subApi.createOrgSubscription({
      organizationId,
      createOrgSubscriptionRequest: { 
        projectRegion,
        projectTitle,
        defaultBranch,
      } });

    return subPrj;
  }

  async delete(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.deleteProjects({ projectId });
  }

  async get(projectId: string) {
    const api = new ProjectApi(this.client.apiConfig);
    return await api.getProjects({ projectId });
  }

  async getSub(organizationId: string, subscriptionId: string) {
    const subApi = new SubscriptionsApi(this.client.apiConfig);
    return await subApi.getOrgSubscription({ organizationId, subscriptionId });
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
