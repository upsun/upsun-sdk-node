import { MountsValue } from '../../model/MountsValue.js';
import { UpsunClient } from '../../upsun.js';
import { DeploymentResourceGroup } from '../model.js';
import { TaskBase } from './task_base.js';

export class MountsTask extends TaskBase {
  constructor(protected readonly client: UpsunClient) {
    super(client);
  }

  /**
   * List the mounts for a specific project and resource type.
   * This method retrieves the mounts for a specific project and resource type (webapps, services, or workers).
   * It returns a record where the keys are the application names and the values are mount definitions associated
   * with each application.
   * @param projectId - The ID of the project to list mounts for.
   * @param environmentId - The ID of the environment to list mounts for. This defaults to 'main' if not provided.
   * @param type - The type of resource to list mounts for. This can be 'webapps', 'services', or 'workers'. If not
   * provided, mounts for all resource types will be listed.
   * @return A record where the keys are application names and the values are mount definitions associated with each
   * application. If there are no mounts for the specified project and resource type, an empty record is returned.
   * @throws An error if the project ID or resource type is invalid, or if there is an issue with the API request.
   */
  async list(
    projectId: string,
    environmentId: string = 'main',
    filterType?: DeploymentResourceGroup,
  ): Promise<Record<string, { [key: string]: MountsValue }>> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    const result: Record<string, { [key: string]: MountsValue }> = {};
    const resourceTypes = filterType ? [filterType] : Object.values(DeploymentResourceGroup);

    for (const resourceType of resourceTypes) {
      const group = currentDeployment[resourceType] ?? {};
      for (const app of Object.values(group)) {
        const appName = app.name ?? app.id;
        if (!appName) {
          continue;
        }
        result[appName] = app.mounts ?? {};
      }
    }

    return result;
  }

  async download(projectId: string, mountId: string): Promise<never> {
    throw new Error('Cannot be implemented');
  }

  async upload(projectId: string, mountId: string, params: []): Promise<never> {
    throw new Error('Cannot be implemented');
  }
}
