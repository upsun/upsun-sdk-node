import { DeploymentApi } from '../../api/index.js';
import { Deployment, WebApplicationsValue } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ApplicationsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private depApi: DeploymentApi,
  ) {
    super(client);
  }

  async configGet(projectId: string, environmentId: string, applicationId: string): Promise<WebApplicationsValue> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkApplicationId(applicationId);

    const webapps = await this.list(projectId, environmentId);
    return webapps[applicationId] || null;
  }

  async list(projectId: string, environmentId: string): Promise<{[key: string]: WebApplicationsValue}> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    const deployment = await this.depApi.getProjectsEnvironmentsDeployments({
      projectId,
      environmentId,
      deploymentId: 'current',
    });

    return deployment.webapps;
  }
}
