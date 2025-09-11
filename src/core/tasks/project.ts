import { UpsunClient } from "../../upsun.js";
import { ProjectApi, SubscriptionsApi } from "../../apis-gen/index.js";
import { TaskBase } from "./taskBase.js";

export class ProjectTask extends TaskBase {
  private prjApi: ProjectApi;
  private subApi: SubscriptionsApi;
  
  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.prjApi = new ProjectApi(this.client.apiConfig);
    this.subApi = new SubscriptionsApi(this.client.apiConfig);
  }

  async clearBuildCache(projectId: string) {
    return await this.prjApi.actionProjectsClearBuildCache({ projectId });
  }

  async create(organizationId: string, projectRegion: string, projectTitle: string,
      plan: string = "upsun/flexible",
      defaultBranch: string = "main",
      environmentCount: number = 2,
      storage: number = 5) {
    return await this.subApi.createOrgSubscription({
      organizationId,
      createOrgSubscriptionRequest: {
        plan,
        projectRegion,
        projectTitle,
        defaultBranch,
        environments: environmentCount,
        storage
      },
    });
  }

  async delete(projectId: string) {
    return await this.prjApi.deleteProjects({ projectId });
  }

  async get(projectId: string) {
    return await this.prjApi.getProjects({ projectId });
  }

  async getSubscription(organizationId: string, subscriptionId: string) {
    return await this.subApi.getOrgSubscription({organizationId, subscriptionId });
  }

  async info(projectId: string) {
    return await this.prjApi.getProjects({ projectId });
  }

  async list(organizationId: string) {
    return await this.subApi.listOrgSubscriptions({ organizationId });
  }

}
