import { ThirdPartyIntegrationsApi } from '../../api/index.js';
import { AcceptedResponse, Integration, IntegrationCollection } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { IntegrationCreateData } from '../model.js';
import { TaskBase } from './task_base.js';

export class IntegrationsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private thirdPartyIntegrationsApi: ThirdPartyIntegrationsApi,
  ) {
    super(client);
  }

  /**
   * Create a third-party integration for a project. This method allows you to create a new integration for a project by
   * specifying the type of integration and the necessary parameters for that integration.
   * @param projectId - The ID of the project to create the integration for.
   * @param type - The type of integration to create. This should be a valid integration type supported by the API.
   * @param params - An object containing the necessary parameters for the integration. The specific parameters required
   * will depend on the type of integration being created, and may include details such as authentication credentials, 
   * configuration options, and other relevant information.
   * @return An AcceptedResponse indicating that the integration creation request has been accepted. The client should 
   * check the status of the integration through the integration details to confirm whether it was created successfully
   * or if there were any issues.
   * @throws An error if the project ID is invalid, if the integration type is not specified, or if there is an issue 
   * with the API request.
   */
  async createIntegration(
    projectId: string,
    type: string,
    params: IntegrationCreateData,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    if (!type) {
      throw new Error('Integration type is required');
    }

    return await this.thirdPartyIntegrationsApi.createProjectsIntegrations({
      projectId,
      integrationCreateInput: { type, ...params },
    });
  }

  /**
   * Delete a third-party integration from a project. This method allows you to delete an existing integration from a 
   * project.
   * @param projectId - The ID of the project to delete the integration from.
   * @param integrationId - The ID of the integration to delete. This should be a valid identifier for an integration 
   * that is associated with the specified project.
   * @return An AcceptedResponse indicating that the integration deletion request has been accepted. The client should 
   * check the status of the integration through the integration details to confirm whether it was deleted successfully
   * or if there were any issues.
   * @throws An error if the project ID or integration ID is invalid, or if there is an issue with the API request.
   */
  async deleteIntegration(projectId: string, integrationId: string): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);

    return await this.thirdPartyIntegrationsApi.deleteProjectsIntegrations({
      projectId,
      integrationId,
    });
  }

  /**
   * List all third-party integrations for a project. This method retrieves a list of all integrations that are 
   * associated with the specified project.
   * @param projectId - The ID of the project to list integrations for.
   * @return A list of integrations that are associated with the specified project, including details such as the
   * integration type, configuration, and other relevant metadata.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async listIntegrations(projectId: string): Promise<IntegrationCollection> {
    TaskBase.checkProjectId(projectId);

    return await this.thirdPartyIntegrationsApi.listProjectsIntegrations({ projectId });
  }

  /**
   * Get the details of a specific third-party integration for a project. This method retrieves the details of a 
   * specific integration that is associated with the specified project.
   * @param projectId - The ID of the project to get the integration details for.
   * @param integrationId - The ID of the integration to retrieve details for. This should be a valid identifier for an
   * integration that is associated with the specified project.
   * @return The details of the specified integration, including information such as the integration type, 
   * configuration, and other relevant metadata.
   * @throws An error if the project ID or integration ID is invalid, or if there is an issue with the API request.
   */
  async getIntegration(projectId: string, integrationId: string): Promise<Integration> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);

    return await this.thirdPartyIntegrationsApi.getProjectsIntegrations({
      projectId,
      integrationId,
    });
  }

  /**
   * Update an existing third-party integration for a project. This method allows you to update the configuration of an
   * existing integration for a project by specifying the new parameters for that integration.
   * @param projectId - The ID of the project to update the integration for.
   * @param integrationId - The ID of the integration to update. This should be a valid identifier for an integration 
   * that is associated with the specified project.
   * @param type - The type of integration to update. This should be a valid integration type supported by the API.
   * @param params - An object containing the new parameters for the integration. The specific parameters required will 
   * depend on the type of integration being updated, and may include details such as authentication credentials, 
   * configuration options, and other relevant information.
   * @return An AcceptedResponse indicating that the integration update request has been accepted. The client should
   * check the status of the integration through the integration details to confirm whether it was updated successfully
   * or if there were any issues.
   * @throws An error if the project ID or integration ID is invalid, if the integration type is not specified, or if 
   * there is an issue with the API request.
   */
  async updateIntegration(
    projectId: string,
    integrationId: string,
    type: string,
    params: IntegrationCreateData,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkIntegrationId(integrationId);

    if (!type) {
      throw new Error('Integration type is required');
    }

    return await this.thirdPartyIntegrationsApi.updateProjectsIntegrations({
      projectId,
      integrationId,
      integrationPatch: { type, ...params },
    });
  }
}
