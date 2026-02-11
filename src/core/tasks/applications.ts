import { DeploymentApi } from '../../api/index.js';
import { WebApplicationsValue } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ApplicationsTask extends TaskBase {
  
  constructor(
    protected readonly client: UpsunClient,
    private depApi: DeploymentApi,
  ) {
    super(client);
  }

  /**
   * Get the configuration of web applications for an environment. This method is a shortcut for getting the current 
   * deployment for the environment and returning the `webapps` property from the deployment details. 
   * If you need to access other properties from the deployment, you can use the `list()` method to get the full 
   * deployment details instead, and then access the `webapps` property from there.
   */
  async configGet(projectId: string, environmentId: string, applicationId: string): Promise<WebApplicationsValue> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);
    TaskBase.checkApplicationId(applicationId);

    const webapps = await this.list(projectId, environmentId);
    return webapps[applicationId] || null;
  }

  /**
   * List the configuration of web applications for an environment. This method retrieves the current deployment for the 
   * environment and returns the `webapps` property from the deployment details, which contains the configuration of all 
   * web applications for the environment. The returned object is a mapping of application IDs to their respective 
   * configuration details.
   */
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
