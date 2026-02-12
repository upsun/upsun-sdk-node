import { DeploymentApi, WorkersValue } from '../../index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class WorkersTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
  ) {
    super(client);
  }

  /**
   * List the configuration of workers for an environment. This method retrieves the current deployment for the 
   * environment and returns the `workers` property from the deployment details, which contains the configuration of 
   * all workers for the environment. The returned object is a mapping of worker names to their respective configuration
   * details.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment.
   * @return A mapping of worker names to their respective configuration details for the specified environment. If there
   * are no workers configured, an empty object will be returned.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue retrieving the deployment
   * details.
   */
  async list(projectId: string, environmentId: string): Promise<{ [key: string]: WorkersValue }> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    return currentDeployment.workers;
  }
}
