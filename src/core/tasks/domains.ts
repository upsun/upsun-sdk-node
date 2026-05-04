import { DomainManagementApi } from '../../api/index.js';
import { AcceptedResponse, Domain, DomainCollection, DomainPatch } from '../../model/index.js';
import { UpsunClient } from '../../upsun.js';
import { TaskBase } from './task_base.js';

export class DomainsTask extends TaskBase {
  constructor(
    protected readonly client: UpsunClient,
    private domApi: DomainManagementApi,
  ) {
    super(client);
  }

  /**
   * Add a domain to a project or environment. The API will return a 202 Accepted response if the domain creation
   * request has been accepted and is being processed. However, the client should check the domain's details to confirm
   * whether the creation was successful or not.
   * @param projectId - The ID of the project.
   * @param domain - The domain name to add (e.g., "example.com").
   * @param attributes - (Optional) A key-value map of additional attributes to associate with the domain.
   * @param isDefault - (Optional) Whether to set this domain as the default domain for the project or environment.
   * If true, this domain will be used as the default domain for the project or environment, and any existing default
   * domain will be unset.
   * @param replacementFor - (Optional) The ID of an existing domain that this new domain is replacing. This can be used
   * to indicate that the new domain is intended to replace an existing domain, which may help with tracking and
   * management of domains over time.
   * @param environmentId - (Optional) The ID of the environment to add the domain to.
   * If not provided, the domain will be added at the project level.
   * @returns An AcceptedResponse indicating that the domain creation request has been accepted.
   * @throws An error if the project ID is invalid, if the domain name is missing or invalid,
   * or if there is an issue with the API request.
   */
  async add(
    projectId: string,
    domain: string,
    attributes?: { [key: string]: string },
    isDefault?: boolean,
    replacementFor?: string,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);

    if (!domain) {
      throw new Error('Domain must be a non-empty string');
    }

    const domainCreateInput = { name: domain, attributes, isDefault, replacementFor };

    if (!environmentId) {
      return await this.domApi.createProjectsDomains({ projectId, domainCreateInput });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.createProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainCreateInput,
      });
    }
  }

  /**
   * Delete a domain from a project or environment. The API will return a 202 Accepted response if the deletion request
   * has been accepted and is being processed. However, the client should check the domain's details to confirm whether
   * the deletion was successful or not.
   * @param projectId - The ID of the project.
   * @param domainId - The ID of the domain to delete.
   * @param environmentId - (Optional) The ID of the environment to delete the domain from. If not provided, the domain
   * will be deleted from the project level.
   * @returns An AcceptedResponse indicating that the domain deletion request has been accepted.
   * @throws An error if the project ID or domain ID is invalid, or if there is an issue with the API request.
   */
  async delete(
    projectId: string,
    domainId: string,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.deleteProjectsDomains({ projectId, domainId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.deleteProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
      });
    }
  }

  /**
   * Get the details of a domain for a project or environment.
   * @param projectId - The ID of the project.
   * @param domainId - The ID of the domain to retrieve.
   * @param environmentId - (Optional) The ID of the environment to retrieve the domain from. If not provided, the
   * domain will be retrieved from the project level.
   * @return The details of the specified domain.
   * @throws An error if the project ID or domain ID is invalid, or if there is an issue with the API request.
   */
  async get(projectId: string, domainId: string, environmentId?: string): Promise<Domain> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.getProjectsDomains({ projectId, domainId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.getProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
      });
    }
  }

  /**
   * List the domains for a project or environment. The returned list is ordered by creation date, with the most recent
   * domain appearing first in the list.
   * @param projectId - The ID of the project.
   * @param environmentId - (Optional) The ID of the environment to list the domains for.
   * If not provided, the domains for the entire project will be listed.
   * @returns A list of domains for the specified project or environment.
   * @throws An error if the project ID is invalid, or if there is an issue with the API request.
   */
  async list(projectId: string, environmentId?: string): Promise<DomainCollection> {
    TaskBase.checkProjectId(projectId);

    if (!environmentId) {
      return await this.domApi.listProjectsDomains({ projectId });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.listProjectsEnvironmentsDomains({ projectId, environmentId });
    }
  }

  /**
   * Update a domain for a project or environment. The API will return a 202 Accepted response if the update request has
   * been accepted and is being processed. However, the client should check the domain's details to confirm whether the
   * update was successful or not.
   * @param projectId - The ID of the project.
   * @param domainId - The ID of the domain to update.
   * @param params - The parameters to update for the domain.
   * @param environmentId - (Optional) The ID of the environment to update the domain for. If not provided, the domain
   * will be updated at the project level.
   * @returns An AcceptedResponse indicating that the domain update request has been accepted.
   * @throws An error if the project ID or domain ID is invalid, or if there is an issue with the API request.
   */
  async update(
    projectId: string,
    domainId: string,
    domainPatch: DomainPatch,
    environmentId?: string,
  ): Promise<AcceptedResponse> {
    TaskBase.checkProjectId(projectId);
    TaskBase.checkDomainId(domainId);

    if (!environmentId) {
      return await this.domApi.updateProjectsDomains({
        projectId,
        domainId,
        domainPatch: domainPatch || {},
      });
    } else {
      TaskBase.checkEnvironmentId(environmentId);
      return await this.domApi.updateProjectsEnvironmentsDomains({
        projectId,
        environmentId,
        domainId,
        domainPatch: domainPatch || {},
      });
    }
  }
}
