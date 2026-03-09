import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';
import { AutoscalingApi, DeploymentApi } from '../../api/index.js';
import {
  AcceptedResponse,
  AutoscalerSettings,
  Resources,
  UpdateProjectsEnvironmentsDeploymentsNextRequestServicesValue,
  UpdateProjectsEnvironmentsDeploymentsNextRequestWebappsValue,
  UpdateProjectsEnvironmentsDeploymentsNextRequestWorkersValue,
} from '../../index.js';
import { DeploymentResourceGroup } from '../model.js';

export class ResourcesTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private deploymentApi: DeploymentApi,
    private autoscalingApi: AutoscalingApi,
  ) {
    super(client);
  }

  /**
   * Get the resource configuration for a specific application in the current deployment of an environment.
   * This method retrieves the resource configuration for a specific application (webapp, service, or worker) in the
   * current deployment of an environment.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the resource configuration for.
   * @param type - The type of application to get the resource configuration for. This should be one of 'webapps',
   * 'services', or 'workers' depending on the type of application you want to retrieve the resources for.
   * @param app - The name of the application to get the resource configuration for. This should be the name of a
   * specific application within the specified type.
   * @return The resource configuration for the specified application in the current deployment of the environment. This
   * includes details such as the profile size, disk space, and instance count for the application. If the application
   * is not found, an empty object is returned.
   * @throws An error if the project ID, environment ID, type, or app name is invalid, or if there is an issue with the
   * API request.
   */
  async get(
    projectId: string,
    environmentId: string,
    type: DeploymentResourceGroup = DeploymentResourceGroup.webapps,
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
   * Only include the entries you actually want to change; the API merges the provided settings into the next deployment
   * draft.
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
        webapps,
        services,
        workers,
      },
    });
  }

  /**
   * Get the autoscaler settings for the environment. Autoscaling allows the environment to automatically scale its
   * resources up or down based on the current load and traffic. The autoscaler settings include information about
   * whether autoscaling is enabled, the addresses that are being autoscaled, and any authentication settings for the
   * autoscaler services.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to get the autoscaler settings for.
   * @return The autoscaler settings for the specified environment.
   * @throws An error if the project ID or environment ID is invalid, or if there is an issue with the API request.
   */
  async getAutoscalerSettings(
    projectId: string,
    environmentId: string,
  ): Promise<AutoscalerSettings> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.autoscalingApi.getAutoscalerSettings({
      projectId,
      environmentId,
    });
  }

  /**
   * Update the autoscaler settings for the environment. Autoscaling allows the environment to automatically scale its
   * resources up or down based on the current load and traffic. The autoscaler settings include information about
   * whether autoscaling is enabled, the addresses that are being autoscaled, and any authentication settings for the
   * autoscaler services. Updating the autoscaler settings will allow you to enable or disable autoscaling, change the
   * addresses that are being autoscaled, and update the authentication settings for the autoscaler services.
   * @param projectId - The ID of the project.
   * @param environmentId - The ID of the environment to update the autoscaler settings for.
   * @param params - The new autoscaler settings for the environment.
   * @return The updated autoscaler settings for the environment.
   * @throws An error if the project ID or environment ID is invalid, if the parameters are invalid, or if there is an
   * issue with the API request.
   */
  async updateAutoscalerSettings(
    projectId: string,
    environmentId: string,
    autoscalerSettings?: AutoscalerSettings,
  ): Promise<AutoscalerSettings> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkEnvironmentId(environmentId);

    return await this.autoscalingApi.postAutoscalerSettings({
      projectId,
      environmentId,
      autoscalerSettings,
    });
  }
}
