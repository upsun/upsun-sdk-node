import { DeploymentApi } from "../../apis-gen/index.js";
import { UpsunClient } from "../../upsun.js";
import { TaskBase } from "./taskBase.js";

export class ApplicationTask extends TaskBase {
  private depApi: DeploymentApi;
  
  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.depApi = new DeploymentApi(this.client.apiConfig);
  }
  
  async get(projectId: string, environmentId: string, applicationId: string) {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkApplicationId(applicationId);

    throw new Error("Not implemented");

  }

  async list(projectId: string, environmentId: string) {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    throw new Error("Not implemented");

    return await this.depApi.listProjectsEnvironmentsDeployments({ projectId, environmentId });
  }
}
