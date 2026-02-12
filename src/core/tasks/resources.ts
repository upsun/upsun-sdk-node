import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
import { DeploymentApi } from '../../api/index.js';
import {
  AcceptedResponse,
  Resources,
  UpdateProjectsEnvironmentsDeploymentsNextRequestServicesValue,
  UpdateProjectsEnvironmentsDeploymentsNextRequestWebappsValue,
  UpdateProjectsEnvironmentsDeploymentsNextRequestWorkersValue,
} from '../../index.js';

interface ResourceApiPlaceholder {
  getNextDeployement: (params: { projectId: string; environmentId: string }) => Promise<unknown>;
}

type DeploymentResourceGroup = 'webapps' | 'services' | 'workers';

export class ResourcesTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private deploymentApi: DeploymentApi,
  ) {
    super(client);
  }

  async get(
    projectId: string,
    environmentId: string,
    type: DeploymentResourceGroup = 'webapps',
    app: string = 'app',
  ): Promise<Resources> {
    const currentDeployment = await this.client.environments.getDeployment(
      projectId,
      environmentId,
      'current',
    );

    if (!currentDeployment) {
      return {} as Resources;
    }
    const group = currentDeployment[type] ?? {};

    return group[app]?.resources ?? ({} as Resources);
  }

  /**
   * Update the next deployment’s resource config.
   *
   * @param projectId Upsun project ID.
   * @param environmentId Environment slug (e.g., `main`).
   * @param webapps map of `<appName> => { resources?: { profileSize?: string }, disk?: number, instanceCount?: number }`
   * @param services map of `<appName> => { resources?: { profileSize?: string }, disk?: number }`
   * @param workers map of `<appName> => { resources?: { profileSize?: string }, instanceCount?: number }`
   *
   * Only include the entries you actually want to change; the API merges the provided settings into the next deployment draft.
   */
  async set(
    projectId: string,
    environmentId: string,
    webapps: {
      [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestWebappsValue;
    } = {} as { [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestWebappsValue },
    services: {
      [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestServicesValue;
    } = {} as { [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestServicesValue },
    workers: {
      [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestWorkersValue;
    } = {} as { [key: string]: UpdateProjectsEnvironmentsDeploymentsNextRequestWorkersValue },
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.deploymentApi.updateProjectsEnvironmentsDeploymentsNext({
      projectId,
      environmentId,
      updateProjectsEnvironmentsDeploymentsNextRequest: {
        webapps: webapps,
        services: services,
        workers: workers,
      },
    });
  }
}
