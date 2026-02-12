import { DeploymentApi } from '../../index.js';
import { ServicesValue } from '../../model/ServicesValue.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class ServicesTask extends TaskBase {
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  /**
   * List services for an environment. This method retrieves the current deployment for the environment and returns the
   * `services` property from the deployment details, which contains the configuration of all services for the
   * environment. The returned object is a mapping of service names to their respective configuration details.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @return A mapping of service names to their respective configuration details for the specified environment.
   * If there are no services found in the current deployment, an empty object is returned.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue retrieving the deployment
   * details.
   */
  async list(projectId: string, environmentId: string): Promise<{ [key: string]: ServicesValue }> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    return currentDeployment.services || {};
  }
}
