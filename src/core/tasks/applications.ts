import { DeploymentApi } from '../../api/index.js';
import { WebApplicationsValue } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ApplicationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
  ) {
    super(client);
  }

  /**
   * Get the configuration of web applications for an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @param applicationId - The ID of the application to retrieve the configuration for.
   * @returns The configuration details for the specified web application, or null if the application is not found in
   * the current deployment.
   * @throws An error if the project ID, environment ID, or application ID is invalid,
   * or if there is an issue retrieving the deployment details.
   */
  async configGet(
    projectId: string,
    environmentId: string,
    applicationId: string,
  ): Promise<WebApplicationsValue> {
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
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @returns A mapping of application IDs to their respective configuration details for the specified environment.
   * @throws An error if the project ID or environment ID is invalid,
   * or if there is an issue retrieving the deployment details.
   */
  async list(
    projectId: string,
    environmentId: string,
  ): Promise<{ [key: string]: WebApplicationsValue }> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    return currentDeployment.webapps || {};
  }
}
