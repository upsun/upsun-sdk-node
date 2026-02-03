import { DeploymentApi } from '../../api/index.js';
import { Deployment } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ApplicationsTask extends TaskBase {
  private depApi: DeploymentApi;

  constructor(protected readonly client: UpsunClient) {
    super(client);

    this.depApi = new DeploymentApi(this.client.apiConfig);
  }

  async get(projectId: string, environmentId: string, applicationId: string): Promise<Deployment> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkApplicationId(applicationId);

    return await this.depApi.getProjectsEnvironmentsDeployments({
      projectId,
      environmentId,
      deploymentId: applicationId,
    });
  }

  async list(projectId: string, environmentId: string): Promise<Array<Deployment>> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.depApi.listProjectsEnvironmentsDeployments({ projectId, environmentId });
  }
}
